import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from '@langchain/google-genai';
import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { Product } from '../products/entities/product.entity';
import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';

@Injectable()
export class AiService implements OnModuleInit {
  private vectorStore: MemoryVectorStore;
  private chatModel: ChatGoogleGenerativeAI;
  private readonly logger = new Logger(AiService.name);

  constructor(
    private configService: ConfigService,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    private dataSource: DataSource,
  ) {}

  async onModuleInit() {
    try {
      const apiKey = this.configService.get<string>('GOOGLE_API_KEY');
      if (!apiKey) {
        this.logger.warn('GOOGLE_API_KEY missing. AI disabled.');
        return;
      }

      this.chatModel = new ChatGoogleGenerativeAI({
        apiKey,
        model: 'gemini-2.5-flash',
        temperature: 0,
      });

      const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey,
        model: 'gemini-embedding-001',
      });

      const allDocs = await this.loadAllDocuments();

      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 50,
      });

      const splitDocs = await splitter.splitDocuments(allDocs);
      this.vectorStore = await MemoryVectorStore.fromDocuments(
        splitDocs,
        embeddings,
      );
      this.logger.debug(
        `Vector store ready. ${splitDocs.length} chunks loaded.`,
      );
    } catch (error) {
      this.logger.error(
        'Failed to initialize AI Service:',
        error instanceof Error ? error.message : error,
      );
    }
  }

  /**
   * Load docs from 2 sources:
   * 1. Static .txt files in knowledge/ folder
   * 2. Products from DB
   */
  private async loadAllDocuments(): Promise<Document[]> {
    const docs: Document[] = [];

    // --- Source 1: Knowledge files ---
    const knowledgeDir = path.join(__dirname, 'knowledge');
    if (fs.existsSync(knowledgeDir)) {
      const files = fs
        .readdirSync(knowledgeDir)
        .filter((f) => f.endsWith('.txt'));
      for (const file of files) {
        const content = fs.readFileSync(path.join(knowledgeDir, file), 'utf-8');
        docs.push(
          new Document({
            pageContent: content,
            metadata: { source: file },
          }),
        );
        this.logger.debug(`Loaded knowledge file: ${file}`);
      }
    }

    // --- Source 2: Products from DB ---
    const products = await this.productRepo.find({
      relations: ['genre', 'author', 'publisher'],
    });

    for (const p of products) {
      const text = [
        `Sách: ${p.title}`,
        `Giá: ${Number(p.price).toLocaleString('vi-VN')}đ`,
        `Thể loại: ${p.genre?.name ?? 'N/A'}`,
        `Tác giả: ${p.author?.name ?? 'N/A'}`,
        `NXB: ${p.publisher?.name ?? 'N/A'}`,
        `Năm: ${p.year}`,
        `Đánh giá: ${p.rating}/5 (${p.reviewCount} reviews)`,
        `Mô tả: ${p.description}`,
      ].join('\n');

      docs.push(
        new Document({
          pageContent: text,
          metadata: { source: 'database', productId: p.id },
        }),
      );
    }

    this.logger.debug(
      `Total docs: ${docs.length} (files: ${docs.filter((d) => d.metadata.source !== 'database').length}, products: ${products.length})`,
    );

    return docs;
  }

  /** Re-index: reload all docs. Call from admin endpoint. */
  async reindex(): Promise<{ chunks: number }> {
    if (!this.chatModel) {
      return { chunks: 0 };
    }

    const apiKey = this.configService.get<string>('GOOGLE_API_KEY');
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey,
      model: 'gemini-embedding-001',
    });

    const allDocs = await this.loadAllDocuments();
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50,
    });
    const splitDocs = await splitter.splitDocuments(allDocs);

    this.vectorStore = await MemoryVectorStore.fromDocuments(
      splitDocs,
      embeddings,
    );

    this.logger.debug(`Re-indexed. ${splitDocs.length} chunks.`);
    return { chunks: splitDocs.length };
  }

  async chat(
    question: string,
    history: { role: string; text: string }[] = [],
  ): Promise<string> {
    if (!this.vectorStore || !this.chatModel) {
      return 'AI not ready (missing GOOGLE_API_KEY).';
    }

    // 1. Initial prompt
    const systemTemplate = `Bạn là trợ lý AI của cửa hàng sách DreamBook.
Bạn có khả năng truy vấn database để trả lời các câu hỏi về thống kê, số lượng, hoặc tìm kiếm nâng cao.
Thông tin các bảng:
- product: id, title, price, "soldCount", rating, stock, description, year, "genreId", "authorId", "publisherId"
- genre: id, name
- author: id, name
- publisher: id, name
- coupon: id, code, discount, type, description, minimum, "startDate", "expiryDate"

Lưu ý quan trọng: Vì dùng PostgreSQL nên CÁC CỘT CÓ CHỮ HOA (camelCase) BẮT BUỘC PHẢI BỌC TRONG NGOẶC KÉP. 
Ví dụ: SELECT "soldCount", "genreId" FROM product. Không được viết SELECT soldCount.

Nếu câu hỏi cần số liệu chính xác (ví dụ: "có bao nhiêu sách...", "sách nào bán chạy nhất..."), hãy trả lời DUY NHẤT một đoạn JSON có định dạng sau:
\`\`\`json
{{
  "action": "queryDatabase",
  "sql": "câu lệnh SELECT SQL"
}}
\`\`\`
Tuyệt đối không giải thích thêm nếu bạn cần chạy SQL.

Nếu câu hỏi về chính sách, địa chỉ, hoặc tư vấn chung, hãy dùng thông tin từ context dưới đây:
Context: {context}

Nếu bạn đã có kết quả SQL (được cung cấp ở tin nhắn trước), hãy dựa vào đó để trả lời khách hàng.
Trả lời bằng tiếng Việt, thân thiện, ngắn gọn.`;

    const retriever = this.vectorStore.asRetriever();
    const contextDocs = await retriever.invoke(question);
    const contextText = contextDocs.map((d) => d.pageContent).join('\n---\n');

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', systemTemplate],
      ['user', '{input}'],
    ]);

    const messages = await prompt.formatMessages({
      context: contextText,
      input: question,
    });

    // 2. Insert history before the last user message
    if (history.length > 0) {
      const historyMessages = history.map((msg) =>
        msg.role === 'model'
          ? new AIMessage(msg.text)
          : new HumanMessage(msg.text),
      );
      // Insert right after the SystemMessage (index 0)
      messages.splice(1, 0, ...historyMessages);
    }

    let response = await this.chatModel.invoke(messages);
    let content = response.content as string;

    // 3. Handle simulated tool calling
    const jsonMatch = content.match(/```json\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch) {
      try {
        const actionObj = JSON.parse(jsonMatch[1]);
        if (actionObj.action === 'queryDatabase' && actionObj.sql) {
          const sql = actionObj.sql;
          this.logger.debug(`AI requested SQL via JSON: ${sql}`);

          const data = await this.executeSql(sql);
          this.logger.debug(
            `SQL Result: ${JSON.stringify(data).slice(0, 100)}...`,
          );

          // Append the result to the conversation and call model again
          messages.push(response);
          messages.push(
            new HumanMessage(
              `Kết quả từ queryDatabase:\n${JSON.stringify(
                data,
              )}\nHãy trả lời khách hàng dựa trên kết quả này.`,
            ),
          );

          response = await this.chatModel.invoke(messages);
          content = response.content as string;
        }
      } catch (error) {
        this.logger.error(
          'SQL JSON Parse/Execute Error:',
          error instanceof Error ? error.message : error,
        );
        return `Tôi gặp lỗi khi truy vấn dữ liệu: ${error instanceof Error ? error.message : error}`;
      }
    }

    // Clean up any stray markdown if the model didn't format perfectly but answered
    return content;
  }

  /**
   * Safe SQL Query for analytical questions.
   * Only allows SELECT queries on safe tables.
   */
  async executeSql(sql: string): Promise<any> {
    const forbidden = [
      'insert',
      'update',
      'delete',
      'drop',
      'truncate',
      'alter',
      'create',
      'grant',
      'revoke',
    ];
    const lowerSql = sql.toLowerCase().trim();

    if (!lowerSql.startsWith('select')) {
      throw new Error('Only SELECT queries are allowed.');
    }

    for (const word of forbidden) {
      if (lowerSql.includes(word)) {
        throw new Error(`Forbidden keyword detected: ${word}`);
      }
    }

    // Strict check: only allow querying specific public tables
    const allowedTables = ['product', 'genre', 'author', 'publisher', 'coupon'];
    const tableRegex = /(?:from|join)\s+["']?([a-z0-9_]+)["']?/g;
    let match;
    while ((match = tableRegex.exec(lowerSql)) !== null) {
      const tableName = match[1];
      if (!allowedTables.includes(tableName)) {
        throw new Error(
          `Access to table '${tableName}' is forbidden. Only [${allowedTables.join(
            ', ',
          )}] are allowed.`,
        );
      }
    }

    // Extra safety: explicitly block 'review' if the model tries to mention it anywhere
    if (lowerSql.includes('review')) {
      throw new Error('Access to review data is forbidden.');
    }

    return this.dataSource.query(sql);
  }
}

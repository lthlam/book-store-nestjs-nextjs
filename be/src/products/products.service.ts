import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Product } from './entities/product.entity';
import { Author } from '../authors/entities/author.entity';
import { Genre } from '../genres/entities/genre.entity';
import { Publisher } from '../publishers/entities/publisher.entity';
import { ProductRepository, ProductFilterOptions } from './product.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import csv from 'csv-parser';
import { Readable } from 'stream';
import { UploadsService } from '../uploads/uploads.service';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    private readonly productRepo: ProductRepository,
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
    @InjectRepository(Publisher)
    private readonly publisherRepository: Repository<Publisher>,
    private readonly uploadsService: UploadsService,
  ) {}

  findAll(
    sort?: string,
    order?: 'ASC' | 'DESC',
    limit = 20,
    page = 1,
    genreId?: string,
    excludeId?: string,
    search?: string,
    genreIds?: string[],
    authorIds?: string[],
    publisherIds?: string[],
    minPrice?: number,
    maxPrice?: number,
    rating?: number,
    isSpecial?: boolean,
  ) {
    const opts: ProductFilterOptions = {
      sort,
      order,
      limit,
      page,
      genreId,
      excludeId,
      search,
      genreIds,
      authorIds,
      publisherIds,
      minPrice,
      maxPrice,
      rating,
      isSpecial,
    };
    return this.productRepo.findWithFilters(opts);
  }

  findOne(id: string) {
    return this.productRepo.findById(id);
  }

  findByIds(ids: string[]) {
    return this.productRepo.findByIds(ids);
  }

  async create(dto: CreateProductDto) {
    const { genreId, authorId, publisherId, ...rest } = dto;
    const entity = this.productRepo.create({
      ...rest,
      ...(genreId ? { genre: { id: genreId } as any } : {}),
      ...(authorId ? { author: { id: authorId } as any } : {}),
      ...(publisherId ? { publisher: { id: publisherId } as any } : {}),
    });
    const saved = await this.productRepo.save(entity as Product);
    this.logger.log(`Product created: ${(saved as Product).id}`);
    return saved;
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.productRepo.findById(id);
    if (!product) throw new NotFoundException('Product not found');

    const { genreId, authorId, publisherId, ...rest } = dto;
    Object.assign(product, rest);
    if (genreId) product.genre = { id: genreId } as any;
    if (authorId) product.author = { id: authorId } as any;
    if (publisherId) product.publisher = { id: publisherId } as any;

    return this.productRepo.save(product);
  }

  remove(id: string) {
    return this.productRepo.softDelete(id);
  }

  async bulkCreateFromCsv(files: any[]) {
    if (!files || files.length === 0) throw new Error('No files uploaded');

    const csvFile = files.find((f) =>
      f.originalname.toLowerCase().endsWith('.csv'),
    );
    if (!csvFile) throw new Error('No CSV file found');

    const imageFiles = files.filter((f) => f !== csvFile);
    const firstLine = csvFile.buffer.toString().split('\n')[0];
    const separator =
      firstLine.includes(';') && !firstLine.includes(',') ? ';' : ',';

    const results: any[] = [];
    const stream = Readable.from(csvFile.buffer);

    return new Promise((resolve, reject) => {
      stream
        .pipe(
          csv({
            separator,
            mapHeaders: ({ header }) => header.trim().toLowerCase(),
            mapValues: ({ value }) => value.trim(),
          }),
        )
        .on('data', (data) => {
          const isEmpty = Object.values(data).every(
            (v) => v === '' || v === null || v === undefined,
          );
          if (!isEmpty) results.push(data);
        })
        .on('end', async () => {
          try {
            const createdProducts: Product[] = [];
            const authorCache = new Map<string, any>();
            const genreCache = new Map<string, any>();
            const publisherCache = new Map<string, any>();
            const uploadedImagesCache = new Map<string, string>();

            for (const row of results) {
              const {
                title,
                price,
                year,
                description,
                image,
                special,
                author,
                genre,
                publisher,
              } = row;
              if (!title || !price) continue;

              let finalImageUrl = image;
              if (image && !image.startsWith('http')) {
                const match = imageFiles.find((f) => f.originalname === image);
                if (match) {
                  if (uploadedImagesCache.has(image)) {
                    finalImageUrl = uploadedImagesCache.get(image);
                  } else {
                    const uploadResult =
                      await this.uploadsService.uploadImage(match);
                    finalImageUrl = uploadResult.url;
                    uploadedImagesCache.set(image, finalImageUrl);
                  }
                }
              }

              let authorEntity = null;
              if (author) {
                const key = author.trim().toLowerCase();
                if (authorCache.has(key)) {
                  authorEntity = authorCache.get(key);
                } else {
                  authorEntity = await this.authorRepository.findOne({
                    where: { name: ILike(author.trim()) },
                  });
                  if (!authorEntity) {
                    authorEntity = await this.authorRepository.save(
                      this.authorRepository.create({ name: author.trim() }),
                    );
                  }
                  authorCache.set(key, authorEntity);
                }
              }

              let genreEntity = null;
              if (genre) {
                const key = genre.trim().toLowerCase();
                if (genreCache.has(key)) {
                  genreEntity = genreCache.get(key);
                } else {
                  genreEntity = await this.genreRepository.findOne({
                    where: { name: ILike(genre.trim()) },
                  });
                  if (!genreEntity) {
                    genreEntity = await this.genreRepository.save(
                      this.genreRepository.create({ name: genre.trim() }),
                    );
                  }
                  genreCache.set(key, genreEntity);
                }
              }

              let publisherEntity = null;
              if (publisher) {
                const key = publisher.trim().toLowerCase();
                if (publisherCache.has(key)) {
                  publisherEntity = publisherCache.get(key);
                } else {
                  publisherEntity = await this.publisherRepository.findOne({
                    where: { name: ILike(publisher.trim()) },
                  });
                  if (!publisherEntity) {
                    publisherEntity = await this.publisherRepository.save(
                      this.publisherRepository.create({
                        name: publisher.trim(),
                      }),
                    );
                  }
                  publisherCache.set(key, publisherEntity);
                }
              }

              createdProducts.push(
                this.productRepo.create({
                  title,
                  price: Number(price),
                  year: year ? Number(year) : null,
                  description,
                  image: finalImageUrl,
                  special: special === 'true' || special === '1',
                  author: authorEntity,
                  genre: genreEntity,
                  publisher: publisherEntity,
                }),
              );
            }

            const saved = (await this.productRepo.save(
              createdProducts,
            )) as Product[];
            this.logger.log(`Bulk upload: ${saved.length} products created`);
            resolve({
              success: true,
              count: saved.length,
              message: `Successfully uploaded ${saved.length} products.`,
            });
          } catch (err) {
            this.logger.error(
              `Bulk upload error: ${(err as any).message}`,
              (err as any).stack,
            );
            reject(err);
          }
        })
        .on('error', (err) => reject(err));
    });
  }

  async updateStock(id: string, quantity: number) {
    const product = await this.productRepo.findById(id);
    if (!product) throw new NotFoundException('Product not found');
    product.stock = product.stock - quantity;
    if (product.stock < 0) product.stock = 0;
    return this.productRepo.save(product);
  }
}

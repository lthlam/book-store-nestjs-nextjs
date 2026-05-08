import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { Public } from '../auth/decorators/public.decorator';
import { Roles, Role } from '../auth/decorators/roles.decorator';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Public()
  @Post('chat')
  @ApiOperation({ summary: 'Ask AI a question via RAG' })
  async chat(
    @Body('message') message: string,
    @Body('history') history?: { role: string; text: string }[],
  ) {
    if (!message) {
      return { answer: 'Message is required' };
    }
    const answer = await this.aiService.chat(message, history);
    return { answer };
  }

  @Post('reindex')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Re-index knowledge base (admin only)' })
  async reindex() {
    const result = await this.aiService.reindex();
    return { message: `Re-indexed successfully`, chunks: result.chunks };
  }
}

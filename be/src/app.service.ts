import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);

  constructor(private dataSource: DataSource) {}

  async onModuleInit() {
    try {
      await this.dataSource.query('CREATE EXTENSION IF NOT EXISTS unaccent');
      this.logger.log('PostgreSQL extension "unaccent" enabled');
    } catch (e) {
      this.logger.error(
        'Failed to enable unaccent extension',
        (e as any).message,
      );
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}

import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private dataSource: DataSource) {}

  async onModuleInit() {
    try {
      await this.dataSource.query('CREATE EXTENSION IF NOT EXISTS unaccent');
      console.log('PostgreSQL extension "unaccent" enabled');
    } catch (e) {
      console.error('Failed to enable unaccent extension:', e.message);
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}

import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * DataSource dùng cho TypeORM CLI (migration:generate, migration:run, migration:revert).
 * Không dùng trong runtime app — app dùng TypeOrmModule.forRootAsync() trong app.module.ts.
 *
 * Cách dùng:
 *   npm run migration:generate -- src/migrations/MigrationName
 *   npm run migration:run
 *   npm run migration:revert
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number(process.env.DATABASE_PORT) || 5432,
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'book-store',
  ssl: process.env.NODE_ENV === 'production' ? true : false,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false, // KHÔNG BAO GIỜ dùng true trong production
  migrationsRun: false,
});

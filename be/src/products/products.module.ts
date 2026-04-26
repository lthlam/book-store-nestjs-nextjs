import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductController } from './products.controller';
import { ProductService } from './products.service';
import { Author } from '../authors/entities/author.entity';
import { Genre } from '../genres/entities/genre.entity';
import { Publisher } from '../publishers/entities/publisher.entity';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Author, Genre, Publisher]),
    UploadsModule,
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}

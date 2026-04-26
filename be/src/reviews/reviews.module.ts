import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Review } from './entities/review.entity';
import { Order } from '../orders/entities/order.entity';
import { Product } from '../products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Order, Product])],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}

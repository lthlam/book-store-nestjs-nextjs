import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { Order } from '../orders/entities/order.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async checkEligibility(productId: string, userId: string) {
    // 1. Check if already reviewed
    const existingReview = await this.reviewRepository.findOne({
      where: { product: { id: productId } as any, user: { id: userId } as any },
    });
    if (existingReview) {
      return { eligible: false, reason: 'ALREADY_REVIEWED' };
    }

    // 2. Check if user has bought the product and it is delivered
    const orders = await this.orderRepository.find({
      where: { user: { id: userId } as any, status: 'delivered' },
    });

    let hasBought = false;
    for (const order of orders) {
      if (
        order.orderDetails &&
        order.orderDetails.some((item: any) => item.productId === productId)
      ) {
        hasBought = true;
        break;
      }
    }

    if (!hasBought) {
      return { eligible: false, reason: 'NOT_PURCHASED' };
    }

    return { eligible: true };
  }

  async create(dto: CreateReviewDto) {
    const { eligible, reason } = await this.checkEligibility(
      dto.productId,
      dto.userId,
    );

    if (!eligible) {
      if (reason === 'ALREADY_REVIEWED') {
        throw new BadRequestException('Bạn đã đánh giá sản phẩm này rồi.');
      }
      throw new ForbiddenException(
        'Chỉ khách hàng đã mua và nhận thành công mới được đánh giá.',
      );
    }

    const review = this.reviewRepository.create({
      rating: dto.rating,
      comment: dto.comment,
      product: { id: dto.productId } as any,
      user: { id: dto.userId } as any,
    });

    const saved = await this.reviewRepository.save(review);
    await this.updateProductRating(dto.productId);
    return saved;
  }

  async updateProductRating(productId: string) {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .where('review.productId = :id', { id: productId })
      .select('AVG(review.rating)', 'avgRating')
      .addSelect('COUNT(review.id)', 'count')
      .getRawOne();

    const avg = parseFloat(result.avgRating) || 0;
    const count = parseInt(result.count) || 0;

    await this.productRepository.update(productId, {
      rating: Math.round(avg * 10) / 10,
      reviewCount: count,
    });
  }

  async remove(id: string, userId: string) {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['user', 'product'],
    });

    if (!review) {
      throw new NotFoundException('Không tìm thấy đánh giá.');
    }

    if (review.user.id !== userId) {
      throw new ForbiddenException('Bạn không có quyền xoá đánh giá này.');
    }

    const productId = review.product.id;
    await this.reviewRepository.remove(review);
    await this.updateProductRating(productId);

    return { message: 'Xoá đánh giá thành công' };
  }

  async findByProduct(productId: string) {
    return this.reviewRepository.find({
      where: { product: { id: productId } as any },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }
}

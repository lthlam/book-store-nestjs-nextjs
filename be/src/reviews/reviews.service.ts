import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewRepository } from './review.repository';
import { CreateReviewDto } from './dto/create-review.dto';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    private readonly reviewRepo: ReviewRepository,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async checkEligibility(productId: string, userId: string) {
    const existingReview = await this.reviewRepo.findByProductAndUser(
      productId,
      userId,
    );
    if (existingReview) {
      return { eligible: false, reason: 'ALREADY_REVIEWED' };
    }

    // Fix N+1: dùng một query JSON trong DB thay vì loop JS
    const hasBought = await this.reviewRepo.hasUserPurchasedProduct(
      productId,
      userId,
    );
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

    const review = this.reviewRepo.create({
      rating: dto.rating,
      comment: dto.comment,
      product: { id: dto.productId } as any,
      user: { id: dto.userId } as any,
    });

    const saved = await this.reviewRepo.save(review);
    await this.updateProductRating(dto.productId);
    this.logger.log(
      `Review created for product ${dto.productId} by user ${dto.userId}`,
    );
    return saved;
  }

  async updateProductRating(productId: string) {
    const { avgRating, count } =
      await this.reviewRepo.getRatingStats(productId);
    await this.productRepository.update(productId, {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: count,
    });
  }

  async remove(id: string, userId: string) {
    const review = await this.reviewRepo.findById(id);
    if (!review) throw new NotFoundException('Không tìm thấy đánh giá.');
    if (review.user.id !== userId)
      throw new ForbiddenException('Bạn không có quyền xoá đánh giá này.');

    const productId = review.product.id;
    await this.reviewRepo.remove(review);
    await this.updateProductRating(productId);
    return { message: 'Xoá đánh giá thành công' };
  }

  findByProduct(productId: string) {
    return this.reviewRepo.findByProduct(productId);
  }
}

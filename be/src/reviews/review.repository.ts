import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';

export interface RatingStats {
  avgRating: number;
  count: number;
}

/**
 * ReviewRepository — tách query logic ra khỏi ReviewsService.
 * Đặc biệt: checkEligibility dùng JSON query thay vì loop trong JS (fix N+1).
 */
@Injectable()
export class ReviewRepository {
  constructor(
    @InjectRepository(Review)
    private readonly repo: Repository<Review>,
  ) {}

  findByProductAndUser(
    productId: string,
    userId: string,
  ): Promise<Review | null> {
    return this.repo.findOne({
      where: {
        product: { id: productId } as any,
        user: { id: userId } as any,
      },
    });
  }

  /**
   * Fix N+1: Dùng một query JOIN + JSON operator thay vì load tất cả orders rồi loop.
   * Kiểm tra user đã mua và nhận sản phẩm chưa trực tiếp trong DB.
   */
  async hasUserPurchasedProduct(
    productId: string,
    userId: string,
  ): Promise<boolean> {
    const result = await this.repo.manager
      .createQueryBuilder()
      .select('1')
      .from('order', 'o')
      .where('o."userId" = :userId', { userId })
      .andWhere("o.status = 'delivered'")
      .andWhere(
        `EXISTS (
          SELECT 1 FROM jsonb_array_elements(o."orderDetails") AS item
          WHERE item->>'productId' = :productId
        )`,
        { productId },
      )
      .getRawOne();

    return !!result;
  }

  async getRatingStats(productId: string): Promise<RatingStats> {
    const result = await this.repo
      .createQueryBuilder('review')
      .where('review.productId = :id', { id: productId })
      .select('AVG(review.rating)', 'avgRating')
      .addSelect('COUNT(review.id)', 'count')
      .getRawOne();

    return {
      avgRating: parseFloat(result?.avgRating) || 0,
      count: parseInt(result?.count) || 0,
    };
  }

  findByProduct(productId: string): Promise<Review[]> {
    return this.repo.find({
      where: { product: { id: productId } as any },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  findById(id: string): Promise<Review | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['user', 'product'],
    });
  }

  create(data: Partial<Review>): Review {
    return this.repo.create(data);
  }

  save(review: Review): Promise<Review> {
    return this.repo.save(review);
  }

  remove(review: Review): Promise<Review> {
    return this.repo.remove(review);
  }
}

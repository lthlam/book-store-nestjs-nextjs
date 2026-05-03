import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, In } from 'typeorm';
import { Product } from './entities/product.entity';

export interface ProductFilterOptions {
  sort?: string;
  order?: 'ASC' | 'DESC';
  limit?: number;
  page?: number;
  genreId?: string;
  excludeId?: string;
  search?: string;
  genreIds?: string[];
  authorIds?: string[];
  publisherIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  isSpecial?: boolean;
}

/**
 * ProductRepository — tách toàn bộ query logic ra khỏi service.
 * Service chỉ chứa business logic, repository chứa database logic.
 */
@Injectable()
export class ProductRepository {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
  ) {}

  async findWithFilters(
    opts: ProductFilterOptions,
  ): Promise<{ data: Product[]; total: number }> {
    const {
      sort,
      order = 'ASC',
      limit = 20,
      page = 1,
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
    } = opts;

    const qb = this.repo.createQueryBuilder('product');
    qb.leftJoinAndSelect('product.genre', 'genre');
    qb.leftJoinAndSelect('product.author', 'author');
    qb.leftJoinAndSelect('product.publisher', 'publisher');
    qb.take(limit);
    qb.skip((page - 1) * limit);

    if (sort) {
      qb.orderBy(`product.${sort}`, order);
    } else {
      qb.orderBy('product.title', 'ASC');
    }

    if (genreId) qb.andWhere('genre.id = :genreId', { genreId });
    if (excludeId) qb.andWhere('product.id != :excludeId', { excludeId });
    if (search) {
      qb.andWhere('unaccent(LOWER(product.title)) ILIKE unaccent(:search)', {
        search: `%${search.toLowerCase()}%`,
      });
    }
    if (genreIds?.length)
      qb.andWhere('genre.id IN (:...genreIds)', { genreIds });
    if (authorIds?.length)
      qb.andWhere('author.id IN (:...authorIds)', { authorIds });
    if (publisherIds?.length)
      qb.andWhere('publisher.id IN (:...publisherIds)', { publisherIds });
    if (minPrice !== undefined)
      qb.andWhere('product.price >= :minPrice', { minPrice });
    if (maxPrice !== undefined)
      qb.andWhere('product.price <= :maxPrice', { maxPrice });
    if (rating !== undefined)
      qb.andWhere('product.rating >= :rating', { rating });
    if (isSpecial !== undefined)
      qb.andWhere('product.special = :isSpecial', { isSpecial });

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  findById(id: string): Promise<Product | null> {
    return this.repo.findOne({
      where: { id } as any,
      relations: ['genre', 'author', 'publisher'],
      withDeleted: true,
    });
  }

  findByIds(ids: string[]): Promise<Product[]> {
    if (!ids?.length) return Promise.resolve([]);
    return this.repo.find({
      where: { id: In(ids) } as any,
      relations: ['genre', 'author', 'publisher'],
    });
  }

  findByNameLike(name: string): Promise<Product | null> {
    return this.repo.findOne({ where: { title: ILike(name) } });
  }

  create(data: Partial<Product>): Product {
    return this.repo.create(data);
  }

  save(product: Product | Product[]): Promise<Product | Product[]> {
    return this.repo.save(product as any);
  }

  softDelete(id: string) {
    return this.repo.softDelete(id);
  }

  update(id: string, data: Partial<Product>) {
    return this.repo.update(id, data);
  }
}

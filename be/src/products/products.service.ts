import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
//eslint-disable-next-line
import {
  Repository,
  ILike,
  In,
} from 'typeorm';
import { Product } from './entities/product.entity';
import { Author } from '../authors/entities/author.entity';
import { Genre } from '../genres/entities/genre.entity';
import { Publisher } from '../publishers/entities/publisher.entity';
import * as csv from 'csv-parser';
import { Readable } from 'stream';
import { UploadsService } from '../uploads/uploads.service';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
    @InjectRepository(Publisher)
    private readonly publisherRepository: Repository<Publisher>,
    private readonly uploadsService: UploadsService,
  ) {}

  async findAll(
    sort?: string,
    order?: 'ASC' | 'DESC',
    limit: number = 20,
    page: number = 1,
    genreId?: string,
    excludeId?: string,
    search?: string,
    genreIds?: string[],
    authorIds?: string[],
    publisherIds?: string[],
    minPrice?: number,
    maxPrice?: number,
    rating?: number,
    isSpecial?: boolean,
  ) {
    const qb = this.productRepository.createQueryBuilder('product');

    // Relations
    qb.leftJoinAndSelect('product.genre', 'genre');
    qb.leftJoinAndSelect('product.author', 'author');
    qb.leftJoinAndSelect('product.publisher', 'publisher');

    // Pagination
    qb.take(limit);
    qb.skip((page - 1) * limit);

    // Sorting
    if (sort) {
      qb.orderBy(`product.${sort}`, order || 'ASC');
    } else {
      qb.orderBy('product.title', 'ASC');
    }

    // Filters
    if (genreId) {
      qb.andWhere('genre.id = :genreId', { genreId });
    }

    if (excludeId) {
      qb.andWhere('product.id != :excludeId', { excludeId });
    }

    if (search) {
      qb.andWhere('unaccent(LOWER(product.title)) ILIKE unaccent(:search)', {
        search: `%${search.toLowerCase()}%`,
      });
    }

    if (genreIds && genreIds.length > 0) {
      qb.andWhere('genre.id IN (:...genreIds)', { genreIds });
    }

    if (authorIds && authorIds.length > 0) {
      qb.andWhere('author.id IN (:...authorIds)', { authorIds });
    }

    if (publisherIds && publisherIds.length > 0) {
      qb.andWhere('publisher.id IN (:...publisherIds)', { publisherIds });
    }

    if (minPrice !== undefined) {
      qb.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    if (rating !== undefined) {
      qb.andWhere('product.rating >= :rating', { rating });
    }

    if (isSpecial !== undefined) {
      qb.andWhere('product.special = :isSpecial', { isSpecial });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  findOne(id: string) {
    return this.productRepository.findOne({
      where: { id } as any,
      relations: ['genre', 'author', 'publisher'],
      withDeleted: true,
    });
  }

  async findByIds(ids: string[]) {
    if (!ids || ids.length === 0) return [];
    return this.productRepository.find({
      where: { id: In(ids) } as any,
      relations: ['genre', 'author', 'publisher'],
    });
  }

  async create(dto: any) {
    const { genreId, authorId, publisherId, ...rest } = dto;
    const entity = this.productRepository.create({
      ...rest,
      ...(genreId ? { genre: { id: genreId } as any } : {}),
      ...(authorId ? { author: { id: authorId } as any } : {}),
      ...(publisherId ? { publisher: { id: publisherId } as any } : {}),
    });
    return this.productRepository.save(entity);
  }

  async update(id: string, dto: any) {
    const product = await this.productRepository.findOne({
      where: { id } as any,
    });
    if (!product) throw new NotFoundException('Product not found');

    const { genreId, authorId, publisherId, ...rest } = dto;
    Object.assign(product, rest);
    if (genreId) product.genre = { id: genreId } as any;
    if (authorId) product.author = { id: authorId } as any;
    if (publisherId) product.publisher = { id: publisherId } as any;

    return this.productRepository.save(product);
  }

  remove(id: string) {
    return this.productRepository.softDelete(id);
  }

  async bulkCreateFromCsv(files: any[]) {
    if (!files || files.length === 0) throw new Error('No files uploaded');

    const csvFile = files.find((f) =>
      f.originalname.toLowerCase().endsWith('.csv'),
    );
    if (!csvFile) throw new Error('No CSV file found');

    const imageFiles = files.filter((f) => f !== csvFile);

    const firstLine = csvFile.buffer.toString().split('\n')[0];
    const separator =
      firstLine.includes(';') && !firstLine.includes(',') ? ';' : ',';

    const results: any[] = [];
    const stream = Readable.from(csvFile.buffer);

    return new Promise((resolve, reject) => {
      stream
        .pipe(
          csv({
            separator,
            mapHeaders: ({ header }) => header.trim().toLowerCase(),
            mapValues: ({ value }) => value.trim(),
          }),
        )
        .on('data', (data) => {
          const isEmpty = Object.values(data).every(
            (v) => v === '' || v === null || v === undefined,
          );
          if (!isEmpty) results.push(data);
        })
        .on('end', async () => {
          try {
            const createdProducts = [];
            const authorCache = new Map<string, any>();
            const genreCache = new Map<string, any>();
            const publisherCache = new Map<string, any>();
            const uploadedImagesCache = new Map<string, string>();

            for (const row of results) {
              const {
                title,
                price,
                year,
                description,
                image,
                special,
                author,
                genre,
                publisher,
              } = row;

              if (!title || !price) continue;

              // Image matching logic
              let finalImageUrl = image;
              if (image && !image.startsWith('http')) {
                // Try to match with uploaded files
                const match = imageFiles.find((f) => f.originalname === image);
                if (match) {
                  if (uploadedImagesCache.has(image)) {
                    finalImageUrl = uploadedImagesCache.get(image);
                  } else {
                    const uploadResult =
                      await this.uploadsService.uploadImage(match);
                    finalImageUrl = uploadResult.url;
                    uploadedImagesCache.set(image, finalImageUrl);
                  }
                }
              }

              let authorEntity = null;
              if (author) {
                const aName = author.trim();
                const aCacheKey = aName.toLowerCase();
                if (authorCache.has(aCacheKey)) {
                  authorEntity = authorCache.get(aCacheKey);
                } else {
                  authorEntity = await this.authorRepository.findOne({
                    where: { name: ILike(aName) },
                  });
                  if (!authorEntity) {
                    authorEntity = await this.authorRepository.save(
                      this.authorRepository.create({ name: aName }),
                    );
                  }
                  authorCache.set(aCacheKey, authorEntity);
                }
              }

              let genreEntity = null;
              if (genre) {
                const gName = genre.trim();
                const gCacheKey = gName.toLowerCase();
                if (genreCache.has(gCacheKey)) {
                  genreEntity = genreCache.get(gCacheKey);
                } else {
                  genreEntity = await this.genreRepository.findOne({
                    where: { name: ILike(gName) },
                  });
                  if (!genreEntity) {
                    genreEntity = await this.genreRepository.save(
                      this.genreRepository.create({ name: gName }),
                    );
                  }
                  genreCache.set(gCacheKey, genreEntity);
                }
              }

              let publisherEntity = null;
              if (publisher) {
                const pName = publisher.trim();
                const pCacheKey = pName.toLowerCase();
                if (publisherCache.has(pCacheKey)) {
                  publisherEntity = publisherCache.get(pCacheKey);
                } else {
                  publisherEntity = await this.publisherRepository.findOne({
                    where: { name: ILike(pName) },
                  });
                  if (!publisherEntity) {
                    publisherEntity = await this.publisherRepository.save(
                      this.publisherRepository.create({ name: pName }),
                    );
                  }
                  publisherCache.set(pCacheKey, publisherEntity);
                }
              }

              createdProducts.push(
                this.productRepository.create({
                  title,
                  price: Number(price),
                  year: year ? Number(year) : null,
                  description,
                  image: finalImageUrl,
                  special: special === 'true' || special === '1',
                  author: authorEntity,
                  genre: genreEntity,
                  publisher: publisherEntity,
                }),
              );
            }

            const saved = await this.productRepository.save(createdProducts);
            resolve({
              success: true,
              count: saved.length,
              message: `Successfully uploaded ${saved.length} products.`,
            });
          } catch (err) {
            this.logger.error(
              `Error during bulk upload: ${err.message}`,
              err.stack,
            );
            reject(err);
          }
        })
        .on('error', (err) => reject(err));
    });
  }
}

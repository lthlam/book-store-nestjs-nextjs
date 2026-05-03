import { Injectable, NotFoundException, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Author } from './entities/author.entity';

const CACHE_KEY = 'authors:all';
const CACHE_TTL = 300_000; // 5 phút

@Injectable()
export class AuthorsService {
  private readonly logger = new Logger(AuthorsService.name);

  constructor(
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async findAll() {
    const cached = await this.cacheManager.get<Author[]>(CACHE_KEY);
    if (cached) return cached;

    const authors = await this.authorRepository.find({
      order: { name: 'ASC' },
    });
    await this.cacheManager.set(CACHE_KEY, authors, CACHE_TTL);
    return authors;
  }

  async findOne(id: string) {
    const author = await this.authorRepository.findOne({ where: { id } });
    if (!author) throw new NotFoundException('Author not found');
    return author;
  }

  async create(name: string) {
    const existing = await this.authorRepository.findOne({
      where: { name: ILike(name) },
    });
    if (existing) return existing;
    const author = this.authorRepository.create({ name });
    const saved = await this.authorRepository.save(author);
    await this.cacheManager.del(CACHE_KEY);
    this.logger.log(`Author created: ${saved.id}`);
    return saved;
  }

  async update(id: string, name: string) {
    const author = await this.findOne(id);
    author.name = name;
    const saved = await this.authorRepository.save(author);
    await this.cacheManager.del(CACHE_KEY);
    return saved;
  }

  async remove(id: string) {
    const author = await this.findOne(id);
    const result = await this.authorRepository.remove(author);
    await this.cacheManager.del(CACHE_KEY);
    return result;
  }
}

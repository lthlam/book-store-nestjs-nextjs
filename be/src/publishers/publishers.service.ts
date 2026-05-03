import { Injectable, NotFoundException, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Publisher } from './entities/publisher.entity';

const CACHE_KEY = 'publishers:all';
const CACHE_TTL = 300_000; // 5 phút

@Injectable()
export class PublishersService {
  private readonly logger = new Logger(PublishersService.name);

  constructor(
    @InjectRepository(Publisher)
    private readonly publisherRepository: Repository<Publisher>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async findAll() {
    const cached = await this.cacheManager.get<Publisher[]>(CACHE_KEY);
    if (cached) return cached;

    const publishers = await this.publisherRepository.find({
      order: { name: 'ASC' },
    });
    await this.cacheManager.set(CACHE_KEY, publishers, CACHE_TTL);
    return publishers;
  }

  async findOne(id: string) {
    const publisher = await this.publisherRepository.findOne({ where: { id } });
    if (!publisher) throw new NotFoundException('Publisher not found');
    return publisher;
  }

  async create(name: string) {
    const existing = await this.publisherRepository.findOne({
      where: { name: ILike(name) },
    });
    if (existing) return existing;
    const publisher = this.publisherRepository.create({ name });
    const saved = await this.publisherRepository.save(publisher);
    await this.cacheManager.del(CACHE_KEY);
    this.logger.log(`Publisher created: ${saved.id}`);
    return saved;
  }

  async update(id: string, name: string) {
    const publisher = await this.findOne(id);
    publisher.name = name;
    const saved = await this.publisherRepository.save(publisher);
    await this.cacheManager.del(CACHE_KEY);
    return saved;
  }

  async remove(id: string) {
    const publisher = await this.findOne(id);
    const result = await this.publisherRepository.remove(publisher);
    await this.cacheManager.del(CACHE_KEY);
    return result;
  }
}

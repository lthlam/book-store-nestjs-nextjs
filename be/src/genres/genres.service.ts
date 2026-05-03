import { Injectable, NotFoundException, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Genre } from './entities/genre.entity';

const CACHE_KEY = 'genres:all';
const CACHE_TTL = 300_000; // 5 phút

@Injectable()
export class GenresService {
  private readonly logger = new Logger(GenresService.name);

  constructor(
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async findAll() {
    const cached = await this.cacheManager.get<Genre[]>(CACHE_KEY);
    if (cached) return cached;

    const genres = await this.genreRepository.find();
    await this.cacheManager.set(CACHE_KEY, genres, CACHE_TTL);
    return genres;
  }

  async findOne(id: string) {
    const genre = await this.genreRepository.findOne({ where: { id } });
    if (!genre) throw new NotFoundException('Genre not found');
    return genre;
  }

  async create(name: string) {
    const existing = await this.genreRepository.findOne({
      where: { name: ILike(name) },
    });
    if (existing) return existing;
    const genre = this.genreRepository.create({ name });
    const saved = await this.genreRepository.save(genre);
    await this.cacheManager.del(CACHE_KEY); // Invalidate cache
    this.logger.log(`Genre created: ${saved.id}`);
    return saved;
  }

  async update(id: string, name: string) {
    const genre = await this.findOne(id);
    genre.name = name;
    const saved = await this.genreRepository.save(genre);
    await this.cacheManager.del(CACHE_KEY);
    return saved;
  }

  async remove(id: string) {
    const genre = await this.findOne(id);
    const result = await this.genreRepository.remove(genre);
    await this.cacheManager.del(CACHE_KEY);
    return result;
  }
}

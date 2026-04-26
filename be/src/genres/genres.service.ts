import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Genre } from './entities/genre.entity';

@Injectable()
export class GenresService {
  constructor(
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
  ) {}

  async findAll() {
    return this.genreRepository.find();
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
    return this.genreRepository.save(genre);
  }

  async update(id: string, name: string) {
    const genre = await this.findOne(id);
    genre.name = name;
    return this.genreRepository.save(genre);
  }

  async remove(id: string) {
    const genre = await this.findOne(id);
    return this.genreRepository.remove(genre);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Author } from './entities/author.entity';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
  ) {}

  findAll() {
    return this.authorRepository.find({ order: { name: 'ASC' } });
  }

  findOne(id: string) {
    return this.authorRepository.findOne({ where: { id } });
  }

  async create(name: string) {
    const existing = await this.authorRepository.findOne({
      where: { name: ILike(name) },
    });
    if (existing) return existing;
    const author = this.authorRepository.create({ name });
    return this.authorRepository.save(author);
  }

  async update(id: string, name: string) {
    const author = await this.authorRepository.findOne({ where: { id } });
    if (author) {
      author.name = name;
      return this.authorRepository.save(author);
    }
    return null;
  }

  remove(id: string) {
    return this.authorRepository.delete(id);
  }
}

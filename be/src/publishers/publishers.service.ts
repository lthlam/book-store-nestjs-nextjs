import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Publisher } from './entities/publisher.entity';

@Injectable()
export class PublishersService {
  constructor(
    @InjectRepository(Publisher)
    private readonly publisherRepository: Repository<Publisher>,
  ) {}

  findAll() {
    return this.publisherRepository.find({ order: { name: 'ASC' } });
  }

  findOne(id: string) {
    return this.publisherRepository.findOne({ where: { id } });
  }

  async create(name: string) {
    const existing = await this.publisherRepository.findOne({
      where: { name: ILike(name) },
    });
    if (existing) return existing;
    const publisher = this.publisherRepository.create({ name });
    return this.publisherRepository.save(publisher);
  }

  async update(id: string, name: string) {
    const publisher = await this.publisherRepository.findOne({ where: { id } });
    if (publisher) {
      publisher.name = name;
      return this.publisherRepository.save(publisher);
    }
    return null;
  }

  remove(id: string) {
    return this.publisherRepository.delete(id);
  }
}

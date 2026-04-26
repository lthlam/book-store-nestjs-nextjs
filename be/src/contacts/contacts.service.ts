import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactMessage } from './entities/contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(ContactMessage)
    private readonly contactRepository: Repository<ContactMessage>,
  ) {}

  async create(createDto: CreateContactDto) {
    const message = this.contactRepository.create(createDto);
    return await this.contactRepository.save(message);
  }

  async findAll() {
    return await this.contactRepository.find({ order: { createdAt: 'DESC' } });
  }

  async updateStatus(id: string, status: 'new' | 'read' | 'replied') {
    return await this.contactRepository.update(id, { status });
  }
}

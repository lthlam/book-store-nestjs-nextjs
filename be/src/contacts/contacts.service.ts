import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactMessage } from './entities/contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactsService {
  private readonly logger = new Logger(ContactsService.name);

  constructor(
    @InjectRepository(ContactMessage)
    private readonly contactRepository: Repository<ContactMessage>,
  ) {}

  async create(createDto: CreateContactDto) {
    const message = this.contactRepository.create(createDto);
    const saved = await this.contactRepository.save(message);
    this.logger.log(`Contact message from: ${createDto.email}`);
    return saved;
  }

  findAll() {
    return this.contactRepository.find({ order: { createdAt: 'DESC' } });
  }

  updateStatus(id: string, status: 'new' | 'read' | 'replied') {
    return this.contactRepository.update(id, { status });
  }
}

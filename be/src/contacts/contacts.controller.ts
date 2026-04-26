import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  create(@Body() createDto: CreateContactDto) {
    return this.contactsService.create(createDto);
  }

  @Get()
  findAll() {
    return this.contactsService.findAll();
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'new' | 'read' | 'replied',
  ) {
    return this.contactsService.updateStatus(id, status);
  }
}

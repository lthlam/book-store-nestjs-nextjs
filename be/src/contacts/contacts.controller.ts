import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles, Role } from '../auth/decorators/roles.decorator';

@ApiTags('contacts')
@ApiBearerAuth('access-token')
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Public()
  @ApiOperation({ summary: 'Gửi tin nhắn liên hệ' })
  @Post()
  create(@Body() createDto: CreateContactDto) {
    return this.contactsService.create(createDto);
  }

  @Roles(Role.Admin)
  @ApiOperation({ summary: '[Admin] Lấy tất cả tin nhắn liên hệ' })
  @Get()
  findAll() {
    return this.contactsService.findAll();
  }

  @Roles(Role.Admin)
  @ApiOperation({
    summary: '[Admin] Cập nhật trạng thái tin nhắn (new/read/replied)',
  })
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'new' | 'read' | 'replied',
  ) {
    return this.contactsService.updateStatus(id, status);
  }
}

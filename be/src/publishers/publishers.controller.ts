import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PublishersService } from './publishers.service';
import { Public } from '../auth/decorators/public.decorator';
import { Roles, Role } from '../auth/decorators/roles.decorator';

@ApiTags('publishers')
@ApiBearerAuth('access-token')
@Controller('publishers')
export class PublishersController {
  constructor(private readonly publishersService: PublishersService) {}

  @Public()
  @ApiOperation({ summary: 'Lấy tất cả nhà xuất bản (có cache 5 phút)' })
  @Get()
  findAll() {
    return this.publishersService.findAll();
  }

  @Public()
  @ApiOperation({ summary: 'Lấy nhà xuất bản theo ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.publishersService.findOne(id);
  }

  @Roles(Role.Admin)
  @ApiOperation({ summary: '[Admin] Tạo nhà xuất bản mới' })
  @Post()
  create(@Body('name') name: string) {
    return this.publishersService.create(name);
  }

  @Roles(Role.Admin)
  @ApiOperation({ summary: '[Admin] Cập nhật nhà xuất bản' })
  @Patch(':id')
  update(@Param('id') id: string, @Body('name') name: string) {
    return this.publishersService.update(id, name);
  }

  @Roles(Role.Admin)
  @ApiOperation({ summary: '[Admin] Xóa nhà xuất bản' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.publishersService.remove(id);
  }
}

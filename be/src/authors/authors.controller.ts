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
import { AuthorsService } from './authors.service';
import { Public } from '../auth/decorators/public.decorator';
import { Roles, Role } from '../auth/decorators/roles.decorator';

@ApiTags('authors')
@ApiBearerAuth('access-token')
@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Public()
  @ApiOperation({ summary: 'Lấy tất cả tác giả (có cache 5 phút)' })
  @Get()
  findAll() {
    return this.authorsService.findAll();
  }

  @Public()
  @ApiOperation({ summary: 'Lấy tác giả theo ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authorsService.findOne(id);
  }

  @Roles(Role.Admin)
  @ApiOperation({ summary: '[Admin] Tạo tác giả mới' })
  @Post()
  create(@Body('name') name: string) {
    return this.authorsService.create(name);
  }

  @Roles(Role.Admin)
  @ApiOperation({ summary: '[Admin] Cập nhật tác giả' })
  @Patch(':id')
  update(@Param('id') id: string, @Body('name') name: string) {
    return this.authorsService.update(id, name);
  }

  @Roles(Role.Admin)
  @ApiOperation({ summary: '[Admin] Xóa tác giả' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authorsService.remove(id);
  }
}

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
import { GenresService } from './genres.service';
import { Public } from '../auth/decorators/public.decorator';
import { Roles, Role } from '../auth/decorators/roles.decorator';

@ApiTags('genres')
@ApiBearerAuth('access-token')
@Controller('genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Public()
  @ApiOperation({ summary: 'Lấy tất cả thể loại (có cache 5 phút)' })
  @Get()
  findAll() {
    return this.genresService.findAll();
  }

  @Public()
  @ApiOperation({ summary: 'Lấy thể loại theo ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.genresService.findOne(id);
  }

  @Roles(Role.Admin)
  @ApiOperation({ summary: '[Admin] Tạo thể loại mới' })
  @Post()
  create(@Body('name') name: string) {
    return this.genresService.create(name);
  }

  @Roles(Role.Admin)
  @ApiOperation({ summary: '[Admin] Cập nhật thể loại' })
  @Patch(':id')
  update(@Param('id') id: string, @Body('name') name: string) {
    return this.genresService.update(id, name);
  }

  @Roles(Role.Admin)
  @ApiOperation({ summary: '[Admin] Xóa thể loại' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.genresService.remove(id);
  }
}

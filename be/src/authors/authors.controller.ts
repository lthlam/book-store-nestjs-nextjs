import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { AuthorsService } from './authors.service';

@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Get()
  findAll() {
    return this.authorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authorsService.findOne(id);
  }

  @Post()
  create(@Body('name') name: string) {
    return this.authorsService.create(name);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body('name') name: string) {
    return this.authorsService.update(id, name);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authorsService.remove(id);
  }
}

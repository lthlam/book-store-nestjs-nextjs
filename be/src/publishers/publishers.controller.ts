import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { PublishersService } from './publishers.service';

@Controller('publishers')
export class PublishersController {
  constructor(private readonly publishersService: PublishersService) {}

  @Get()
  findAll() {
    return this.publishersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.publishersService.findOne(id);
  }

  @Post()
  create(@Body('name') name: string) {
    return this.publishersService.create(name);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body('name') name: string) {
    return this.publishersService.update(id, name);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.publishersService.remove(id);
  }
}

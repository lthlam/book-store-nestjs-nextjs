import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { WishlistService } from './wishlists.service';

@Controller('wishlists')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post()
  create(@Body() createDto: any) {
    return this.wishlistService.create(createDto);
  }

  @Get()
  findAll() {
    return this.wishlistService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.wishlistService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.wishlistService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.wishlistService.remove(id);
  }
}

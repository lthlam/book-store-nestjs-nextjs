import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WishlistService } from './wishlists.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { Roles, Role } from '../auth/decorators/roles.decorator';

@ApiTags('wishlists')
@ApiBearerAuth('access-token')
@Controller('wishlists')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @ApiOperation({ summary: 'Tạo danh sách yêu thích cho user' })
  @Post()
  create(@Body() createDto: CreateWishlistDto) {
    return this.wishlistService.create(createDto);
  }

  @Roles(Role.Admin)
  @ApiOperation({ summary: '[Admin] Lấy tất cả wishlist' })
  @Get()
  findAll() {
    return this.wishlistService.findAll();
  }

  @ApiOperation({ summary: 'Lấy wishlist theo ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.wishlistService.findOne(id);
  }

  @ApiOperation({ summary: 'Cập nhật wishlist (thêm/xóa sản phẩm)' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateWishlistDto) {
    return this.wishlistService.update(id, updateDto);
  }

  @ApiOperation({ summary: 'Xóa wishlist' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.wishlistService.remove(id);
  }
}

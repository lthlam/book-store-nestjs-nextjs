import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WishlistService } from './wishlists.service';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { Roles, Role } from '../auth/decorators/roles.decorator';
import {
  CurrentUser,
  JwtPayload,
} from '../auth/decorators/current-user.decorator';

@ApiTags('wishlists')
@ApiBearerAuth('access-token')
@Controller('wishlists')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @ApiOperation({ summary: 'Tạo hoặc lấy wishlist của user hiện tại' })
  @Post()
  createOrGet(
    @Body('productIds') productIds: string[],
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.wishlistService.createOrGet(currentUser.sub, productIds);
  }

  @Roles(Role.Admin)
  @ApiOperation({ summary: '[Admin] Lấy tất cả wishlist' })
  @Get()
  findAll() {
    return this.wishlistService.findAll();
  }

  @ApiOperation({ summary: 'Lấy wishlist của user hiện tại' })
  @Get('my')
  findMy(@CurrentUser() currentUser: JwtPayload) {
    return this.wishlistService.findByUser(currentUser.sub);
  }

  @ApiOperation({ summary: 'Cập nhật wishlist (chỉ của mình)' })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateWishlistDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.wishlistService.update(id, currentUser.sub, updateDto);
  }

  @ApiOperation({ summary: 'Xóa wishlist (chỉ của mình)' })
  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.wishlistService.remove(id, currentUser.sub);
  }
}

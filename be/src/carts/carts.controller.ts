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
import { CartService } from './carts.service';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Roles, Role } from '../auth/decorators/roles.decorator';
import {
  CurrentUser,
  JwtPayload,
} from '../auth/decorators/current-user.decorator';

@ApiTags('carts')
@ApiBearerAuth('access-token')
@Controller('carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ApiOperation({ summary: 'Tạo hoặc lấy giỏ hàng của user hiện tại' })
  @Post()
  createOrGet(
    @Body('items') items: any[],
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.cartService.createOrGet(currentUser.sub, items);
  }

  @Roles(Role.Admin)
  @ApiOperation({ summary: '[Admin] Lấy tất cả giỏ hàng' })
  @Get()
  findAll() {
    return this.cartService.findAll();
  }

  @ApiOperation({ summary: 'Lấy giỏ hàng của user hiện tại' })
  @Get('my')
  findMy(@CurrentUser() currentUser: JwtPayload) {
    return this.cartService.findByUser(currentUser.sub);
  }

  @ApiOperation({ summary: 'Cập nhật giỏ hàng (chỉ của mình)' })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateCartDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.cartService.update(id, currentUser.sub, updateDto);
  }

  @ApiOperation({ summary: 'Xóa giỏ hàng (chỉ của mình)' })
  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.cartService.remove(id, currentUser.sub);
  }
}

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
import { CartService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Roles, Role } from '../auth/decorators/roles.decorator';

@ApiTags('carts')
@ApiBearerAuth('access-token')
@Controller('carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ApiOperation({ summary: 'Tạo giỏ hàng cho user' })
  @Post()
  create(@Body() createDto: CreateCartDto) {
    return this.cartService.create(createDto);
  }

  @Roles(Role.Admin)
  @ApiOperation({ summary: '[Admin] Lấy tất cả giỏ hàng' })
  @Get()
  findAll() {
    return this.cartService.findAll();
  }

  @ApiOperation({ summary: 'Lấy giỏ hàng theo ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cartService.findOne(id);
  }

  @ApiOperation({ summary: 'Cập nhật giỏ hàng' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateCartDto) {
    return this.cartService.update(id, updateDto);
  }

  @ApiOperation({ summary: 'Xóa giỏ hàng' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cartService.remove(id);
  }
}

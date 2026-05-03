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
import { CouponService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Roles, Role } from '../auth/decorators/roles.decorator';

@ApiTags('coupons')
@ApiBearerAuth('access-token')
@Controller('coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @ApiOperation({ summary: 'Áp dụng mã giảm giá' })
  @Post('apply')
  apply(@Body() body: { code: string; orderTotal: number }) {
    return this.couponService.applyCode(body.code, body.orderTotal);
  }

  @ApiOperation({ summary: 'Lấy danh sách coupon đang active' })
  @Get('active')
  findActive() {
    return this.couponService.findActive();
  }

  @Roles(Role.Admin)
  @ApiOperation({ summary: '[Admin] Tạo coupon mới' })
  @Post()
  create(@Body() createDto: CreateCouponDto) {
    return this.couponService.create(createDto);
  }

  @Roles(Role.Admin)
  @ApiOperation({ summary: '[Admin] Lấy tất cả coupon' })
  @Get()
  findAll() {
    return this.couponService.findAll();
  }

  @Roles(Role.Admin)
  @ApiOperation({ summary: '[Admin] Lấy coupon theo ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.couponService.findOne(id);
  }

  @Roles(Role.Admin)
  @ApiOperation({ summary: '[Admin] Cập nhật coupon' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateCouponDto) {
    return this.couponService.update(id, updateDto);
  }

  @Roles(Role.Admin)
  @ApiOperation({ summary: '[Admin] Xóa coupon' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.couponService.remove(id);
  }
}

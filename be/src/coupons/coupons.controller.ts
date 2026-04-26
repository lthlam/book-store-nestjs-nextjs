import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CouponService } from './coupons.service';

@Controller('coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post('apply')
  apply(@Body() body: { code: string; orderTotal: number }) {
    return this.couponService.applyCode(body.code, body.orderTotal);
  }

  @Get('active')
  findActive() {
    return this.couponService.findActive();
  }

  @Post()
  create(@Body() createDto: any) {
    return this.couponService.create(createDto);
  }

  @Get()
  findAll() {
    return this.couponService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.couponService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.couponService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.couponService.remove(id);
  }
}

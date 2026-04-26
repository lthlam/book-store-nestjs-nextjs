import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coupon } from './entities/coupon.entity';
import { CouponController } from './coupons.controller';
import { CouponService } from './coupons.service';

@Module({
  imports: [TypeOrmModule.forFeature([Coupon])],
  controllers: [CouponController],
  providers: [CouponService],
  exports: [CouponService],
})
export class CouponModule {}

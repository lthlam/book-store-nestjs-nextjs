import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Coupon } from './entities/coupon.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
  ) {}

  async create(createDto: CreateCouponDto) {
    const entity = this.couponRepository.create(createDto);
    return this.couponRepository.save(entity);
  }

  async findAll() {
    return this.couponRepository.find();
  }

  async findActive() {
    const now = new Date().toISOString();
    return this.couponRepository.find({
      where: {
        startDate: LessThanOrEqual(now),
        expiryDate: MoreThanOrEqual(now),
      } as any,
    });
  }

  async findOne(id: string) {
    const coupon = await this.couponRepository.findOne({
      where: { id } as any,
    });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async update(id: string, updateDto: UpdateCouponDto) {
    const coupon = await this.findOne(id);
    Object.assign(coupon, updateDto);
    return this.couponRepository.save(coupon);
  }

  async remove(id: string) {
    const coupon = await this.findOne(id);
    return this.couponRepository.remove(coupon);
  }

  async applyCode(code: string, orderTotal: number) {
    const coupon = await this.couponRepository.findOne({
      where: { code } as any,
    });
    if (!coupon) throw new NotFoundException('Coupon code not found.');

    const now = new Date();
    const start = new Date(coupon.startDate);
    const expiry = new Date(coupon.expiryDate);

    if (now < start)
      throw new BadRequestException('This coupon is not yet active.');
    if (now > expiry) throw new BadRequestException('This coupon has expired.');
    if (orderTotal < Number(coupon.minimum))
      throw new BadRequestException(
        `Minimum order amount is ${Number(coupon.minimum).toLocaleString('vi-VN')} VND.`,
      );

    const discountVal = Number(coupon.discount);
    const discountAmount =
      coupon.type === 'fixed'
        ? discountVal
        : Math.round((orderTotal * discountVal) / 100);

    return {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type || 'percent',
      discount: discountVal,
      discountAmount,
      description: coupon.description,
    };
  }
}

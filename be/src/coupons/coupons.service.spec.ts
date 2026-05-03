import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CouponService } from './coupons.service';
import { Coupon } from './entities/coupon.entity';

const mockCouponRepo = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

const activeCoupon = {
  id: 'c-1',
  code: 'SALE10',
  discount: 10,
  type: 'percent',
  minimum: 100000,
  startDate: '2000-01-01',
  expiryDate: '2099-12-31',
  description: 'Giảm 10%',
};

describe('CouponService', () => {
  let service: CouponService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponService,
        { provide: getRepositoryToken(Coupon), useValue: mockCouponRepo },
      ],
    }).compile();

    service = module.get<CouponService>(CouponService);
    jest.clearAllMocks();
  });

  describe('applyCode', () => {
    it('should return discount amount for valid percent coupon', async () => {
      mockCouponRepo.findOne.mockResolvedValue(activeCoupon);
      const result = await service.applyCode('SALE10', 200000);
      expect(result.discountAmount).toBe(20000); // 10% of 200000
    });

    it('should return fixed discount for fixed coupon', async () => {
      mockCouponRepo.findOne.mockResolvedValue({
        ...activeCoupon,
        type: 'fixed',
        discount: 50000,
      });
      const result = await service.applyCode('SALE10', 200000);
      expect(result.discountAmount).toBe(50000);
    });

    it('should throw NotFoundException when coupon not found', async () => {
      mockCouponRepo.findOne.mockResolvedValue(null);
      await expect(service.applyCode('INVALID', 200000)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when order total is below minimum', async () => {
      mockCouponRepo.findOne.mockResolvedValue(activeCoupon);
      await expect(service.applyCode('SALE10', 50000)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when coupon is expired', async () => {
      mockCouponRepo.findOne.mockResolvedValue({
        ...activeCoupon,
        expiryDate: '2000-01-01',
      });
      await expect(service.applyCode('SALE10', 200000)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when coupon is not yet active', async () => {
      mockCouponRepo.findOne.mockResolvedValue({
        ...activeCoupon,
        startDate: '2099-01-01',
      });
      await expect(service.applyCode('SALE10', 200000)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});

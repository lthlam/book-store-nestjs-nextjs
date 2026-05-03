import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OrderService } from './orders.service';
import { Order } from './entities/order.entity';
import { Address } from '../addresses/entities/address.entity';
import { ProductService } from '../products/products.service';

const mockOrderRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

const mockAddressRepo = { findOne: jest.fn() };

const mockProductService = { findByIds: jest.fn() };

const mockDataSource = {
  transaction: jest.fn((cb) =>
    cb({
      create: jest.fn((_, data) => data),
      save: jest.fn((_, data) =>
        Promise.resolve({ ...data, id: 'order-uuid' }),
      ),
    }),
  ),
};

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: getRepositoryToken(Order), useValue: mockOrderRepo },
        { provide: getRepositoryToken(Address), useValue: mockAddressRepo },
        { provide: ProductService, useValue: mockProductService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create order within a transaction', async () => {
      const dto = {
        userId: 'user-1',
        items: [{ productId: 'p-1', quantity: 1, price: 100 }],
        totalAmount: 100,
      };
      const result = await service.create(dto as any);
      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(result.id).toBe('order-uuid');
    });
  });

  describe('update — state machine', () => {
    it('should throw when trying to change delivered order', async () => {
      mockOrderRepo.findOne.mockResolvedValue({
        id: 'o-1',
        status: 'delivered',
      });
      await expect(
        service.update('o-1', { status: 'pending' } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when trying to change cancelled order', async () => {
      mockOrderRepo.findOne.mockResolvedValue({
        id: 'o-1',
        status: 'cancelled',
      });
      await expect(
        service.update('o-1', { status: 'pending' } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow pending → confirmed', async () => {
      const order = { id: 'o-1', status: 'pending' };
      mockOrderRepo.findOne.mockResolvedValue(order);
      mockOrderRepo.save.mockResolvedValue({ ...order, status: 'confirmed' });
      const result = await service.update('o-1', {
        status: 'confirmed',
      } as any);
      expect(result.status).toBe('confirmed');
    });

    it('should throw when pending → delivered (invalid transition)', async () => {
      mockOrderRepo.findOne.mockResolvedValue({ id: 'o-1', status: 'pending' });
      await expect(
        service.update('o-1', { status: 'delivered' } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when order not found', async () => {
      mockOrderRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

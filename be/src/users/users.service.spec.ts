import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';

const mockUserRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  remove: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn().mockResolvedValue('mock-token'),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return token when credentials are valid', async () => {
      const hashed = await bcrypt.hash('password123', 10);
      const user = {
        id: 'uuid-1',
        email: 'test@test.com',
        password: hashed,
        isBlocked: false,
        name: 'Test',
        contact: 0,
      };
      mockUserRepo.findOne.mockResolvedValue(user);

      const result = await service.login({
        email: 'test@test.com',
        password: 'password123',
      });

      expect(result.access_token).toBe('mock-token');
      expect(result.user.email).toBe('test@test.com');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      await expect(
        service.login({ email: 'x@x.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      const hashed = await bcrypt.hash('correct', 10);
      mockUserRepo.findOne.mockResolvedValue({
        password: hashed,
        isBlocked: false,
      });
      await expect(
        service.login({ email: 'x@x.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is blocked', async () => {
      const hashed = await bcrypt.hash('pass', 10);
      mockUserRepo.findOne.mockResolvedValue({
        password: hashed,
        isBlocked: true,
      });
      await expect(
        service.login({ email: 'x@x.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('signup', () => {
    it('should create user when email is not taken', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      const newUser = { id: 'uuid-2', email: 'new@test.com', name: 'New' };
      mockUserRepo.create.mockReturnValue(newUser);
      mockUserRepo.save.mockResolvedValue(newUser);

      const result = await service.signup({
        email: 'new@test.com',
        name: 'New',
        contact: '0123',
        password: 'pass123',
      });
      expect(result.email).toBe('new@test.com');
    });

    it('should throw ConflictException when email already exists', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: 'existing' });
      await expect(
        service.signup({
          email: 'taken@test.com',
          name: 'X',
          contact: '0',
          password: 'pass123',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });
});

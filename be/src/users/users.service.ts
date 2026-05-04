import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    if (user.isBlocked)
      throw new UnauthorizedException('Tài khoản của bạn đã bị khóa');

    this.logger.log(`User login: ${user.email}`);
    const tokens = await this.authService.generateUserTokens(user);
    return {
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        contact: user.contact,
      },
    };
  }

  async socialLogin(dto: { email: string; name: string; avatar?: string }) {
    let user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      const randomPass = Math.random().toString(36).slice(-10);
      const hashed = await bcrypt.hash(randomPass, 10);
      user = this.userRepository.create({
        name: dto.name,
        email: dto.email,
        password: hashed,
        contact: 0,
      });
      user = await this.userRepository.save(user);
      this.logger.log(`Social login — new user created: ${user.email}`);
    }

    if (user.isBlocked)
      throw new UnauthorizedException('Tài khoản của bạn đã bị khóa');

    const tokens = await this.authService.generateUserTokens(user);
    return {
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        contact: user.contact,
      },
    };
  }

  async signup(dto: CreateUserDto) {
    const existing = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already in use');

    if (!dto.password || dto.password.length < 6) {
      throw new BadRequestException(
        'Password must be at least 6 characters long',
      );
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      name: dto.name,
      email: dto.email,
      contact: Number(dto.contact),
      password: hashed,
    });

    const saved = await this.userRepository.save(user);
    this.logger.log(`User registered: ${saved.email}`);
    return saved;
  }

  findAll() {
    return this.userRepository.find({
      select: ['id', 'name', 'email', 'contact', 'createdAt', 'isBlocked'],
    });
  }

  findOne(id: string) {
    return this.userRepository.findOne({ where: { id } as any });
  }

  /** User tự cập nhật profile — không được thay đổi isBlocked */
  async updateProfile(id: string, dto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({ where: { id } as any });
    if (!user) throw new NotFoundException('User not found');

    if (dto.password) {
      if (dto.password.length < 6) {
        throw new BadRequestException(
          'Password must be at least 6 characters long',
        );
      }
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    Object.assign(user, dto);
    return this.userRepository.save(user);
  }

  /** Admin block/unblock user */
  async setBlockStatus(id: string, dto: AdminUpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } as any });
    if (!user) throw new NotFoundException('User not found');
    user.isBlocked = dto.isBlocked;
    this.logger.log(
      `Admin ${dto.isBlocked ? 'blocked' : 'unblocked'} user: ${user.email}`,
    );
    return this.userRepository.save(user);
  }

  async remove(id: string) {
    const user = await this.userRepository.findOne({ where: { id } as any });
    if (!user) throw new NotFoundException('User not found');
    return this.userRepository.remove(user);
  }

  findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }
}

import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.isBlocked) {
      throw new UnauthorizedException('Tài khoản của bạn đã bị khóa');
    }

    const payload = { sub: user.id, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
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
      // Create a dummy password for social users
      const randomPass = Math.random().toString(36).slice(-10);
      const hashed = await bcrypt.hash(randomPass, 10);

      user = this.userRepository.create({
        name: dto.name,
        email: dto.email,
        password: hashed,
        contact: 0, // Default contact
      });
      user = await this.userRepository.save(user);
    }

    if (user.isBlocked) {
      throw new UnauthorizedException('Tài khoản của bạn đã bị khóa');
    }

    const payload = { sub: user.id, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
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
    if (existing) {
      throw new ConflictException('Email already in use');
    }

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

    return this.userRepository.save(user);
  }

  async findAll() {
    return this.userRepository.find({
      select: ['id', 'name', 'email', 'contact', 'createdAt', 'isBlocked'],
    });
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({ where: { id } as any });
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
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

  async remove(id: string) {
    const user = await this.userRepository.findOne({ where: { id } as any });
    if (!user) throw new NotFoundException('User not found');
    return this.userRepository.remove(user);
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }
}

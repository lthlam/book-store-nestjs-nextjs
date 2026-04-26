import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Admin } from './entities/admin.entity';

@Injectable()
export class AdminsService implements OnModuleInit {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit() {
    try {
      const defaultUsername = 'admin';
      const defaultPassword = 'admin';

      const existing = await this.adminRepository.findOne({
        where: { username: defaultUsername },
      });
      if (!existing) {
        const hashed = await bcrypt.hash(defaultPassword, 10);
        const admin = this.adminRepository.create({
          username: defaultUsername,
          password: hashed,
        });
        await this.adminRepository.save(admin);
        console.log('Seeded default admin account: admin / admin');
      }
      return { success: true };
    } catch (error) {
      console.error('Seed error:', error);
      return { success: false, error: error.message };
    }
  }

  async login(dto: { username: string; password: string }) {
    const admin = await this.adminRepository.findOne({
      where: { username: dto.username },
    });
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, admin.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: admin.id, username: admin.username, role: 'admin' };
    return {
      access_token: await this.jwtService.signAsync(payload),
      admin: {
        id: admin.id,
        username: admin.username,
      },
    };
  }

  async findAll() {
    return this.adminRepository.find({
      select: ['id', 'username', 'createdAt'],
    });
  }

  async findOne(id: string) {
    const admin = await this.adminRepository.findOne({ where: { id } as any });
    return admin;
  }

  async remove(id: string) {
    const admin = await this.adminRepository.findOne({ where: { id } as any });
    if (!admin) throw new NotFoundException('Admin not found');
    return this.adminRepository.remove(admin);
  }
}

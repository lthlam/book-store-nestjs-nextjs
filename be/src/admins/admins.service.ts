import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Admin } from './entities/admin.entity';

@Injectable()
export class AdminsService {
  private readonly logger = new Logger(AdminsService.name);

  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: { username: string; password: string }) {
    const admin = await this.adminRepository.findOne({
      where: { username: dto.username },
    });
    if (!admin) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(dto.password, admin.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    this.logger.log(`Admin login: ${admin.username}`);
    const payload = { sub: admin.id, username: admin.username, role: 'admin' };
    return {
      access_token: await this.jwtService.signAsync(payload),
      admin: { id: admin.id, username: admin.username },
    };
  }

  findAll() {
    return this.adminRepository.find({
      select: ['id', 'username', 'createdAt'],
    });
  }

  findOne(id: string) {
    return this.adminRepository.findOne({ where: { id } as any });
  }

  async remove(id: string) {
    const admin = await this.adminRepository.findOne({ where: { id } as any });
    if (!admin) throw new NotFoundException('Admin not found');
    return this.adminRepository.remove(admin);
  }
}

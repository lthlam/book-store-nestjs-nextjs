import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Admin } from '../admins/entities/admin.entity';

export interface TokenPair {
  access_token: string;
  refresh_token: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
  ) {}

  /** Tạo cặp access + refresh token cho user */
  async generateUserTokens(user: User): Promise<TokenPair> {
    const payload = { sub: user.id, email: user.email };
    const accessExpiry = this.configService.get<string>(
      'JWT_ACCESS_EXPIRES_IN',
    ) as any;
    const refreshExpiry = this.configService.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
    ) as any;
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: accessExpiry,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshExpiry,
      }),
    ]);
    return { access_token, refresh_token };
  }

  /** Tạo cặp access + refresh token cho admin */
  async generateAdminTokens(admin: Admin): Promise<TokenPair> {
    const payload = { sub: admin.id, username: admin.username, role: 'admin' };
    const accessExpiry = this.configService.get<string>(
      'JWT_ACCESS_EXPIRES_IN',
    ) as any;
    const refreshExpiry = this.configService.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
    ) as any;
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: accessExpiry,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshExpiry,
      }),
    ]);
    return { access_token, refresh_token };
  }

  /** Dùng refresh token để lấy access token mới */
  async refreshTokens(refreshToken: string): Promise<{ access_token: string }> {
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException(
        'Refresh token không hợp lệ hoặc đã hết hạn',
      );
    }

    const accessExpiry = this.configService.get<string>(
      'JWT_ACCESS_EXPIRES_IN',
    ) as any;

    if (payload.role === 'admin') {
      const admin = await this.adminRepository.findOne({
        where: { id: payload.sub } as any,
      });
      if (!admin) throw new UnauthorizedException('Admin không tồn tại');

      const access_token = await this.jwtService.signAsync(
        { sub: admin.id, username: admin.username, role: 'admin' },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: accessExpiry,
        },
      );
      this.logger.log(`Admin token refreshed: ${admin.username}`);
      return { access_token };
    } else {
      const user = await this.userRepository.findOne({
        where: { id: payload.sub } as any,
      });
      if (!user) throw new UnauthorizedException('User không tồn tại');
      if (user.isBlocked)
        throw new UnauthorizedException('Tài khoản đã bị khóa');

      const access_token = await this.jwtService.signAsync(
        { sub: user.id, email: user.email },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: accessExpiry,
        },
      );
      this.logger.log(`User token refreshed: ${user.email}`);
      return { access_token };
    }
  }
}

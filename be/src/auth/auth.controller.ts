import {
  Controller,
  Post,
  Res,
  Req,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';

const COOKIE_OPTIONS = (configService: ConfigService) => {
  const isProd = configService.get('NODE_ENV') === 'production';
  const cookieDomain = configService.get<string>('COOKIE_DOMAIN'); // e.g. ".dreambook.vn"

  return {
    httpOnly: true,
    secure: isProd, // HTTPS only in production
    sameSite: 'lax' as const, // lax là đủ khi cùng domain/subdomain
    path: '/',
    ...(cookieDomain ? { domain: cookieDomain } : {}), // Subdomain sharing khi deploy
  };
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({
    summary: 'Lấy access token mới bằng refresh token trong cookie',
  })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Đọc refresh token từ httpOnly cookie
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException('Không tìm thấy refresh token');
    }

    const { access_token } = await this.authService.refreshTokens(refreshToken);

    // Set access token mới vào cookie
    res.cookie('access_token', access_token, {
      ...COOKIE_OPTIONS(this.configService),
      maxAge: 15 * 60 * 1000, // 15 phút
    });

    return { success: true };
  }

  @Public()
  @ApiOperation({ summary: 'Đăng xuất — xóa cookies' })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    return { success: true };
  }
}

/**
 * Helper để set cả 2 cookies sau khi login thành công.
 * Dùng trong UsersController và AdminsController.
 */
export function setAuthCookies(
  res: Response,
  tokens: { access_token: string; refresh_token: string },
  configService: ConfigService,
) {
  const opts = COOKIE_OPTIONS(configService);
  res.cookie('access_token', tokens.access_token, {
    ...opts,
    maxAge: 15 * 60 * 1000, // 15 phút
  });
  res.cookie('refresh_token', tokens.refresh_token, {
    ...opts,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
  });
}

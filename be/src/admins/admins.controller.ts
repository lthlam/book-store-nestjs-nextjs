import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AdminsService } from './admins.service';
import { Public } from '../auth/decorators/public.decorator';
import { Roles, Role } from '../auth/decorators/roles.decorator';
import { setAuthCookies } from '../auth/auth.controller';

@ApiTags('admins')
@ApiBearerAuth('access-token')
@Controller('admins')
export class AdminsController {
  constructor(
    private readonly adminsService: AdminsService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Đăng nhập admin — set httpOnly cookie' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: any, @Res({ passthrough: true }) res: Response) {
    const data = await this.adminsService.login(dto);
    setAuthCookies(res, data, this.configService);
    return { admin: data.admin };
  }

  @Public()
  @ApiOperation({ summary: 'Đăng xuất admin — xóa cookies' })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    return { success: true };
  }

  @Roles(Role.Admin)
  @ApiOperation({ summary: '[Admin] Lấy danh sách admin' })
  @Get()
  findAll() {
    return this.adminsService.findAll();
  }

  @Roles(Role.Admin)
  @ApiOperation({ summary: '[Admin] Lấy thông tin admin theo ID' })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminsService.findOne(id);
  }

  @Roles(Role.Admin)
  @ApiOperation({ summary: '[Admin] Xóa admin' })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminsService.remove(id);
  }
}

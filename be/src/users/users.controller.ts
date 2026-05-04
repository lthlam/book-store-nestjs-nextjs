import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  Patch,
  Delete,
  ParseUUIDPipe,
  ForbiddenException,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles, Role } from '../auth/decorators/roles.decorator';
import {
  CurrentUser,
  JwtPayload,
} from '../auth/decorators/current-user.decorator';
import { setAuthCookies } from '../auth/auth.controller';

@ApiTags('users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @ApiResponse({ status: 201, description: 'Tạo tài khoản thành công' })
  @ApiResponse({ status: 409, description: 'Email đã tồn tại' })
  @Post('signup')
  signup(@Body() dto: CreateUserDto) {
    return this.usersService.signup(dto);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Đăng nhập — set httpOnly cookie' })
  @ApiResponse({ status: 200, description: 'Đăng nhập thành công' })
  @ApiResponse({ status: 401, description: 'Sai thông tin đăng nhập' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.usersService.login(dto);
    setAuthCookies(res, data, this.configService);
    // Trả về user info (không trả token — đã set vào cookie)
    return { user: data.user };
  }

  @Public()
  @ApiOperation({ summary: 'Đăng nhập bằng mạng xã hội — set httpOnly cookie' })
  @Post('social-login')
  @HttpCode(HttpStatus.OK)
  async socialLogin(
    @Body() dto: { email: string; name: string; avatar?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.usersService.socialLogin(dto);
    setAuthCookies(res, data, this.configService);
    return { user: data.user };
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

  @Roles(Role.Admin)
  @ApiOperation({ summary: '[Admin] Lấy danh sách tất cả người dùng' })
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @ApiOperation({ summary: 'Lấy thông tin người dùng theo ID' })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @ApiOperation({
    summary: 'Cập nhật thông tin cá nhân (name, contact, password, image)',
  })
  @Patch(':id')
  updateProfile(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProfileDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    if (currentUser.sub !== id) {
      throw new ForbiddenException(
        'Bạn không có quyền cập nhật thông tin của người dùng khác',
      );
    }
    return this.usersService.updateProfile(id, dto);
  }

  @Roles(Role.Admin)
  @ApiOperation({ summary: '[Admin] Block hoặc unblock tài khoản người dùng' })
  @Patch(':id/block')
  setBlockStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminUpdateUserDto,
  ) {
    return this.usersService.setBlockStatus(id, dto);
  }

  @Roles(Role.Admin)
  @ApiOperation({ summary: '[Admin] Xóa người dùng' })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}

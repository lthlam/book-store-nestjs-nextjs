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
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles, Role } from '../auth/decorators/roles.decorator';

@ApiTags('users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
  @ApiOperation({ summary: 'Đăng nhập' })
  @ApiResponse({ status: 200, description: 'Đăng nhập thành công, trả về access_token' })
  @ApiResponse({ status: 401, description: 'Sai thông tin đăng nhập' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.usersService.login(dto);
  }

  @Public()
  @ApiOperation({ summary: 'Đăng nhập bằng mạng xã hội (Google, GitHub...)' })
  @Post('social-login')
  @HttpCode(HttpStatus.OK)
  socialLogin(@Body() dto: { email: string; name: string; avatar?: string }) {
    return this.usersService.socialLogin(dto);
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

  @ApiOperation({ summary: 'Cập nhật thông tin người dùng' })
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Roles(Role.Admin)
  @ApiOperation({ summary: '[Admin] Xóa người dùng' })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}

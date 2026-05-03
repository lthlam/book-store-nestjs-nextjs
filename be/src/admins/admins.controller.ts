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
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AdminsService } from './admins.service';
import { Public } from '../auth/decorators/public.decorator';
import { Roles, Role } from '../auth/decorators/roles.decorator';

@ApiTags('admins')
@ApiBearerAuth('access-token')
@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Đăng nhập admin' })
  @ApiResponse({ status: 200, description: 'Trả về access_token với role admin' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: any) {
    return this.adminsService.login(dto);
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

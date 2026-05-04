import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AddressService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles, Role } from '../auth/decorators/roles.decorator';
import {
  CurrentUser,
  JwtPayload,
} from '../auth/decorators/current-user.decorator';

@ApiTags('addresses')
@ApiBearerAuth('access-token')
@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @ApiOperation({ summary: 'Tạo địa chỉ giao hàng mới (userId lấy từ JWT)' })
  @Post()
  create(
    @Body() createDto: CreateAddressDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    // userId luôn lấy từ JWT — không tin vào body
    return this.addressService.create(currentUser.sub, createDto);
  }

  @Roles(Role.Admin)
  @ApiOperation({ summary: '[Admin] Lấy tất cả địa chỉ' })
  @Get()
  findAll() {
    return this.addressService.findAll();
  }

  @ApiOperation({ summary: 'Lấy danh sách địa chỉ của user đang đăng nhập' })
  @Get('my')
  findMyAddresses(@CurrentUser() currentUser: JwtPayload) {
    return this.addressService.findByUser(currentUser.sub);
  }

  @Roles(Role.Admin)
  @ApiOperation({ summary: '[Admin] Lấy địa chỉ của một user cụ thể' })
  @Get('user/:userId')
  findByUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.addressService.findByUser(userId);
  }

  @Public()
  @ApiOperation({ summary: 'Lấy danh sách tỉnh/thành phố' })
  @Get('provinces')
  findAllProvinces() {
    return this.addressService.findAllProvinces();
  }

  @Public()
  @ApiOperation({ summary: 'Lấy danh sách phường/xã theo tỉnh' })
  @ApiQuery({ name: 'provinceCode', required: true, example: '01' })
  @Get('wards')
  findWards(@Query('provinceCode') provinceCode: string) {
    return this.addressService.findWardsByProvince(provinceCode);
  }

  @ApiOperation({ summary: 'Lấy địa chỉ theo ID' })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.addressService.findOne(id);
  }

  @ApiOperation({
    summary: 'Cập nhật địa chỉ (chỉ được cập nhật địa chỉ của mình)',
  })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateAddressDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.addressService.update(id, currentUser.sub, updateDto);
  }

  @ApiOperation({ summary: 'Xóa địa chỉ (chỉ được xóa địa chỉ của mình)' })
  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.addressService.remove(id, currentUser.sub);
  }
}

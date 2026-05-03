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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AddressService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles, Role } from '../auth/decorators/roles.decorator';

@ApiTags('addresses')
@ApiBearerAuth('access-token')
@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @ApiOperation({ summary: 'Tạo địa chỉ giao hàng mới' })
  @Post()
  create(@Body() createDto: CreateAddressDto) {
    return this.addressService.create(createDto);
  }

  @Roles(Role.Admin)
  @ApiOperation({ summary: '[Admin] Lấy tất cả địa chỉ' })
  @Get()
  findAll() {
    return this.addressService.findAll();
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

  @ApiOperation({ summary: 'Cập nhật địa chỉ' })
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: UpdateAddressDto) {
    return this.addressService.update(id, updateDto);
  }

  @ApiOperation({ summary: 'Xóa địa chỉ' })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.addressService.remove(id);
  }
}

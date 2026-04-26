import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { AddressService } from './addresses.service';

@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  create(@Body() createDto: any) {
    return this.addressService.create(createDto);
  }

  @Get()
  findAll() {
    return this.addressService.findAll();
  }

  @Get('provinces')
  findAllProvinces() {
    return this.addressService.findAllProvinces();
  }

  @Get('wards')
  findWards(@Query('provinceCode') provinceCode: string) {
    return this.addressService.findWardsByProvince(provinceCode);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.addressService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.addressService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.addressService.remove(id);
  }
}

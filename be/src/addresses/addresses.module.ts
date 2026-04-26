import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from './entities/address.entity';
import { Province } from './entities/province.entity';
import { Ward } from './entities/ward.entity';
import { AddressController } from './addresses.controller';
import { AddressService } from './addresses.service';

@Module({
  imports: [TypeOrmModule.forFeature([Address, Province, Ward])],
  controllers: [AddressController],
  providers: [AddressService],
  exports: [AddressService],
})
export class AddressModule {}

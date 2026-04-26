import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { Province } from './entities/province.entity';
import { Ward } from './entities/ward.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,
    @InjectRepository(Ward)
    private readonly wardRepository: Repository<Ward>,
  ) {}

  async create(createDto: CreateAddressDto) {
    const entity = this.addressRepository.create({
      street: createDto.street,
      wardCode: createDto.wardCode,
      contactName: createDto.contactName,
      phoneNumber: createDto.phoneNumber,
      user: { id: createDto.userId } as any,
    });
    return this.addressRepository.save(entity);
  }

  async findAll() {
    return this.addressRepository.find({
      relations: ['user', 'ward', 'ward.province'],
    });
  }

  async findOne(id: string) {
    const address = await this.addressRepository.findOne({
      where: { id } as any,
      relations: ['user', 'ward', 'ward.province'],
    });
    if (!address) throw new NotFoundException('Address not found');
    return address;
  }

  async update(id: string, updateDto: UpdateAddressDto) {
    const address = await this.findOne(id);
    Object.assign(address, updateDto);
    return this.addressRepository.save(address);
  }

  async remove(id: string) {
    const address = await this.findOne(id);
    return this.addressRepository.remove(address);
  }

  async findAllProvinces() {
    return this.provinceRepository.find({ order: { name: 'ASC' } });
  }

  async findWardsByProvince(provinceCode: string) {
    return this.wardRepository.find({
      where: { provinceCode },
      order: { name: 'ASC' },
    });
  }
}

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
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

  /** Tạo địa chỉ — userId lấy từ JWT, không nhận từ body */
  async create(userId: string, createDto: Omit<CreateAddressDto, 'userId'>) {
    const entity = this.addressRepository.create({
      street: createDto.street,
      wardCode: createDto.wardCode,
      contactName: createDto.contactName,
      phoneNumber: createDto.phoneNumber,
      user: { id: userId } as any,
    });
    return this.addressRepository.save(entity);
  }

  async findAll() {
    return this.addressRepository.find({
      relations: ['user', 'ward', 'ward.province'],
    });
  }

  /** Lấy địa chỉ của user — chỉ trả về địa chỉ của chính user đó */
  async findByUser(userId: string) {
    return this.addressRepository.find({
      where: { user: { id: userId } } as any,
      relations: ['ward', 'ward.province'],
      order: { id: 'ASC' },
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

  /** Cập nhật địa chỉ — kiểm tra ownership */
  async update(id: string, userId: string, updateDto: UpdateAddressDto) {
    const address = await this.findOne(id);
    if (address.user?.id !== userId) {
      throw new ForbiddenException('Bạn không có quyền cập nhật địa chỉ này');
    }
    Object.assign(address, updateDto);
    return this.addressRepository.save(address);
  }

  /** Xóa địa chỉ — kiểm tra ownership */
  async remove(id: string, userId: string) {
    const address = await this.findOne(id);
    if (address.user?.id !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa địa chỉ này');
    }
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

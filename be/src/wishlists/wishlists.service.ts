import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
  ) {}

  async create(createDto: CreateWishlistDto) {
    const entity = this.wishlistRepository.create({
      user: { id: createDto.userId } as any,
      products: createDto.productIds.map((id) => ({ id })) as any,
    });
    return this.wishlistRepository.save(entity);
  }

  async findAll() {
    return this.wishlistRepository.find({ relations: ['user', 'products'] });
  }

  async findOne(id: string) {
    const wishlist = await this.wishlistRepository.findOne({
      where: { id } as any,
      relations: ['user', 'products'],
    });
    if (!wishlist) throw new NotFoundException('Wishlist not found');
    return wishlist;
  }

  async update(id: string, updateDto: UpdateWishlistDto) {
    const wishlist = await this.findOne(id);
    if (updateDto.productIds) {
      wishlist.products = updateDto.productIds.map((id) => ({ id })) as any;
    }
    return this.wishlistRepository.save(wishlist);
  }

  async remove(id: string) {
    const wishlist = await this.findOne(id);
    return this.wishlistRepository.remove(wishlist);
  }
}

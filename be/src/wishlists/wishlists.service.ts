import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
  ) {}

  /** Tạo hoặc lấy wishlist của user — userId từ JWT */
  async createOrGet(userId: string, productIds: string[] = []) {
    let wishlist = await this.wishlistRepository.findOne({
      where: { user: { id: userId } } as any,
      relations: ['user', 'products'],
    });
    if (!wishlist) {
      wishlist = this.wishlistRepository.create({
        user: { id: userId } as any,
        products: productIds.map((id) => ({ id })) as any,
      });
      wishlist = await this.wishlistRepository.save(wishlist);
    }
    return wishlist;
  }

  findAll() {
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

  async findByUser(userId: string) {
    return this.wishlistRepository.findOne({
      where: { user: { id: userId } } as any,
      relations: ['products'],
    });
  }

  async update(id: string, userId: string, updateDto: UpdateWishlistDto) {
    const wishlist = await this.findOne(id);
    if (wishlist.user?.id !== userId) {
      throw new ForbiddenException('Bạn không có quyền cập nhật wishlist này');
    }
    if (updateDto.productIds) {
      wishlist.products = updateDto.productIds.map((id) => ({ id })) as any;
    }
    return this.wishlistRepository.save(wishlist);
  }

  async remove(id: string, userId: string) {
    const wishlist = await this.findOne(id);
    if (wishlist.user?.id !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa wishlist này');
    }
    return this.wishlistRepository.remove(wishlist);
  }
}

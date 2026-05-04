import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
  ) {}

  /** Tạo hoặc lấy giỏ hàng của user — userId từ JWT */
  async createOrGet(userId: string, items: any[] = []) {
    // Kiểm tra đã có cart chưa
    let cart = await this.cartRepository.findOne({
      where: { user: { id: userId } } as any,
      relations: ['user'],
    });
    if (!cart) {
      cart = this.cartRepository.create({
        items,
        user: { id: userId } as any,
      });
      cart = await this.cartRepository.save(cart);
      this.logger.log(`Cart created for user: ${userId}`);
    }
    return cart;
  }

  findAll() {
    return this.cartRepository.find({ relations: ['user'] });
  }

  async findOne(id: string) {
    const cart = await this.cartRepository.findOne({
      where: { id } as any,
      relations: ['user'],
    });
    if (!cart) throw new NotFoundException('Cart not found');
    return cart;
  }

  /** Lấy giỏ hàng của user hiện tại */
  async findByUser(userId: string) {
    return this.cartRepository.findOne({
      where: { user: { id: userId } } as any,
      relations: ['user'],
    });
  }

  async update(id: string, userId: string, updateDto: UpdateCartDto) {
    const cart = await this.findOne(id);
    if (cart.user?.id !== userId) {
      throw new ForbiddenException('Bạn không có quyền cập nhật giỏ hàng này');
    }
    if (updateDto.items) cart.items = updateDto.items;
    return this.cartRepository.save(cart);
  }

  async remove(id: string, userId: string) {
    const cart = await this.findOne(id);
    if (cart.user?.id !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa giỏ hàng này');
    }
    return this.cartRepository.remove(cart);
  }
}

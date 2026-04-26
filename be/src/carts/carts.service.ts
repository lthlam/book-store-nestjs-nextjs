import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
  ) {}

  async create(createDto: CreateCartDto) {
    const entity = this.cartRepository.create({
      items: createDto.items,
      user: { id: createDto.userId } as any,
    });
    return this.cartRepository.save(entity);
  }

  async findAll() {
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

  async update(id: string, updateDto: UpdateCartDto) {
    const cart = await this.findOne(id);
    if (updateDto.items) cart.items = updateDto.items;
    return this.cartRepository.save(cart);
  }

  async remove(id: string) {
    const cart = await this.findOne(id);
    return this.cartRepository.remove(cart);
  }
}

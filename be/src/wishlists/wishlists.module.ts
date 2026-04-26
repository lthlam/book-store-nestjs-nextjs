import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { WishlistController } from './wishlists.controller';
import { WishlistService } from './wishlists.service';

@Module({
  imports: [TypeOrmModule.forFeature([Wishlist])],
  controllers: [WishlistController],
  providers: [WishlistService],
  exports: [WishlistService],
})
export class WishlistModule {}

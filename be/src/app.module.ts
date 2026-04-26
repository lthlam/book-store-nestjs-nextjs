import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AdminsModule } from './admins/admins.module';
import { GenresModule } from './genres/genres.module';
import { ProductModule } from './products/products.module';
import { CartModule } from './carts/carts.module';
import { WishlistModule } from './wishlists/wishlists.module';
import { OrderModule } from './orders/orders.module';
import { CouponModule } from './coupons/coupons.module';
import { AddressModule } from './addresses/addresses.module';
import { UploadsModule } from './uploads/uploads.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AuthorsModule } from './authors/authors.module';
import { PublishersModule } from './publishers/publishers.module';
import { ContactsModule } from './contacts/contacts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        autoLoadEntities: true,
        synchronize: false,
        ssl: true,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AdminsModule,
    GenresModule,
    ProductModule,
    CartModule,
    WishlistModule,
    OrderModule,
    CouponModule,
    AddressModule,
    UploadsModule,
    ReviewsModule,
    AuthorsModule,
    PublishersModule,
    ContactsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/admin.guard';
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
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
        ssl: configService.get<string>('DATABASE_SSL') === 'false' ? false : true,
      }),
      inject: [ConfigService],
    }),
    // Rate limiting: 100 req/phút, auth endpoints override chặt hơn
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60000, limit: 100 }]),
    // In-memory cache global — genres/authors/publishers dùng TTL 5 phút
    CacheModule.register({ isGlobal: true, ttl: 300_000, max: 500 }),
    AuthModule,
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
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}

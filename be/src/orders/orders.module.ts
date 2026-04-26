import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Address } from '../addresses/entities/address.entity';
import { OrderController } from './orders.controller';
import { OrderService } from './orders.service';
import { VnpayModule } from 'nestjs-vnpay';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { ignoreLogger } from 'vnpay';
import { HttpModule } from '@nestjs/axios';
import { MomoService } from './momo.service';
import { ProductModule } from '../products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Address]),
    VnpayModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secureSecret: configService.getOrThrow<string>('VNPAY_SECURE_SECRET'),
        tmnCode: configService.getOrThrow<string>('VNPAY_TMN_CODE'),
        testMode: true,
        enableLog: true,
        loggerFn: ignoreLogger,
      }),
      inject: [ConfigService],
    }),
    HttpModule,
    ProductModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, MomoService],
  exports: [OrderService],
})
export class OrderModule {}

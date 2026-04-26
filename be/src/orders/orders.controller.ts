import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { OrderService } from './orders.service';
import { VnpayService } from 'nestjs-vnpay';
import { ProductCode, VnpLocale } from 'vnpay';
import { MomoService } from './momo.service';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly vnpayService: VnpayService,
    private readonly momoService: MomoService,
  ) {}

  @Post()
  async create(@Body() createDto: any) {
    const order = await this.orderService.create(createDto);

    if (createDto.paymentMethod === 'vnpay') {
      const paymentUrl = this.vnpayService.buildPaymentUrl({
        vnp_Amount: Number(order.total),
        vnp_IpAddr: '127.0.0.1',
        vnp_TxnRef: order.id + Date.now(),
        vnp_OrderInfo: 'Thanh toan don hang ' + order.id.slice(0, 8),
        vnp_OrderType: ProductCode.Other,
        vnp_ReturnUrl: 'http://localhost:3000/checkout/vnpay-return',
        vnp_Locale: VnpLocale.VN,
      });
      console.log('abc', paymentUrl);
      return { ...order, paymentUrl };
    }

    if (createDto.paymentMethod === 'momo') {
      const paymentUrl = await this.momoService.createPaymentUrl(
        order.id,
        Number(order.total),
      );
      return { ...order, paymentUrl };
    }

    return order;
  }

  @Get('vnpay-return')
  async vnpayReturn(@Query() query: any) {
    const result = await this.vnpayService.verifyReturnUrl(query);
    if (!result.isSuccess) {
      return { success: false, message: 'Invalid signature' };
    }
    const orderId = query.vnp_TxnRef;
    const responseCode = query.vnp_ResponseCode;

    if (responseCode === '00') {
      await this.orderService.update(orderId, { status: 'confirmed' } as any);
      return { success: true, orderId };
    } else {
      return { success: false, responseCode };
    }
  }

  @Get('momo-return')
  async momoReturn(@Query() query: any) {
    const isValid = this.momoService.verifySignature(query);
    if (!isValid) return { success: false, message: 'Invalid signature' };

    const orderId = query.orderId;
    const resultCode = query.resultCode;

    if (resultCode == '0') {
      await this.orderService.update(orderId, { status: 'confirmed' } as any);
      return { success: true, orderId };
    } else {
      return { success: false, resultCode, message: query.message };
    }
  }

  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Get(':id/invoice')
  async findInvoice(@Param('id') id: string, @Res() res: Response) {
    const pdf = await this.orderService.generatePdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=invoice-${id.slice(0, 8)}.pdf`,
      'Content-Length': pdf.length,
    });
    res.end(pdf);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.orderService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }
}

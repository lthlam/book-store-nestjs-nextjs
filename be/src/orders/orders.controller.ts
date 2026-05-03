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
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrderService } from './orders.service';
import { VnpayService } from 'nestjs-vnpay';
import { ProductCode, VnpLocale } from 'vnpay';
import { MomoService } from './momo.service';
import { Public } from '../auth/decorators/public.decorator';
import { Roles, Role } from '../auth/decorators/roles.decorator';

@ApiTags('orders')
@ApiBearerAuth('access-token')
@Controller('orders')
export class OrderController {
  private readonly logger = new Logger(OrderController.name);

  constructor(
    private readonly orderService: OrderService,
    private readonly vnpayService: VnpayService,
    private readonly momoService: MomoService,
  ) {}

  @ApiOperation({ summary: 'Tạo đơn hàng (hỗ trợ COD / VNPay / MoMo)' })
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
      this.logger.log(`VNPay URL generated for order ${order.id}`);
      return { ...order, paymentUrl };
    }

    if (createDto.paymentMethod === 'momo') {
      const paymentUrl = await this.momoService.createPaymentUrl(order.id, Number(order.total));
      return { ...order, paymentUrl };
    }

    return order;
  }

  @Public()
  @ApiOperation({ summary: 'VNPay callback sau thanh toán' })
  @Get('vnpay-return')
  async vnpayReturn(@Query() query: any) {
    const result = await this.vnpayService.verifyReturnUrl(query);
    if (!result.isSuccess) return { success: false, message: 'Invalid signature' };

    const orderId = query.vnp_TxnRef;
    if (query.vnp_ResponseCode === '00') {
      await this.orderService.update(orderId, { status: 'confirmed' } as any);
      return { success: true, orderId };
    }
    return { success: false, responseCode: query.vnp_ResponseCode };
  }

  @Public()
  @ApiOperation({ summary: 'MoMo callback sau thanh toán' })
  @Get('momo-return')
  async momoReturn(@Query() query: any) {
    const isValid = this.momoService.verifySignature(query);
    if (!isValid) return { success: false, message: 'Invalid signature' };

    const orderId = query.orderId;
    if (query.resultCode == '0') {
      await this.orderService.update(orderId, { status: 'confirmed' } as any);
      return { success: true, orderId };
    }
    return { success: false, resultCode: query.resultCode, message: query.message };
  }

  @Roles(Role.Admin)
  @ApiOperation({ summary: '[Admin] Lấy tất cả đơn hàng' })
  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @ApiOperation({ summary: 'Lấy chi tiết đơn hàng theo ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @ApiOperation({ summary: 'Tải hóa đơn PDF (chỉ đơn đã giao)' })
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

  @ApiOperation({ summary: 'Cập nhật trạng thái đơn hàng' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.orderService.update(id, updateDto);
  }

  @Roles(Role.Admin)
  @ApiOperation({ summary: '[Admin] Xóa đơn hàng' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }
}

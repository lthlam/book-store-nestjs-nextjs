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
  ForbiddenException,
  ParseUUIDPipe,
  Inject,
  Ip,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrderService } from './orders.service';
import { VnpayService } from 'nestjs-vnpay';
import { ProductCode, VnpLocale } from 'vnpay';
import { MomoService } from './momo.service';
import { Public } from '../auth/decorators/public.decorator';
import { Roles, Role } from '../auth/decorators/roles.decorator';
import {
  CurrentUser,
  JwtPayload,
} from '../auth/decorators/current-user.decorator';
import { SkipThrottle } from '@nestjs/throttler';

@ApiTags('orders')
@ApiBearerAuth('access-token')
@Controller('orders')
export class OrderController {
  private readonly logger = new Logger(OrderController.name);

  constructor(
    private readonly orderService: OrderService,
    private readonly vnpayService: VnpayService,
    private readonly momoService: MomoService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @ApiOperation({ summary: 'Tạo đơn hàng (userId lấy từ JWT)' })
  @Post()
  async create(
    @Body() createDto: any,
    @CurrentUser() currentUser: JwtPayload,
    @Ip() ip: string,
  ) {
    const userId = currentUser.sub;
    const dto = { ...createDto, userId };

    // Nếu là COD -> Ghi nhận vào DB luôn
    if (createDto.paymentMethod === 'cod') {
      return this.orderService.create(dto);
    }

    // Nếu là VNPay/MoMo -> Chỉ lưu vào Cache tạm thời, chưa ghi vào DB
    const tempId = crypto.randomUUID();
    await this.cacheManager.set(`pending_order:${tempId}`, dto, 1800000); // 30 phút

    if (createDto.paymentMethod === 'vnpay') {
      const txnRef = `${tempId.replace(/-/g, '').slice(0, 20)}_${Date.now()}`;
      const paymentUrl = this.vnpayService.buildPaymentUrl({
        vnp_Amount: Number(createDto.totalAmount || createDto.total || 0),
        vnp_IpAddr: ip,
        vnp_TxnRef: txnRef,
        vnp_OrderInfo: tempId, // Dùng tempId để lookup sau này
        vnp_OrderType: ProductCode.Other,
        vnp_ReturnUrl: this.configService.getOrThrow('VNPAY_RETURN_URL'),
        vnp_Locale: VnpLocale.VN,
      });
      return { paymentUrl };
    }

    if (createDto.paymentMethod === 'momo') {
      const paymentUrl = await this.momoService.createPaymentUrl(
        tempId,
        Number(createDto.totalAmount || createDto.total || 0),
      );
      return { paymentUrl };
    }

    return { message: 'Invalid payment method' };
  }

  @Public()
  @SkipThrottle()
  @ApiOperation({ summary: 'VNPay callback sau thanh toán' })
  @Get('vnpay-return')
  async vnpayReturn(@Query() query: any) {
    const result = await this.vnpayService.verifyReturnUrl(query);
    if (!result.isSuccess)
      return { success: false, message: 'Invalid signature' };

    const tempId = query.vnp_OrderInfo;
    const pendingOrder = await this.cacheManager.get<any>(
      `pending_order:${tempId}`,
    );

    if (query.vnp_ResponseCode === '00' && pendingOrder) {
      // Thanh toán thành công -> Mới bắt đầu ghi nhận đơn hàng vào DB
      const order = await this.orderService.create(pendingOrder);
      await this.orderService.update(order.id, { status: 'confirmed' } as any);
      await this.cacheManager.del(`pending_order:${tempId}`);
      return { success: true, orderId: order.id };
    }

    // Nếu thất bại hoặc hết hạn cache -> Xóa cache (đơn hàng coi như chưa từng tồn tại)
    await this.cacheManager.del(`pending_order:${tempId}`);
    return { success: false, responseCode: query.vnp_ResponseCode };
  }

  @Public()
  @SkipThrottle()
  @ApiOperation({ summary: 'MoMo callback sau thanh toán' })
  @Get('momo-return')
  async momoReturn(@Query() query: any) {
    const isValid = this.momoService.verifySignature(query);
    if (!isValid) return { success: false, message: 'Invalid signature' };

    const tempId = query.orderId;
    const pendingOrder = await this.cacheManager.get<any>(
      `pending_order:${tempId}`,
    );

    if (query.resultCode == '0' && pendingOrder) {
      // Thanh toán thành công -> Mới ghi nhận vào DB
      const order = await this.orderService.create(pendingOrder);
      await this.orderService.update(order.id, { status: 'confirmed' } as any);
      await this.cacheManager.del(`pending_order:${tempId}`);
      return { success: true, orderId: order.id };
    }

    // Xóa cache nếu thất bại
    await this.cacheManager.del(`pending_order:${tempId}`);
    return {
      success: false,
      resultCode: query.resultCode,
      message: query.message,
    };
  }

  @Roles(Role.Admin)
  @ApiOperation({ summary: '[Admin] Lấy tất cả đơn hàng' })
  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @ApiOperation({ summary: 'Lấy đơn hàng của user hiện tại' })
  @Get('my')
  findMyOrders(@CurrentUser() currentUser: JwtPayload) {
    return this.orderService.findByUser(currentUser.sub);
  }

  @ApiOperation({ summary: 'Lấy chi tiết đơn hàng (chỉ của mình hoặc admin)' })
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    const order = await this.orderService.findOne(id);
    // Admin có thể xem tất cả, user chỉ xem đơn của mình
    if (currentUser.role !== 'admin' && order.user?.id !== currentUser.sub) {
      throw new ForbiddenException('Bạn không có quyền xem đơn hàng này');
    }
    return order;
  }

  @ApiOperation({
    summary: 'Tải hóa đơn PDF (chỉ đơn đã giao, chỉ của mình hoặc admin)',
  })
  @Get(':id/invoice')
  async findInvoice(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    const order = await this.orderService.findOne(id);
    if (currentUser.role !== 'admin' && order.user?.id !== currentUser.sub) {
      throw new ForbiddenException('Bạn không có quyền tải hóa đơn này');
    }
    const pdf = await this.orderService.generatePdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=invoice-${id.slice(0, 8)}.pdf`,
      'Content-Length': pdf.length,
    });
    res.end(pdf);
  }

  @ApiOperation({
    summary: 'Cập nhật trạng thái đơn hàng (user chỉ được hủy đơn của mình)',
  })
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: any,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    const order = await this.orderService.findOne(id);

    if (currentUser.role !== 'admin') {
      // User chỉ được cập nhật đơn của mình
      if (order.user?.id !== currentUser.sub) {
        throw new ForbiddenException(
          'Bạn không có quyền cập nhật đơn hàng này',
        );
      }
      // User chỉ được hủy đơn, không được tự chuyển sang delivered/confirmed/shipped
      if (updateDto.status && updateDto.status !== 'cancelled') {
        throw new ForbiddenException('Bạn chỉ có thể hủy đơn hàng của mình');
      }
    }

    return this.orderService.update(id, updateDto);
  }

  @Roles(Role.Admin)
  @ApiOperation({ summary: '[Admin] Xóa đơn hàng' })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.orderService.remove(id);
  }
}

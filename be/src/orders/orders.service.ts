import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { Address } from '../addresses/entities/address.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ProductService } from '../products/products.service';
import * as puppeteer from 'puppeteer';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    private readonly productService: ProductService,
  ) {}

  async create(createDto: CreateOrderDto) {
    let addressData: any = createDto.address;

    if (createDto.addressId && !addressData) {
      const addr = await this.addressRepository.findOne({
        where: { id: createDto.addressId } as any,
        relations: ['ward', 'ward.province'],
      });
      if (addr) {
        addressData = {
          street: addr.street,
          wardCode: addr.wardCode,
          ward: addr.ward?.name || addr.wardCode,
          province: addr.ward?.province?.name || '',
        };
      }
    }

    // Fallback: use empty object if still null (prevent DB error)
    if (!addressData) {
      addressData = { street: 'N/A' };
    }

    const entity = this.orderRepository.create({
      user: { id: createDto.userId } as any,
      orderDetails: createDto.items || createDto.orderDetails || [],
      address: addressData,
      total: createDto.totalAmount || createDto.total || 0,
      shipping: createDto.shipping || 0,
      discount: createDto.discount || 0,
      date: new Date().toLocaleDateString('vi-VN'),
      status: createDto.status || 'pending',
    });

    return this.orderRepository.save(entity);
  }

  async findAll() {
    return this.orderRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const order = await this.orderRepository.findOne({
      where: { id } as any,
      relations: ['user'],
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async update(id: string, updateDto: UpdateOrderDto) {
    const order = await this.findOne(id);

    // Bổ sung State Machine: Các quy tắc chuyển đổi trạng thái
    if (updateDto.status && updateDto.status !== order.status) {
      const current = order.status || 'pending';
      const target = updateDto.status;

      // 1. Nếu đã giao hoặc đã hủy -> Khóa không cho đổi nữa
      if (current === 'delivered' || current === 'cancelled') {
        throw new BadRequestException(
          `Không thể thay đổi trạng thái của đơn hàng đã ${current}`,
        );
      }

      // 2. Nếu mới đặt (pending) -> Cho phép chuyển sang confirmed, shipped hoặc cancelled
      if (
        current === 'pending' &&
        !['confirmed', 'shipped', 'cancelled'].includes(target)
      ) {
        throw new BadRequestException(
          `Đơn hàng 'pending' chỉ có thể chuyển sang 'confirmed', 'shipped' hoặc 'cancelled'`,
        );
      }

      // 3. Nếu đã xác nhận (confirmed) -> Cho phép chuyển sang shipped hoặc cancelled
      if (
        current === 'confirmed' &&
        !['shipped', 'cancelled'].includes(target)
      ) {
        throw new BadRequestException(
          `Đơn hàng 'confirmed' chỉ có thể chuyển sang 'shipped' hoặc 'cancelled'`,
        );
      }

      // 4. Nếu đang giao (shipped) -> Cho phép chuyển sang delivered hoặc cancelled
      if (
        current === 'shipped' &&
        !['delivered', 'cancelled'].includes(target)
      ) {
        throw new BadRequestException(
          `Đơn hàng 'shipped' chỉ có thể chuyển sang 'delivered' hoặc 'cancelled'`,
        );
      }
    }

    Object.assign(order, updateDto);
    return this.orderRepository.save(order);
  }

  async remove(id: string) {
    const order = await this.findOne(id);
    return this.orderRepository.remove(order);
  }

  async generatePdf(id: string): Promise<Buffer> {
    const order = await this.findOne(id);
    if (!order) throw new NotFoundException('Order not found');

    if (order.status !== 'delivered') {
      throw new BadRequestException(
        'Chỉ có thể xuất hóa đơn cho đơn hàng đã giao thành công',
      );
    }

    // Enrich order details with product info efficiently
    const productIds = [
      ...new Set((order.orderDetails || []).map((item: any) => item.productId)),
    ];
    const products = await this.productService.findByIds(productIds);
    const productMap = new Map(products.map((p) => [p.id, p]));

    const enrichedDetails = (order.orderDetails || []).map((item: any) => ({
      ...item,
      product: productMap.get(item.productId) || null,
    }));

    const html = this.buildInvoiceHTML(order, enrichedDetails);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
    });
    await browser.close();

    return pdf as Buffer;
  }

  private buildInvoiceHTML(order: Order, items: any[]) {
    const formatVND = (v: number) =>
      Number(v).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
          .invoice-box { width: 100%; padding: 30px; }
        </style>
      </head>
      <body class="bg-white">
        <div class="invoice-box">
          <div class="flex justify-between items-center mb-10">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-1">DreamBook</h1>
              <p class="text-sm text-gray-500 italic">Reading is dreaming with open eyes</p>
            </div>
            <div class="text-right">
              <h2 class="text-2xl font-bold text-red-600">INVOICE</h2>
              <p class="text-sm text-gray-500 font-mono mt-1">#${order.id.slice(0, 8).toUpperCase()}</p>
              <p class="text-sm text-gray-500">Date: ${new Date(order.createdAt).toLocaleDateString('en-CA')}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-8 mb-10">
            <div>
              <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Billed To</h3>
              <p class="text-gray-900 font-bold text-lg">${order.user?.name || 'Customer'}</p>
              <p class="text-gray-600">${order.user?.email || ''}</p>
            </div>
            <div class="text-right">
              <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Shipping Information</h3>
              <p class="text-gray-700">${order.address?.street || 'N/A'}</p>
              <p class="text-gray-700">${order.address?.ward || ''}, ${order.address?.province || ''}</p>
            </div>
          </div>

          <table class="w-full mb-10">
            <thead>
              <tr class="border-b-2 border-gray-100 text-left">
                <th class="py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Item</th>
                <th class="py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Qty</th>
                <th class="py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Price</th>
                <th class="py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${items
                .map(
                  (item) => `
                <tr class="border-b border-gray-50">
                  <td class="py-5">
                    <p class="text-gray-900 font-bold">${item.product?.title || 'Unknown Product'}</p>
                    <p class="text-xs text-gray-400">ID: ${item.productId.slice(0, 8)}</p>
                  </td>
                  <td class="py-5 text-center text-gray-700">${item.quantity}</td>
                  <td class="py-5 text-right text-gray-700">${formatVND(item.price)}</td>
                  <td class="py-5 text-right font-bold text-gray-900">${formatVND(item.price * item.quantity)}</td>
                </tr>
              `,
                )
                .join('')}
            </tbody>
          </table>

          <div class="flex justify-end pt-5 border-t-2 border-gray-100">
            <div class="w-64">
              <div class="flex justify-between mb-2">
                <span class="text-gray-500 font-medium">Subtotal</span>
                <span class="text-gray-900 font-bold">${formatVND(Number(order.total) + Number(order.discount) - Number(order.shipping || 0))}</span>
              </div>
              <div class="flex justify-between mb-2">
                <span class="text-gray-500 font-medium">Discount</span>
                <span class="text-green-600 font-bold">-${formatVND(order.discount)}</span>
              </div>
              <div class="flex justify-between mb-4 pb-4 border-b border-gray-50">
                <span class="text-gray-500 font-medium">Shipping</span>
                <span class="text-gray-900 font-bold">${formatVND(order.shipping || 0)}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-900 font-black text-lg">Total Due</span>
                <span class="text-red-600 font-black text-2xl">${formatVND(order.total)}</span>
              </div>
            </div>
          </div>

          <div class="mt-20 pt-10 border-t border-gray-100 text-center">
            <p class="text-gray-400 text-sm font-medium tracking-wide">Thank you for choosing DreamBook</p>
            <div class="flex justify-center gap-4 mt-2">
              <span class="text-[10px] text-gray-300">ModernBook.com</span>
              <span class="text-[10px] text-gray-300">support@modernbook.com</span>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

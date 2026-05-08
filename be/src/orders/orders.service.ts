import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { Address } from '../addresses/entities/address.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ProductService } from '../products/products.service';
import * as path from 'path';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfmake = require('pdfmake');

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    private readonly productService: ProductService,
    private readonly dataSource: DataSource,
  ) {}

  async create(createDto: CreateOrderDto) {
    // Dùng transaction để đảm bảo tính nhất quán dữ liệu:
    // nếu bất kỳ bước nào thất bại, toàn bộ sẽ rollback
    return this.dataSource.transaction(async (manager) => {
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

      if (!addressData) {
        addressData = { street: 'N/A' };
      }

      const orderDetails = createDto.items || createDto.orderDetails || [];

      // Xác thực số lượng tồn kho
      for (const item of orderDetails) {
        const product = await this.productService.findOne(item.productId);
        if (!product) {
          throw new NotFoundException(`Product ${item.productId} not found`);
        }
        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Sản phẩm ${product.title} không đủ số lượng (còn ${product.stock}, yêu cầu ${item.quantity})`,
          );
        }
      }

      const entity = manager.create(Order, {
        user: { id: createDto.userId } as any,
        orderDetails,
        address: addressData,
        total: createDto.totalAmount || createDto.total || 0,
        shipping: createDto.shipping || 0,
        discount: createDto.discount || 0,
        date: new Date().toLocaleDateString('vi-VN'),
        status: createDto.status || 'pending',
      });

      const saved = await manager.save(Order, entity);
      this.logger.log(`Order created: ${saved.id}`);
      return saved;
    });
  }

  async findAll() {
    return this.orderRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUser(userId: string) {
    return this.orderRepository.find({
      where: { user: { id: userId } } as any,
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
      // Deduct stock when delivered (completed)
      if (target === 'delivered' && current !== 'delivered') {
        const items = order.orderDetails || [];
        for (const item of items) {
          await this.productService.updateStock(item.productId, item.quantity);
        }
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

    const fonts = {
      Roboto: {
        normal: path.join(
          process.cwd(),
          'node_modules/pdfmake/fonts/Roboto/Roboto-Regular.ttf',
        ),
        bold: path.join(
          process.cwd(),
          'node_modules/pdfmake/fonts/Roboto/Roboto-Medium.ttf',
        ),
        italics: path.join(
          process.cwd(),
          'node_modules/pdfmake/fonts/Roboto/Roboto-Italic.ttf',
        ),
        bolditalics: path.join(
          process.cwd(),
          'node_modules/pdfmake/fonts/Roboto/Roboto-MediumItalic.ttf',
        ),
      },
    };

    pdfmake.setFonts(fonts);
    const docDefinition = this.buildInvoicePdfMake(order, enrichedDetails);

    const doc = pdfmake.createPdf(docDefinition);
    return doc.getBuffer();
  }

  private buildInvoicePdfMake(order: Order, items: any[]): any {
    const formatVND = (v: number) =>
      Number(v).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

    const totalDue = Number(order.total);
    const subTotal =
      totalDue + Number(order.discount || 0) - Number(order.shipping || 0);

    return {
      content: [
        {
          columns: [
            {
              text: [
                {
                  text: 'DreamBook\n',
                  fontSize: 24,
                  bold: true,
                  color: '#111827',
                },
                {
                  text: 'Reading is dreaming with open eyes',
                  fontSize: 10,
                  italics: true,
                  color: '#6B7280',
                },
              ],
            },
            {
              text: [
                {
                  text: 'INVOICE\n',
                  fontSize: 20,
                  bold: true,
                  color: '#DC2626',
                },
                {
                  text: `#${order.id.slice(0, 8).toUpperCase()}\n`,
                  fontSize: 10,
                  color: '#6B7280',
                  margin: [0, 5, 0, 0],
                },
                {
                  text: `Date: ${new Date(order.createdAt).toLocaleDateString('en-CA')}`,
                  fontSize: 10,
                  color: '#6B7280',
                },
              ],
              alignment: 'right',
            },
          ],
          margin: [0, 0, 0, 40],
        },
        {
          columns: [
            {
              text: [
                {
                  text: 'BILLED TO\n',
                  fontSize: 10,
                  bold: true,
                  color: '#9CA3AF',
                  margin: [0, 0, 0, 5],
                },
                {
                  text: `${order.user?.name || 'Customer'}\n`,
                  fontSize: 12,
                  bold: true,
                  color: '#111827',
                },
                {
                  text: `${order.user?.email || ''}`,
                  fontSize: 10,
                  color: '#4B5563',
                },
              ],
            },
            {
              text: [
                {
                  text: 'SHIPPING INFORMATION\n',
                  fontSize: 10,
                  bold: true,
                  color: '#9CA3AF',
                  margin: [0, 0, 0, 5],
                },
                {
                  text: `${order.address?.street || 'N/A'}\n`,
                  fontSize: 10,
                  color: '#374151',
                },
                {
                  text: `${order.address?.ward || ''}, ${order.address?.province || ''}`,
                  fontSize: 10,
                  color: '#374151',
                },
              ],
              alignment: 'right',
            },
          ],
          margin: [0, 0, 0, 40],
        },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto'],
            body: [
              [
                {
                  text: 'ITEM',
                  fontSize: 10,
                  bold: true,
                  color: '#9CA3AF',
                  border: [false, false, false, true],
                },
                {
                  text: 'QTY',
                  fontSize: 10,
                  bold: true,
                  color: '#9CA3AF',
                  alignment: 'center',
                  border: [false, false, false, true],
                },
                {
                  text: 'PRICE',
                  fontSize: 10,
                  bold: true,
                  color: '#9CA3AF',
                  alignment: 'right',
                  border: [false, false, false, true],
                },
                {
                  text: 'TOTAL',
                  fontSize: 10,
                  bold: true,
                  color: '#9CA3AF',
                  alignment: 'right',
                  border: [false, false, false, true],
                },
              ],
              ...items.map((item) => [
                {
                  text: [
                    {
                      text: `${item.product?.title || 'Unknown Product'}\n`,
                      bold: true,
                      color: '#111827',
                    },
                    {
                      text: `ID: ${item.productId.slice(0, 8)}`,
                      fontSize: 8,
                      color: '#9CA3AF',
                    },
                  ],
                  margin: [0, 5, 0, 5],
                  border: [false, false, false, true],
                },
                {
                  text: item.quantity.toString(),
                  alignment: 'center',
                  margin: [0, 5, 0, 5],
                  color: '#374151',
                  border: [false, false, false, true],
                },
                {
                  text: formatVND(item.price),
                  alignment: 'right',
                  margin: [0, 5, 0, 5],
                  color: '#374151',
                  border: [false, false, false, true],
                },
                {
                  text: formatVND(item.price * item.quantity),
                  alignment: 'right',
                  bold: true,
                  margin: [0, 5, 0, 5],
                  color: '#111827',
                  border: [false, false, false, true],
                },
              ]),
            ],
          },
          layout: {
            defaultBorder: false,
            hLineWidth: function (i: number) {
              return i === 1 ? 1 : 0.5;
            },
            hLineColor: function () {
              return '#F3F4F6';
            },
          },
          margin: [0, 0, 0, 40],
        },
        {
          columns: [
            { width: '*', text: '' },
            {
              width: 200,
              table: {
                widths: ['*', 'auto'],
                body: [
                  [
                    { text: 'Subtotal', color: '#6B7280' },
                    {
                      text: formatVND(subTotal),
                      alignment: 'right',
                      bold: true,
                      color: '#111827',
                    },
                  ],
                  [
                    { text: 'Discount', color: '#6B7280' },
                    {
                      text: `-${formatVND(order.discount || 0)}`,
                      alignment: 'right',
                      bold: true,
                      color: '#16A34A',
                    },
                  ],
                  [
                    {
                      text: 'Shipping',
                      color: '#6B7280',
                      border: [false, false, false, true],
                    },
                    {
                      text: formatVND(order.shipping || 0),
                      alignment: 'right',
                      bold: true,
                      color: '#111827',
                      border: [false, false, false, true],
                    },
                  ],
                  [
                    {
                      text: 'Total Due',
                      fontSize: 14,
                      bold: true,
                      color: '#111827',
                      margin: [0, 10, 0, 0],
                    },
                    {
                      text: formatVND(totalDue),
                      fontSize: 16,
                      bold: true,
                      color: '#DC2626',
                      alignment: 'right',
                      margin: [0, 10, 0, 0],
                    },
                  ],
                ],
              },
              layout: {
                defaultBorder: false,
                hLineWidth: function (i: number) {
                  return i === 3 ? 1 : 0;
                },
                hLineColor: function () {
                  return '#F3F4F6';
                },
              },
            },
          ],
        },
        {
          text: [
            {
              text: 'Thank you for choosing DreamBook\n',
              fontSize: 10,
              color: '#9CA3AF',
            },
            {
              text: 'Dreambook  •   support@dreambook.vn',
              fontSize: 8,
              color: '#D1D5DB',
            },
          ],
          alignment: 'center',
          margin: [0, 60, 0, 0],
        },
      ],
      defaultStyle: {
        font: 'Roboto',
      },
    };
  }
}

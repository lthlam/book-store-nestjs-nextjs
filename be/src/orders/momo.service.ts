import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import * as crypto from 'crypto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MomoService {
  private readonly logger = new Logger(MomoService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  private getMomoConfig() {
    return {
      partnerCode:
        this.configService.get<string>('MOMO_PARTNER_CODE') || 'MOMO',
      accessKey:
        this.configService.get<string>('MOMO_ACCESS_KEY') || 'F8BBA842ECF85',
      secretKey:
        this.configService.get<string>('MOMO_SECRET_KEY') ||
        'K951B6PE1waDMi640xX08PD3vg6EkVlz',
      endpoint: 'https://test-payment.momo.vn/v2/gateway/api/create',
      redirectUrl:
        this.configService.get<string>('MOMO_REDIRECT_URL') ||
        'http://localhost:3000/checkout/momo-return',
      ipnUrl:
        this.configService.get<string>('MOMO_IPN_URL') ||
        'https://webhook.site/b3088a6a-2d17-4d8d-a383-71389a6c600b',
    };
  }

  async createPaymentUrl(orderId: string, amount: number) {
    const config = this.getMomoConfig();
    const requestId = orderId;
    const orderInfo = 'thanh toán';
    const redirectUrl = config.redirectUrl;
    const ipnUrl = config.ipnUrl;
    const extraData = '';
    const requestType = 'payWithMethod';

    const rawSignature = `accessKey=${config.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${config.partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    const signature = crypto
      .createHmac('sha256', config.secretKey)
      .update(rawSignature)
      .digest('hex');

    const requestBody = {
      partnerCode: config.partnerCode,
      partnerName: 'Test',
      storeId: 'MomoTestStore',
      requestId,
      amount: amount.toString(),
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      lang: 'vi',
      requestType,
      autoCapture: true,
      extraData,
      orderGroupId: '',
      signature,
    };
    try {
      const response = await firstValueFrom(
        this.httpService.post(config.endpoint, requestBody),
      );
      if (response.data && response.data.payUrl) {
        return response.data.payUrl;
      } else {
        this.logger.error('MoMo Error Response:', response.data);
        throw new Error(
          response.data.message || 'Failed to create MoMo payment',
        );
      }
    } catch (error) {
      this.logger.error(
        'MoMo Request Error:',
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  verifySignature(params: any): boolean {
    const config = this.getMomoConfig();
    const {
      partnerCode = '',
      orderId = '',
      requestId = '',
      amount = '',
      orderInfo = '',
      orderType = '',
      transId = '',
      resultCode = '',
      message = '',
      payType = '',
      responseTime = '',
      extraData = '',
      signature = '',
    } = params;

    const rawSignature = `accessKey=${config.accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

    const checkSignature = crypto
      .createHmac('sha256', config.secretKey)
      .update(rawSignature)
      .digest('hex');

    return checkSignature === signature;
  }
}

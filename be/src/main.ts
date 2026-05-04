import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import {
  ValidationPipe,
  ClassSerializerInterceptor,
  Logger,
} from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.getHttpAdapter().getInstance().set('trust proxy', true);

  // --- Global Pipes ---
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // --- Global Interceptors ---
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  // --- Global Exception Filter ---
  app.useGlobalFilters(new AllExceptionsFilter());

  // --- Cookie Parser ---
  app.use(cookieParser());

  // --- CORS — cho phép credentials (cookie) từ frontend ---
  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // --- Swagger ---
  const config = new DocumentBuilder()
    .setTitle('DreamBook API')
    .setDescription('API documentation cho hệ thống bán sách DreamBook')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .addTag('auth', 'Xác thực người dùng & admin')
    .addTag('users', 'Quản lý người dùng')
    .addTag('admins', 'Quản lý admin')
    .addTag('products', 'Quản lý sản phẩm')
    .addTag('genres', 'Thể loại sách')
    .addTag('authors', 'Tác giả')
    .addTag('publishers', 'Nhà xuất bản')
    .addTag('orders', 'Đơn hàng')
    .addTag('carts', 'Giỏ hàng')
    .addTag('wishlists', 'Danh sách yêu thích')
    .addTag('reviews', 'Đánh giá sản phẩm')
    .addTag('coupons', 'Mã giảm giá')
    .addTag('addresses', 'Địa chỉ giao hàng')
    .addTag('uploads', 'Upload ảnh')
    .addTag('contacts', 'Liên hệ')
    .addTag('health', 'Health check')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Giữ token sau khi reload
    },
  });

  // --- Graceful Shutdown ---
  app.enableShutdownHooks();

  // --- Unhandled rejection / exception handlers ---
  process.on('unhandledRejection', (reason: unknown) => {
    logger.error('Unhandled Promise Rejection', String(reason));
  });

  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception — shutting down', error.stack);
    process.exit(1);
  });

  const port = process.env.PORT;
  const server = await app.listen(port, '0.0.0.0');

  const shutdown = async (signal: string) => {
    logger.log(`Received ${signal}, starting graceful shutdown...`);
    server.close(async () => {
      logger.log('HTTP server closed');
      await app.close();
      process.exit(0);
    });
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  logger.log(`Application is running on port: ${port}`);
  logger.log(`Swagger docs are available at /api/docs`);
}
bootstrap();

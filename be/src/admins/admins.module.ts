import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Admin } from './entities/admin.entity';
import { AdminsController } from './admins.controller';
import { AdminsService } from './admins.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET') || 'SECRET_KEY',
        signOptions: {
          expiresIn: (configService.get<string>('JWT_ACCESS_EXPIRES_IN') ||
            '1d') as any,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AdminsController],
  providers: [AdminsService],
})
export class AdminsModule {}

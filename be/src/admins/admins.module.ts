import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { AdminsController } from './admins.controller';
import { AdminsService } from './admins.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin]),
    AuthModule, // Dùng chung JwtModule từ AuthModule
  ],
  controllers: [AdminsController],
  providers: [AdminsService],
})
export class AdminsModule {}

import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO cho admin block/unblock user.
 * Chỉ cho phép thay đổi isBlocked — không cho phép sửa thông tin cá nhân.
 */
export class AdminUpdateUserDto {
  @ApiProperty({ example: true, description: 'true = block, false = unblock' })
  @IsBoolean()
  isBlocked: boolean;
}

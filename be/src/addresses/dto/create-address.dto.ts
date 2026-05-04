import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * userId đã bị xóa khỏi DTO — lấy từ JWT token trong controller.
 * Không cho phép client tự chỉ định userId.
 */
export class CreateAddressDto {
  @ApiProperty({ example: '123 Đường ABC' })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({ example: '09379' })
  @IsString()
  @IsNotEmpty()
  wardCode: string;

  @ApiPropertyOptional({ example: 'Nguyễn Văn A' })
  @IsString()
  @IsNotEmpty()
  contactName: string;

  @ApiPropertyOptional({ example: '0987654321' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}

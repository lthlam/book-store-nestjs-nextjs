import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\S+$/, { message: 'Mã Coupon không được chứa khoảng trắng' })
  code: string;

  @IsNumber()
  discount: number;

  @IsString()
  @IsOptional()
  type: string; // 'percent' | 'fixed'

  @IsString()
  @IsOptional()
  description: string;

  @IsNumber()
  minimum: number;

  @IsString()
  @IsOptional()
  startDate: string;

  @IsString()
  @IsOptional()
  expiryDate: string;
}

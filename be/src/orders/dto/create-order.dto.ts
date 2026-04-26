import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateOrderDto {
  @IsUUID()
  userId: string;

  @IsArray()
  @IsOptional()
  items?: any[];

  @IsArray()
  @IsOptional()
  orderDetails?: any[];

  @IsOptional()
  address?: any;

  @IsUUID()
  @IsOptional()
  addressId?: string;

  @IsOptional()
  totalAmount?: number;

  @IsNumber()
  @IsOptional()
  total?: number;

  @IsNumber()
  @IsOptional()
  shipping?: number;

  @IsNumber()
  @IsOptional()
  discount?: number;

  @IsString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  status?: string;
}

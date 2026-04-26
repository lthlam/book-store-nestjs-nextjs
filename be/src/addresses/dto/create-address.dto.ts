import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateAddressDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  wardCode: string;

  @IsString()
  @IsNotEmpty()
  contactName: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}

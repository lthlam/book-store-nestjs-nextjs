import { IsOptional, IsString, MinLength, Matches } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]+$/, { message: 'Số điện thoại chỉ được chứa các chữ số' })
  contact?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  isBlocked?: boolean;
}

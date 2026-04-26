import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]+$/, { message: 'Số điện thoại chỉ được chứa các chữ số' })
  contact: string;

  @IsString()
  @MinLength(6)
  password: string;
}

import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateContactDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  subject?: string;

  @IsNotEmpty()
  @MinLength(10)
  message: string;
}

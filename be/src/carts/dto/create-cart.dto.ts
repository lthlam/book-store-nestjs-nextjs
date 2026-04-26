import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateCartDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsArray()
  items: any[];
}

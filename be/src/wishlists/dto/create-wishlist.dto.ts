import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateWishlistDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsArray()
  @IsUUID('4', { each: true })
  productIds: string[];
}

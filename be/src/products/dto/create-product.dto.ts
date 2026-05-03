import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Tôi thấy hoa vàng trên cỏ xanh' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  title: string;

  @ApiProperty({ example: 'https://res.cloudinary.com/example/image.jpg' })
  @IsString()
  @IsNotEmpty()
  image: string;

  @ApiProperty({ example: 'Cuốn sách kể về tuổi thơ...' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 85000 })
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Number(value))
  price: number;

  @ApiProperty({ example: 2010 })
  @IsInt()
  @Min(1000)
  @Transform(({ value }) => Number(value))
  year: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return false;
  })
  special?: boolean;

  @ApiPropertyOptional({ example: 'uuid-of-genre' })
  @IsOptional()
  @IsUUID()
  genreId?: string;

  @ApiPropertyOptional({ example: 'uuid-of-author' })
  @IsOptional()
  @IsUUID()
  authorId?: string;

  @ApiPropertyOptional({ example: 'uuid-of-publisher' })
  @IsOptional()
  @IsUUID()
  publisherId?: string;
}

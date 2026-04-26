import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ProductService } from './products.service';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  create(@Body() createDto: any) {
    return this.productService.create(createDto);
  }

  @Post('bulk')
  @UseInterceptors(FilesInterceptor('files'))
  bulkCreate(@UploadedFiles() files: any[]) {
    return this.productService.bulkCreateFromCsv(files);
  }

  @Get()
  findAll(
    @Query('sort') sort?: string,
    @Query('order') order?: 'ASC' | 'DESC',
    @Query('limit') limit?: string,
    @Query('page') page?: string,
    @Query('genreId') genreId?: string,
    @Query('excludeId') excludeId?: string,
    @Query('search') search?: string,
    @Query('genreIds') genreIds?: string | string[],
    @Query('authorIds') authorIds?: string | string[],
    @Query('publisherIds') publisherIds?: string | string[],
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('rating') rating?: string,
    @Query('special') special?: string,
  ) {
    const parseArray = (val: any) =>
      Array.isArray(val) ? val : val ? [val] : [];

    return this.productService.findAll(
      sort,
      order,
      limit ? parseInt(limit, 10) : 20,
      page ? parseInt(page, 10) : 1,
      genreId,
      excludeId,
      search,
      parseArray(genreIds),
      parseArray(authorIds),
      parseArray(publisherIds),
      minPrice ? parseFloat(minPrice) : undefined,
      maxPrice ? parseFloat(maxPrice) : undefined,
      rating ? parseFloat(rating) : undefined,
      special === undefined ? undefined : special === 'true',
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.productService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}

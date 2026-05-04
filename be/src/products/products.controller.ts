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
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { ProductService } from './products.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Public } from '../auth/decorators/public.decorator';
import { Roles, Role } from '../auth/decorators/roles.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('products')
@ApiBearerAuth('access-token')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Roles(Role.Admin)
  @ApiOperation({ summary: '[Admin] Tạo sản phẩm mới' })
  @Post()
  create(@Body() createDto: CreateProductDto) {
    return this.productService.create(createDto);
  }

  @Roles(Role.Admin)
  @ApiOperation({ summary: '[Admin] Bulk import sản phẩm từ CSV + ảnh' })
  @ApiConsumes('multipart/form-data')
  @Post('bulk')
  @UseInterceptors(FilesInterceptor('files'))
  bulkCreate(@UploadedFiles() files: any[]) {
    return this.productService.bulkCreateFromCsv(files);
  }

  @Public()
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm với filter và phân trang' })
  @ApiQuery({ name: 'sort', required: false, example: 'soldCount' })
  @ApiQuery({ name: 'order', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'genreIds', required: false })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  @ApiQuery({ name: 'rating', required: false })
  @ApiQuery({ name: 'special', required: false })
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

  @Public()
  @ApiOperation({ summary: 'Lấy chi tiết sản phẩm theo ID' })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.findOne(id);
  }

  @Roles(Role.Admin)
  @ApiOperation({ summary: '[Admin] Cập nhật sản phẩm' })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateProductDto,
  ) {
    return this.productService.update(id, updateDto);
  }

  @Roles(Role.Admin)
  @ApiOperation({ summary: '[Admin] Xóa mềm sản phẩm' })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.remove(id);
  }
}

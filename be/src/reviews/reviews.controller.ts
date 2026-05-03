import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('reviews')
@ApiBearerAuth('access-token')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiOperation({ summary: 'Tạo đánh giá (chỉ user đã mua và nhận hàng)' })
  @Post()
  create(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(createReviewDto);
  }

  @Public()
  @ApiOperation({ summary: 'Lấy tất cả đánh giá của sản phẩm' })
  @Get('product/:id')
  findByProduct(@Param('id') id: string) {
    return this.reviewsService.findByProduct(id);
  }

  @ApiOperation({ summary: 'Kiểm tra user có thể đánh giá sản phẩm không' })
  @ApiQuery({ name: 'productId', required: true })
  @ApiQuery({ name: 'userId', required: true })
  @Get('can-review')
  async canReview(
    @Query('productId') productId: string,
    @Query('userId') userId: string,
  ) {
    return this.reviewsService.checkEligibility(productId, userId);
  }

  @ApiOperation({ summary: 'Xóa đánh giá (chỉ chủ sở hữu)' })
  @ApiQuery({ name: 'userId', required: true })
  @Delete(':id')
  remove(@Param('id') id: string, @Query('userId') userId: string) {
    return this.reviewsService.remove(id, userId);
  }
}

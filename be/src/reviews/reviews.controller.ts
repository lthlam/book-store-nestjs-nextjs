import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { Public } from '../auth/decorators/public.decorator';
import {
  CurrentUser,
  JwtPayload,
} from '../auth/decorators/current-user.decorator';

// DTO nội bộ — không nhận userId từ body nữa
class CreateReviewBodyDto {
  productId: string;
  rating: number;
  comment: string;
}

@ApiTags('reviews')
@ApiBearerAuth('access-token')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiOperation({ summary: 'Tạo đánh giá (userId lấy từ JWT)' })
  @Post()
  create(
    @Body() body: CreateReviewBodyDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    // userId luôn lấy từ JWT — không tin vào body
    return this.reviewsService.create({
      productId: body.productId,
      userId: currentUser.sub,
      rating: body.rating,
      comment: body.comment,
    });
  }

  @Public()
  @ApiOperation({ summary: 'Lấy tất cả đánh giá của sản phẩm' })
  @Get('product/:id')
  findByProduct(@Param('id') id: string) {
    return this.reviewsService.findByProduct(id);
  }

  @ApiOperation({
    summary: 'Kiểm tra user hiện tại có thể đánh giá sản phẩm không',
  })
  @ApiQuery({ name: 'productId', required: true })
  @Get('can-review')
  canReview(
    @Query('productId') productId: string,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    // userId lấy từ JWT — không nhận từ query
    return this.reviewsService.checkEligibility(productId, currentUser.sub);
  }

  @ApiOperation({ summary: 'Xóa đánh giá (chỉ chủ sở hữu, userId từ JWT)' })
  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    // userId lấy từ JWT — không nhận từ query string
    return this.reviewsService.remove(id, currentUser.sub);
  }
}

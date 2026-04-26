import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  Delete,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  create(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(createReviewDto);
  }

  @Get('product/:id')
  findByProduct(@Param('id') id: string) {
    return this.reviewsService.findByProduct(id);
  }

  @Get('can-review')
  async canReview(
    @Query('productId') productId: string,
    @Query('userId') userId: string,
  ) {
    const eligibility = await this.reviewsService.checkEligibility(
      productId,
      userId,
    );
    return eligibility;
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query('userId') userId: string) {
    return this.reviewsService.remove(id, userId);
  }
}

import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Wishlist')
@Controller('wishlist')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add item to wishlist',
    description: 'Adds a product to the user wishlist',
  })
  @ApiResponse({
    status: 201,
    description: 'Item added to wishlist successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid wishlist data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async addToWishlist(@Request() req, @Body() addToWishlistDto: AddToWishlistDto) {
    return this.wishlistService.addToWishlist(req.user.userId, addToWishlistDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get user wishlist',
    description: 'Retrieves all items in the user wishlist',
  })
  @ApiResponse({
    status: 200,
    description: 'Wishlist retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  async getWishlist(@Request() req) {
    return this.wishlistService.getWishlist(req.user.userId);
  }

  @Get('count')
  @ApiOperation({
    summary: 'Get wishlist item count',
    description: 'Returns the total number of items in the user wishlist',
  })
  @ApiResponse({
    status: 200,
    description: 'Wishlist count retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  async getWishlistItemCount(@Request() req) {
    return this.wishlistService.getWishlistItemCount(req.user.userId);
  }

  @Get('check/:productId')
  @ApiOperation({
    summary: 'Check if product is in wishlist',
    description: 'Checks whether a specific product is in the user wishlist',
  })
  @ApiParam({ name: 'productId', description: 'Product ID to check' })
  @ApiResponse({
    status: 200,
    description: 'Check completed successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  async isInWishlist(@Request() req, @Param('productId') productId: string) {
    return this.wishlistService.isInWishlist(req.user.userId, productId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove item from wishlist',
    description: 'Removes a specific item from the user wishlist',
  })
  @ApiParam({ name: 'id', description: 'Wishlist item ID' })
  @ApiResponse({
    status: 200,
    description: 'Item removed from wishlist successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 404,
    description: 'Wishlist item not found',
  })
  async removeFromWishlist(@Request() req, @Param('id') id: string) {
    return this.wishlistService.removeFromWishlist(req.user.userId, id);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Clear wishlist',
    description: 'Removes all items from the user wishlist',
  })
  @ApiResponse({
    status: 200,
    description: 'Wishlist cleared successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  async clearWishlist(@Request() req) {
    return this.wishlistService.clearWishlist(req.user.userId);
  }
}

import { IsMongoId, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToWishlistDto {
  @ApiProperty({
    description: 'MongoDB ID of the product to add to wishlist',
    example: '507f1f77bcf86cd799439014',
  })
  @IsMongoId({ message: 'Invalid product ID' })
  @IsNotEmpty({ message: 'Product ID is required' })
  productId: string;
}

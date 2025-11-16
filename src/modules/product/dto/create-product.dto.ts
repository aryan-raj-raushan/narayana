import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  IsMongoId,
  Min,
  MinLength,
  MaxLength,
  ArrayMinSize,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'Name of the product',
    example: 'Classic Cotton T-Shirt',
  })
  @IsString()
  @IsNotEmpty({ message: 'Product name is required' })
  @MinLength(2, { message: 'Product name must be at least 2 characters long' })
  @MaxLength(200, { message: 'Product name must not exceed 200 characters' })
  name: string;

  @ApiPropertyOptional({
    description: 'Stock Keeping Unit identifier',
    example: 'TSH-001',
  })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({
    description: 'Family SKU for product variants',
    example: 'TSH',
  })
  @IsOptional()
  @IsString()
  familySKU?: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the product',
    example: 'Comfortable cotton t-shirt for everyday wear',
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000, { message: 'Description must not exceed 5000 characters' })
  description?: string;

  @ApiProperty({
    description: 'MongoDB ID of the gender category',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId({ message: 'Invalid gender ID' })
  @IsNotEmpty({ message: 'Gender ID is required' })
  genderId: string;

  @ApiProperty({
    description: 'MongoDB ID of the category',
    example: '507f1f77bcf86cd799439012',
  })
  @IsMongoId({ message: 'Invalid category ID' })
  @IsNotEmpty({ message: 'Category ID is required' })
  categoryId: string;

  @ApiProperty({
    description: 'MongoDB ID of the subcategory',
    example: '507f1f77bcf86cd799439013',
  })
  @IsMongoId({ message: 'Invalid subcategory ID' })
  @IsNotEmpty({ message: 'Subcategory ID is required' })
  subcategoryId: string;

  @ApiPropertyOptional({
    description: 'Available sizes for the product',
    example: ['S', 'M', 'L', 'XL'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sizes?: string[];

  @ApiProperty({
    description: 'Available stock quantity',
    example: 100,
  })
  @IsNumber()
  @Min(0, { message: 'Stock cannot be negative' })
  stock: number;

  @ApiProperty({
    description: 'Original price of the product',
    example: 29.99,
  })
  @IsNumber()
  @Min(0, { message: 'Price must be a positive number' })
  price: number;

  @ApiPropertyOptional({
    description: 'Discounted price of the product',
    example: 24.99,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Discount price must be a positive number' })
  discountPrice?: number;

  @ApiPropertyOptional({
    description: 'Array of related product IDs',
    example: [],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true, message: 'Invalid product ID in related products' })
  relatedProductIds?: string[];

  @ApiPropertyOptional({
    description: 'Price threshold for "under price" category',
    example: 50,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Under price amount must be a positive number' })
  underPriceAmount?: number;

  @ApiPropertyOptional({
    description: 'Array of product image URLs',
    example: ['https://example.com/tshirt1.jpg'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({
    description: 'Array of product video URLs',
    example: [],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  videos?: string[];

  @ApiPropertyOptional({
    description: 'Array of slider image URLs',
    example: [],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sliders?: string[];

  @ApiPropertyOptional({
    description: 'Whether the product is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

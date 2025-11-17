import { IsString, IsNotEmpty, IsOptional, IsBoolean, MinLength, MaxLength, IsMongoId } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubcategoryDto {
  @ApiProperty({
    description: 'Name of the subcategory',
    example: 'T-Shirts',
  })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name: string;

  @ApiPropertyOptional({
    description: 'URL-friendly slug for the subcategory',
    example: 't-shirts',
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({
    description: 'MongoDB ID of the parent category',
    example: '507f1f77bcf86cd799439012',
  })
  @IsMongoId({ message: 'Invalid category ID' })
  @IsNotEmpty({ message: 'Category ID is required' })
  categoryId: string;

  @ApiPropertyOptional({
    description: 'Image URL for the subcategory',
    example: 'https://example.com/images/subcategory.jpg',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    description: 'Whether this subcategory is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

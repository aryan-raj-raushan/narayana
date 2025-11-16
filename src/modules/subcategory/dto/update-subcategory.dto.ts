import { IsString, IsOptional, IsBoolean, MinLength, MaxLength, IsMongoId } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSubcategoryDto {
  @ApiPropertyOptional({
    description: 'Name of the subcategory',
    example: 'Jeans',
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name?: string;

  @ApiPropertyOptional({
    description: 'URL-friendly slug for the subcategory',
    example: 'jeans',
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({
    description: 'MongoDB ID of the parent category',
    example: '507f1f77bcf86cd799439012',
  })
  @IsOptional()
  @IsMongoId({ message: 'Invalid category ID' })
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Whether this subcategory is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

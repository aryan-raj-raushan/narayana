import { IsString, IsNotEmpty, IsOptional, IsBoolean, MinLength, MaxLength, IsMongoId } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Name of the category',
    example: 'Clothing',
  })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name: string;

  @ApiPropertyOptional({
    description: 'URL-friendly slug for the category',
    example: 'clothing',
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({
    description: 'MongoDB ID of the associated gender',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId({ message: 'Invalid gender ID' })
  @IsNotEmpty({ message: 'Gender ID is required' })
  genderId: string;

  @ApiPropertyOptional({
    description: 'Whether this category is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

import { IsString, IsOptional, IsEmail, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiPropertyOptional({
    description: 'Special notes or delivery instructions for the order',
    example: 'Please deliver between 9 AM - 5 PM',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({
    description: 'Shipping address for the order',
    example: '123 Main Street, Apt 4B, New York, NY 10001',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  shippingAddress?: string;

  @ApiPropertyOptional({
    description: 'Contact email for order updates',
    example: 'john.doe@example.com',
  })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional({
    description: 'Contact phone number for delivery',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  contactPhone?: string;
}

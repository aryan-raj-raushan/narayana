import { IsString, IsNotEmpty, IsOptional, IsBoolean, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddAddressDto {
  @ApiProperty({
    description: 'Full name for the address',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    description: 'Phone number (10-digit)',
    example: '+1234567890',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{10}$/, { message: 'Phone must be a valid 10-digit number' })
  phone: string;

  @ApiProperty({
    description: 'Primary address line',
    example: '123 Main Street',
  })
  @IsString()
  @IsNotEmpty()
  addressLine1: string;

  @ApiPropertyOptional({
    description: 'Secondary address line (apartment, suite, etc.)',
    example: 'Apt 4B',
  })
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @ApiProperty({
    description: 'City name',
    example: 'New York',
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    description: 'State or province',
    example: 'NY',
  })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({
    description: 'Postal code (6-digit)',
    example: '10001',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{6}$/, { message: 'Pincode must be a valid 6-digit number' })
  pincode: string;

  @ApiProperty({
    description: 'Country name',
    example: 'USA',
  })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiPropertyOptional({
    description: 'Whether this is the default address',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

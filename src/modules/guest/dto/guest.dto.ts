import { IsNotEmpty, IsString, IsNumber, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GuestAddToCartDto {
  @ApiProperty({ description: 'Guest session ID' })
  @IsString()
  @IsNotEmpty()
  guestId: string;

  @ApiProperty({ description: 'Product ID' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: 'Quantity', default: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  quantity?: number;
}

export class GuestUpdateCartDto {
  @ApiProperty({ description: 'Guest session ID' })
  @IsString()
  @IsNotEmpty()
  guestId: string;

  @ApiProperty({ description: 'Product ID' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: 'New quantity' })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class GuestRemoveFromCartDto {
  @ApiProperty({ description: 'Guest session ID' })
  @IsString()
  @IsNotEmpty()
  guestId: string;

  @ApiProperty({ description: 'Product ID' })
  @IsString()
  @IsNotEmpty()
  productId: string;
}

export class GuestCartQueryDto {
  @ApiProperty({ description: 'Guest session ID' })
  @IsString()
  @IsNotEmpty()
  guestId: string;
}

export class GuestAddToWishlistDto {
  @ApiProperty({ description: 'Guest session ID' })
  @IsString()
  @IsNotEmpty()
  guestId: string;

  @ApiProperty({ description: 'Product ID' })
  @IsString()
  @IsNotEmpty()
  productId: string;
}

export class GuestCheckoutDto {
  @ApiProperty({ description: 'Guest session ID' })
  @IsString()
  @IsNotEmpty()
  guestId: string;

  @ApiProperty({ description: 'Full name' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ description: 'Email address' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Phone number' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: 'Address line 1' })
  @IsString()
  @IsNotEmpty()
  addressLine1: string;

  @ApiProperty({ description: 'Address line 2', required: false })
  @IsString()
  @IsOptional()
  addressLine2?: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'State' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ description: 'Pincode' })
  @IsString()
  @IsNotEmpty()
  pincode: string;

  @ApiProperty({ description: 'Country', default: 'India' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({ description: 'Order notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class MergeCartDto {
  @ApiProperty({ description: 'Guest session ID to merge from' })
  @IsString()
  @IsNotEmpty()
  guestId: string;
}

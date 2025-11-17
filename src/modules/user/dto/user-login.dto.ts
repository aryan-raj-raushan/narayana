import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserLoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'Password@123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'Guest session ID for cart/wishlist merge',
    required: false,
    example: 'guest_abc123',
  })
  @IsString()
  @IsOptional()
  guestId?: string;
}

import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAdminDto {
  @ApiProperty({
    description: 'Name of the admin user',
    example: 'Admin User',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Email address of the admin',
    example: 'newadmin@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password for the admin account (minimum 6 characters)',
    example: 'Admin@123456',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}

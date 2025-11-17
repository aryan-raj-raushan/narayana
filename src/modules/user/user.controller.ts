import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { UpdateUserDto, UpdatePasswordDto } from './dto/update-user.dto';
import { AddAddressDto } from './dto/add-address.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { GuestService } from '../guest/guest.service';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => GuestService))
    private readonly guestService: GuestService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register new user', description: 'Create new user account and auto-login' })
  @ApiResponse({ status: 201, description: 'User registered and logged in successfully' })
  @ApiResponse({ status: 400, description: 'Validation error or email already exists' })
  async register(@Body() registerUserDto: RegisterUserDto) {
    const user = await this.userService.register(registerUserDto);

    // Auto-login after registration
    const payload = {
      userId: user._id.toString(),
      email: user.email,
    };
    const accessToken = this.jwtService.sign(payload);

    // Merge guest cart and wishlist if guestId provided
    let mergeResult = null;
    if (registerUserDto.guestId) {
      try {
        const cartMerge = await this.guestService.mergeCartOnLogin(
          registerUserDto.guestId,
          user._id.toString(),
        );
        const wishlistMerge = await this.guestService.mergeWishlistOnLogin(
          registerUserDto.guestId,
          user._id.toString(),
        );
        mergeResult = { cart: cartMerge, wishlist: wishlistMerge };
      } catch (error) {
        console.error('Guest merge error:', error);
      }
    }

    return {
      accessToken,
      user,
      mergeResult,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login', description: 'Authenticate user with email and password' })
  @ApiResponse({ status: 200, description: 'Successfully authenticated, returns JWT token' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() userLoginDto: UserLoginDto) {
    const user = await this.userService.findByEmail(userLoginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await this.userService.validatePassword(
      userLoginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update last login
    await this.userService.updateLastLogin(user._id.toString());

    const payload = {
      userId: user._id.toString(),
      email: user.email,
    };
    const accessToken = this.jwtService.sign(payload);

    const userObj = user.toObject();
    delete userObj.password;

    // Merge guest cart and wishlist if guestId provided
    let mergeResult = null;
    if (userLoginDto.guestId) {
      try {
        const cartMerge = await this.guestService.mergeCartOnLogin(
          userLoginDto.guestId,
          user._id.toString(),
        );
        const wishlistMerge = await this.guestService.mergeWishlistOnLogin(
          userLoginDto.guestId,
          user._id.toString(),
        );
        mergeResult = { cart: cartMerge, wishlist: wishlistMerge };
      } catch (error) {
        console.error('Guest merge error:', error);
      }
    }

    return {
      accessToken,
      user: userObj,
      mergeResult,
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user profile', description: 'Returns the authenticated user profile' })
  @ApiResponse({ status: 200, description: 'User profile returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req) {
    return this.userService.findById(req.user.userId);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update user profile', description: 'Update user profile information' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateProfile(req.user.userId, updateUserDto);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Change password', description: 'Update user password' })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized or invalid current password' })
  async changePassword(@Request() req, @Body() updatePasswordDto: UpdatePasswordDto) {
    await this.userService.updatePassword(req.user.userId, updatePasswordDto);
    return { message: 'Password updated successfully' };
  }

  // Address Management
  @Post('address')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add address', description: 'Add new address to user profile' })
  @ApiResponse({ status: 201, description: 'Address added successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async addAddress(@Request() req, @Body() addAddressDto: AddAddressDto) {
    return this.userService.addAddress(req.user.userId, addAddressDto);
  }

  @Patch('address/:index')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update address', description: 'Update address at specified index' })
  @ApiParam({ name: 'index', description: 'Address index (0-based)' })
  @ApiResponse({ status: 200, description: 'Address updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateAddress(
    @Request() req,
    @Param('index') index: string,
    @Body() addAddressDto: AddAddressDto,
  ) {
    const addressIndex = parseInt(index, 10);
    return this.userService.updateAddress(req.user.userId, addressIndex, addAddressDto);
  }

  @Delete('address/:index')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete address', description: 'Delete address at specified index' })
  @ApiParam({ name: 'index', description: 'Address index (0-based)' })
  @ApiResponse({ status: 200, description: 'Address deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteAddress(@Request() req, @Param('index') index: string) {
    const addressIndex = parseInt(index, 10);
    return this.userService.deleteAddress(req.user.userId, addressIndex);
  }

  @Post('address/:index/set-default')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Set default address', description: 'Set address at index as default' })
  @ApiParam({ name: 'index', description: 'Address index (0-based)' })
  @ApiResponse({ status: 200, description: 'Default address set successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async setDefaultAddress(@Request() req, @Param('index') index: string) {
    const addressIndex = parseInt(index, 10);
    return this.userService.setDefaultAddress(req.user.userId, addressIndex);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'User logout', description: 'Logout user (client-side token removal)' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout() {
    // With JWT, logout is handled client-side by removing the token
    return { message: 'Logged out successfully' };
  }
}

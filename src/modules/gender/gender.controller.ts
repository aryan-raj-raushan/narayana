import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { GenderService } from './gender.service';
import { CreateGenderDto } from './dto/create-gender.dto';
import { UpdateGenderDto } from './dto/update-gender.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Gender')
@Controller('gender')
export class GenderController {
  constructor(private readonly genderService: GenderService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new gender',
    description: 'Creates a new gender category. Requires authentication.',
  })
  @ApiResponse({
    status: 201,
    description: 'Gender created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid gender data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  async create(@Body() createGenderDto: CreateGenderDto) {
    return this.genderService.create(createGenderDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all genders',
    description: 'Retrieves a paginated list of gender categories',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: '1' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: '10' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status', enum: ['true', 'false'] })
  @ApiResponse({
    status: 200,
    description: 'Genders retrieved successfully',
  })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('isActive') isActive?: string,
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined;

    return this.genderService.findAll(pageNum, limitNum, isActiveBool);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get gender by ID',
    description: 'Retrieves a single gender category by its ID',
  })
  @ApiParam({ name: 'id', description: 'Gender ID' })
  @ApiResponse({
    status: 200,
    description: 'Gender retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Gender not found',
  })
  async findOne(@Param('id') id: string) {
    return this.genderService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({
    summary: 'Get gender by slug',
    description: 'Retrieves a single gender category by its slug',
  })
  @ApiParam({ name: 'slug', description: 'Gender slug' })
  @ApiResponse({
    status: 200,
    description: 'Gender retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Gender not found',
  })
  async findBySlug(@Param('slug') slug: string) {
    return this.genderService.findBySlug(slug);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update a gender',
    description: 'Updates an existing gender category. Requires authentication.',
  })
  @ApiParam({ name: 'id', description: 'Gender ID' })
  @ApiResponse({
    status: 200,
    description: 'Gender updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid gender data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 404,
    description: 'Gender not found',
  })
  async update(@Param('id') id: string, @Body() updateGenderDto: UpdateGenderDto) {
    return this.genderService.update(id, updateGenderDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a gender',
    description: 'Removes a gender category. Requires authentication.',
  })
  @ApiParam({ name: 'id', description: 'Gender ID' })
  @ApiResponse({
    status: 200,
    description: 'Gender deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 404,
    description: 'Gender not found',
  })
  async remove(@Param('id') id: string) {
    return this.genderService.remove(id);
  }
}

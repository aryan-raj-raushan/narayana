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
import { SubcategoryService } from './subcategory.service';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Subcategory')
@Controller('subcategory')
export class SubcategoryController {
  constructor(private readonly subcategoryService: SubcategoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new subcategory',
    description: 'Creates a new product subcategory. Requires authentication.',
  })
  @ApiResponse({
    status: 201,
    description: 'Subcategory created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid subcategory data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  async create(@Body() createSubcategoryDto: CreateSubcategoryDto) {
    return this.subcategoryService.create(createSubcategoryDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all subcategories',
    description: 'Retrieves a paginated list of product subcategories',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: '1' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: '10' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Filter by category ID' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status', enum: ['true', 'false'] })
  @ApiResponse({
    status: 200,
    description: 'Subcategories retrieved successfully',
  })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('categoryId') categoryId?: string,
    @Query('isActive') isActive?: string,
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined;

    return this.subcategoryService.findAll(pageNum, limitNum, categoryId, isActiveBool);
  }

  @Get('category/:categoryId')
  @ApiOperation({
    summary: 'Get subcategories by category',
    description: 'Retrieves all subcategories belonging to a specific category',
  })
  @ApiParam({ name: 'categoryId', description: 'Category ID' })
  @ApiResponse({
    status: 200,
    description: 'Subcategories retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  async findByCategory(@Param('categoryId') categoryId: string) {
    return this.subcategoryService.findByCategory(categoryId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get subcategory by ID',
    description: 'Retrieves a single subcategory by its ID',
  })
  @ApiParam({ name: 'id', description: 'Subcategory ID' })
  @ApiResponse({
    status: 200,
    description: 'Subcategory retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Subcategory not found',
  })
  async findOne(@Param('id') id: string) {
    return this.subcategoryService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({
    summary: 'Get subcategory by slug',
    description: 'Retrieves a single subcategory by its slug, optionally filtered by category',
  })
  @ApiParam({ name: 'slug', description: 'Subcategory slug' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Filter by category ID' })
  @ApiResponse({
    status: 200,
    description: 'Subcategory retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Subcategory not found',
  })
  async findBySlug(@Param('slug') slug: string, @Query('categoryId') categoryId?: string) {
    return this.subcategoryService.findBySlug(slug, categoryId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update a subcategory',
    description: 'Updates an existing subcategory. Requires authentication.',
  })
  @ApiParam({ name: 'id', description: 'Subcategory ID' })
  @ApiResponse({
    status: 200,
    description: 'Subcategory updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid subcategory data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 404,
    description: 'Subcategory not found',
  })
  async update(@Param('id') id: string, @Body() updateSubcategoryDto: UpdateSubcategoryDto) {
    return this.subcategoryService.update(id, updateSubcategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a subcategory',
    description: 'Removes a subcategory. Requires authentication.',
  })
  @ApiParam({ name: 'id', description: 'Subcategory ID' })
  @ApiResponse({
    status: 200,
    description: 'Subcategory deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 404,
    description: 'Subcategory not found',
  })
  async remove(@Param('id') id: string) {
    return this.subcategoryService.remove(id);
  }
}

import { Injectable, NotFoundException, ConflictException, Inject, forwardRef, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Subcategory } from './schemas/subcategory.schema';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';
import { CategoryService } from '../category/category.service';
import { RedisService } from '../../database/redis.service';
import { generateSlug } from '../../common/utils/slug.util';

@Injectable()
export class SubcategoryService {
  private readonly logger = new Logger(SubcategoryService.name);
  private readonly CACHE_PREFIX = 'subcategory:';
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor(
    @InjectModel(Subcategory.name)
    private subcategoryModel: Model<Subcategory>,
    @Inject(forwardRef(() => CategoryService))
    private categoryService: CategoryService,
    private redisService: RedisService,
  ) {}

  private async invalidateCache(): Promise<void> {
    try {
      const keys = await this.redisService.keys(`${this.CACHE_PREFIX}*`);
      for (const key of keys) {
        await this.redisService.del(key);
      }
      this.logger.log('Subcategory cache invalidated');
    } catch (error) {
      this.logger.error('Failed to invalidate cache:', error);
    }
  }

  async create(createSubcategoryDto: CreateSubcategoryDto): Promise<Subcategory> {
    // Validate category exists
    await this.categoryService.findOne(createSubcategoryDto.categoryId);

    // Generate slug if not provided
    const slug = createSubcategoryDto.slug || generateSlug(createSubcategoryDto.name);

    // Check for duplicate name within the same category
    const existingByName = await this.subcategoryModel.findOne({
      name: createSubcategoryDto.name,
      categoryId: createSubcategoryDto.categoryId,
    });
    if (existingByName) {
      throw new ConflictException('Subcategory with this name already exists for this category');
    }

    // Check for duplicate slug within the same category
    const existingBySlug = await this.subcategoryModel.findOne({
      slug,
      categoryId: createSubcategoryDto.categoryId,
    });
    if (existingBySlug) {
      throw new ConflictException('Subcategory with this slug already exists for this category');
    }

    const subcategory = new this.subcategoryModel({
      ...createSubcategoryDto,
      slug,
      categoryId: new Types.ObjectId(createSubcategoryDto.categoryId),
    });

    const savedSubcategory = await subcategory.save();
    await this.invalidateCache();
    return savedSubcategory;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    categoryId?: string,
    isActive?: boolean,
  ): Promise<any> {
    const cacheKey = `${this.CACHE_PREFIX}all:${page}:${limit}:${categoryId || 'all'}:${isActive !== undefined ? isActive : 'all'}`;

    // Try to get from cache first
    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        this.logger.log(`Cache hit for ${cacheKey}`);
        return JSON.parse(cached);
      }
    } catch (error) {
      this.logger.error('Cache read error:', error);
    }

    const skip = (page - 1) * limit;
    const filter: any = {};

    if (categoryId) {
      filter.categoryId = new Types.ObjectId(categoryId);
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    const [data, total] = await Promise.all([
      this.subcategoryModel
        .find(filter)
        .populate({
          path: 'categoryId',
          select: 'name slug genderId',
          populate: {
            path: 'genderId',
            select: 'name slug',
          },
        })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.subcategoryModel.countDocuments(filter),
    ]);

    const result = {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    // Cache the result
    try {
      await this.redisService.set(cacheKey, JSON.stringify(result), this.CACHE_TTL);
      this.logger.log(`Cached ${cacheKey}`);
    } catch (error) {
      this.logger.error('Cache write error:', error);
    }

    return result;
  }

  async findOne(id: string): Promise<Subcategory> {
    const cacheKey = `${this.CACHE_PREFIX}id:${id}`;

    // Try to get from cache first
    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        this.logger.log(`Cache hit for ${cacheKey}`);
        return JSON.parse(cached);
      }
    } catch (error) {
      this.logger.error('Cache read error:', error);
    }

    const subcategory = await this.subcategoryModel
      .findById(id)
      .populate({
        path: 'categoryId',
        select: 'name slug genderId',
        populate: {
          path: 'genderId',
          select: 'name slug',
        },
      })
      .exec();
    if (!subcategory) {
      throw new NotFoundException(`Subcategory with ID ${id} not found`);
    }

    // Cache the result
    try {
      await this.redisService.set(cacheKey, JSON.stringify(subcategory), this.CACHE_TTL);
      this.logger.log(`Cached ${cacheKey}`);
    } catch (error) {
      this.logger.error('Cache write error:', error);
    }

    return subcategory;
  }

  async findBySlug(slug: string, categoryId?: string): Promise<Subcategory> {
    const cacheKey = `${this.CACHE_PREFIX}slug:${slug}:${categoryId || 'all'}`;

    // Try to get from cache first
    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        this.logger.log(`Cache hit for ${cacheKey}`);
        return JSON.parse(cached);
      }
    } catch (error) {
      this.logger.error('Cache read error:', error);
    }

    const filter: any = { slug };
    if (categoryId) {
      filter.categoryId = new Types.ObjectId(categoryId);
    }

    const subcategory = await this.subcategoryModel
      .findOne(filter)
      .populate({
        path: 'categoryId',
        select: 'name slug genderId',
        populate: {
          path: 'genderId',
          select: 'name slug',
        },
      })
      .exec();
    if (!subcategory) {
      throw new NotFoundException(`Subcategory with slug ${slug} not found`);
    }

    // Cache the result
    try {
      await this.redisService.set(cacheKey, JSON.stringify(subcategory), this.CACHE_TTL);
      this.logger.log(`Cached ${cacheKey}`);
    } catch (error) {
      this.logger.error('Cache write error:', error);
    }

    return subcategory;
  }

  async findByCategory(categoryId: string): Promise<Subcategory[]> {
    const cacheKey = `${this.CACHE_PREFIX}category:${categoryId}`;

    // Try to get from cache first
    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        this.logger.log(`Cache hit for ${cacheKey}`);
        return JSON.parse(cached);
      }
    } catch (error) {
      this.logger.error('Cache read error:', error);
    }

    // Validate category exists
    await this.categoryService.findOne(categoryId);

    const subcategories = await this.subcategoryModel
      .find({ categoryId: new Types.ObjectId(categoryId), isActive: true })
      .sort({ name: 1 })
      .exec();

    // Cache the result
    try {
      await this.redisService.set(cacheKey, JSON.stringify(subcategories), this.CACHE_TTL);
      this.logger.log(`Cached ${cacheKey}`);
    } catch (error) {
      this.logger.error('Cache write error:', error);
    }

    return subcategories;
  }

  async update(id: string, updateSubcategoryDto: UpdateSubcategoryDto): Promise<Subcategory> {
    const subcategory = await this.findOne(id);

    // If categoryId is being updated, validate it exists
    if (updateSubcategoryDto.categoryId) {
      await this.categoryService.findOne(updateSubcategoryDto.categoryId);
    }

    // If name is being updated, regenerate slug
    if (updateSubcategoryDto.name) {
      const newSlug = updateSubcategoryDto.slug || generateSlug(updateSubcategoryDto.name);
      const targetCategoryId = updateSubcategoryDto.categoryId || subcategory.categoryId;

      // Check for duplicate name (excluding current)
      const existingByName = await this.subcategoryModel.findOne({
        name: updateSubcategoryDto.name,
        categoryId: targetCategoryId,
        _id: { $ne: id },
      });
      if (existingByName) {
        throw new ConflictException(
          'Subcategory with this name already exists for this category',
        );
      }

      // Check for duplicate slug (excluding current)
      const existingBySlug = await this.subcategoryModel.findOne({
        slug: newSlug,
        categoryId: targetCategoryId,
        _id: { $ne: id },
      });
      if (existingBySlug) {
        throw new ConflictException(
          'Subcategory with this slug already exists for this category',
        );
      }

      updateSubcategoryDto.slug = newSlug;
    }

    Object.assign(subcategory, updateSubcategoryDto);
    const savedSubcategory = await subcategory.save();
    await this.invalidateCache();
    return savedSubcategory;
  }

  async remove(id: string): Promise<{ message: string }> {
    const subcategory = await this.findOne(id);

    // Check if there are any products using this subcategory
    // This will be implemented when Product module is ready
    // For now, we'll just delete

    await subcategory.deleteOne();
    await this.invalidateCache();
    return { message: `Subcategory ${subcategory.name} has been deleted successfully` };
  }

  async countByCategory(categoryId: string): Promise<number> {
    return this.subcategoryModel.countDocuments({ categoryId: new Types.ObjectId(categoryId) });
  }

  async search(query: string, limit: number = 10): Promise<Subcategory[]> {
    const searchRegex = new RegExp(query, 'i');
    return this.subcategoryModel
      .find({
        isActive: true,
        $or: [
          { name: { $regex: searchRegex } },
          { slug: { $regex: searchRegex } },
        ],
      })
      .select('_id name slug')
      .limit(limit)
      .exec();
  }
}

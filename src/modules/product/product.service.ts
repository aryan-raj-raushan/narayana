import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GenderService } from '../gender/gender.service';
import { CategoryService } from '../category/category.service';
import { SubcategoryService } from '../subcategory/subcategory.service';
import { RedisService } from '../../database/redis.service';
import { generateSKU } from '../../common/utils/sku.util';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);
  private readonly CACHE_PREFIX = 'product:';
  private readonly CACHE_TTL = 1800; // 30 minutes for products

  constructor(
    @InjectModel(Product.name)
    private productModel: Model<Product>,
    private genderService: GenderService,
    private categoryService: CategoryService,
    private subcategoryService: SubcategoryService,
    private redisService: RedisService,
  ) {}

  private async invalidateCache(): Promise<void> {
    try {
      const keys = await this.redisService.keys(`${this.CACHE_PREFIX}*`);
      for (const key of keys) {
        await this.redisService.del(key);
      }
      this.logger.log('Product cache invalidated');
    } catch (error) {
      this.logger.error('Failed to invalidate cache:', error);
    }
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Validate relationships exist
    const [gender, category, subcategory] = await Promise.all([
      this.genderService.findOne(createProductDto.genderId),
      this.categoryService.findOne(createProductDto.categoryId),
      this.subcategoryService.findOne(createProductDto.subcategoryId),
    ]);

    // Validate discount price is less than price
    if (createProductDto.discountPrice && createProductDto.discountPrice >= createProductDto.price) {
      throw new BadRequestException('Discount price must be less than the regular price');
    }

    // Generate SKU if not provided
    let sku = createProductDto.sku;
    if (!sku) {
      sku = await this.generateUniqueSKU(gender.name, category.name);
    } else {
      // Check if custom SKU already exists
      const existingSKU = await this.productModel.findOne({ sku: sku.toUpperCase() });
      if (existingSKU) {
        throw new ConflictException(`Product with SKU ${sku} already exists`);
      }
      sku = sku.toUpperCase();
    }

    // Validate related product IDs exist
    if (createProductDto.relatedProductIds && createProductDto.relatedProductIds.length > 0) {
      await this.validateRelatedProducts(createProductDto.relatedProductIds);
    }

    const product = new this.productModel({
      ...createProductDto,
      sku,
      familySKU: createProductDto.familySKU?.toUpperCase(),
      genderId: new Types.ObjectId(createProductDto.genderId),
      categoryId: new Types.ObjectId(createProductDto.categoryId),
      subcategoryId: new Types.ObjectId(createProductDto.subcategoryId),
      relatedProductIds: createProductDto.relatedProductIds?.map((id) => new Types.ObjectId(id)),
    });

    const savedProduct = await product.save();
    await this.invalidateCache();
    return savedProduct;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    filters?: {
      genderId?: string;
      categoryId?: string;
      subcategoryId?: string;
      minPrice?: number;
      maxPrice?: number;
      underPriceAmount?: number;
      inStock?: boolean;
      isActive?: boolean;
      search?: string;
      familySKU?: string;
      productIds?: string[]; // Filter by specific product IDs
    },
  ): Promise<any> {
    // Generate cache key based on all parameters
    const cacheKey = `${this.CACHE_PREFIX}all:${page}:${limit}:${JSON.stringify(filters || {})}`;

    // Try to get from cache first
    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        this.logger.log(`Cache hit for products query`);
        return JSON.parse(cached);
      }
    } catch (error) {
      this.logger.error('Cache read error:', error);
    }

    const skip = (page - 1) * limit;
    const filter: any = {};

    // Apply filters
    if (filters?.genderId) {
      filter.genderId = new Types.ObjectId(filters.genderId);
    }
    if (filters?.categoryId) {
      filter.categoryId = new Types.ObjectId(filters.categoryId);
    }
    if (filters?.subcategoryId) {
      filter.subcategoryId = new Types.ObjectId(filters.subcategoryId);
    }
    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      filter.price = {};
      if (filters.minPrice !== undefined) {
        filter.price.$gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        filter.price.$lte = filters.maxPrice;
      }
    }
    if (filters?.underPriceAmount !== undefined) {
      filter.price = { ...filter.price, $lte: filters.underPriceAmount };
    }
    if (filters?.inStock === true) {
      filter.stock = { $gt: 0 };
    }
    if (filters?.isActive !== undefined) {
      filter.isActive = filters.isActive;
    }
    if (filters?.search) {
      // Implement fuzzy search
      const searchTerm = filters.search.trim();
      const fuzzyRegex = this.createFuzzyRegex(searchTerm);

      filter.$or = [
        { name: { $regex: fuzzyRegex, $options: 'i' } },
        { sku: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: fuzzyRegex, $options: 'i' } },
        // Also search with exact match for better results
        { name: { $regex: searchTerm, $options: 'i' } },
      ];
    }
    if (filters?.familySKU) {
      filter.familySKU = filters.familySKU.toUpperCase();
    }
    // Filter by specific product IDs (for offers)
    if (filters?.productIds && filters.productIds.length > 0) {
      filter._id = { $in: filters.productIds.map(id => new Types.ObjectId(id)) };
    }

    const [data, total] = await Promise.all([
      this.productModel
        .find(filter)
        .populate('genderId', 'name slug')
        .populate('categoryId', 'name slug')
        .populate('subcategoryId', 'name slug')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.productModel.countDocuments(filter),
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
      this.logger.log(`Cached products query`);
    } catch (error) {
      this.logger.error('Cache write error:', error);
    }

    return result;
  }

  async findOne(id: string): Promise<Product> {
    const cacheKey = `${this.CACHE_PREFIX}id:${id}`;

    // Try to get from cache first
    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        this.logger.log(`Cache hit for product ${id}`);
        return JSON.parse(cached);
      }
    } catch (error) {
      this.logger.error('Cache read error:', error);
    }

    const product = await this.productModel
      .findById(id)
      .populate('genderId', 'name slug')
      .populate('categoryId', 'name slug')
      .populate('subcategoryId', 'name slug')
      .populate('relatedProductIds', 'name sku price discountPrice images')
      .exec();

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Cache the result
    try {
      await this.redisService.set(cacheKey, JSON.stringify(product), this.CACHE_TTL);
      this.logger.log(`Cached product ${id}`);
    } catch (error) {
      this.logger.error('Cache write error:', error);
    }

    return product;
  }

  async findBySKU(sku: string): Promise<Product> {
    const product = await this.productModel
      .findOne({ sku: sku.toUpperCase() })
      .populate('genderId', 'name slug')
      .populate('categoryId', 'name slug')
      .populate('subcategoryId', 'name slug')
      .populate('relatedProductIds', 'name sku price discountPrice images')
      .exec();

    if (!product) {
      throw new NotFoundException(`Product with SKU ${sku} not found`);
    }

    return product;
  }

  async findByFamilySKU(familySKU: string): Promise<Product[]> {
    return this.productModel
      .find({ familySKU: familySKU.toUpperCase(), isActive: true })
      .populate('genderId', 'name slug')
      .populate('categoryId', 'name slug')
      .populate('subcategoryId', 'name slug')
      .sort({ name: 1 })
      .exec();
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    // Validate relationships if being updated
    if (updateProductDto.genderId) {
      await this.genderService.findOne(updateProductDto.genderId);
    }
    if (updateProductDto.categoryId) {
      await this.categoryService.findOne(updateProductDto.categoryId);
    }
    if (updateProductDto.subcategoryId) {
      await this.subcategoryService.findOne(updateProductDto.subcategoryId);
    }

    // Validate discount price
    const newPrice = updateProductDto.price !== undefined ? updateProductDto.price : product.price;
    const newDiscountPrice =
      updateProductDto.discountPrice !== undefined
        ? updateProductDto.discountPrice
        : product.discountPrice;

    if (newDiscountPrice && newDiscountPrice >= newPrice) {
      throw new BadRequestException('Discount price must be less than the regular price');
    }

    // Check SKU uniqueness if being updated
    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      const existingSKU = await this.productModel.findOne({
        sku: updateProductDto.sku.toUpperCase(),
        _id: { $ne: id },
      });
      if (existingSKU) {
        throw new ConflictException(`Product with SKU ${updateProductDto.sku} already exists`);
      }
      updateProductDto.sku = updateProductDto.sku.toUpperCase();
    }

    // Normalize familySKU
    if (updateProductDto.familySKU) {
      updateProductDto.familySKU = updateProductDto.familySKU.toUpperCase();
    }

    // Validate related product IDs
    if (updateProductDto.relatedProductIds && updateProductDto.relatedProductIds.length > 0) {
      await this.validateRelatedProducts(updateProductDto.relatedProductIds);
    }

    Object.assign(product, updateProductDto);
    const savedProduct = await product.save();
    await this.invalidateCache();
    return savedProduct;
  }

  async remove(id: string): Promise<{ message: string }> {
    const product = await this.findOne(id);
    await product.deleteOne();
    await this.invalidateCache();
    return { message: `Product ${product.name} (SKU: ${product.sku}) has been deleted successfully` };
  }

  async updateStock(id: string, quantity: number): Promise<Product> {
    const product = await this.findOne(id);

    if (product.stock + quantity < 0) {
      throw new BadRequestException('Insufficient stock for this operation');
    }

    product.stock += quantity;
    const savedProduct = await product.save();
    await this.invalidateCache();
    return savedProduct;
  }

  private async generateUniqueSKU(genderName: string, categoryName: string): Promise<string> {
    let sku: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      sku = generateSKU(genderName, categoryName);
      const existing = await this.productModel.findOne({ sku });

      if (!existing) {
        return sku;
      }

      attempts++;
    } while (attempts < maxAttempts);

    throw new Error('Unable to generate unique SKU after multiple attempts');
  }

  private async validateRelatedProducts(productIds: string[]): Promise<void> {
    const products = await this.productModel
      .find({ _id: { $in: productIds.map((id) => new Types.ObjectId(id)) } })
      .select('_id')
      .exec();

    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more related product IDs are invalid');
    }
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    const cacheKey = `${this.CACHE_PREFIX}category:${categoryId}`;

    // Try to get from cache first
    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        this.logger.log(`Cache hit for products by category ${categoryId}`);
        return JSON.parse(cached);
      }
    } catch (error) {
      this.logger.error('Cache read error:', error);
    }

    await this.categoryService.findOne(categoryId);
    const products = await this.productModel
      .find({ categoryId: new Types.ObjectId(categoryId), isActive: true })
      .populate('genderId', 'name slug')
      .populate('categoryId', 'name slug')
      .populate('subcategoryId', 'name slug')
      .sort({ name: 1 })
      .exec();

    // Cache the result
    try {
      await this.redisService.set(cacheKey, JSON.stringify(products), this.CACHE_TTL);
      this.logger.log(`Cached products by category ${categoryId}`);
    } catch (error) {
      this.logger.error('Cache write error:', error);
    }

    return products;
  }

  async getProductsBySubcategory(subcategoryId: string): Promise<Product[]> {
    const cacheKey = `${this.CACHE_PREFIX}subcategory:${subcategoryId}`;

    // Try to get from cache first
    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        this.logger.log(`Cache hit for products by subcategory ${subcategoryId}`);
        return JSON.parse(cached);
      }
    } catch (error) {
      this.logger.error('Cache read error:', error);
    }

    await this.subcategoryService.findOne(subcategoryId);
    const products = await this.productModel
      .find({ subcategoryId: new Types.ObjectId(subcategoryId), isActive: true })
      .populate('genderId', 'name slug')
      .populate('categoryId', 'name slug')
      .populate('subcategoryId', 'name slug')
      .sort({ name: 1 })
      .exec();

    // Cache the result
    try {
      await this.redisService.set(cacheKey, JSON.stringify(products), this.CACHE_TTL);
      this.logger.log(`Cached products by subcategory ${subcategoryId}`);
    } catch (error) {
      this.logger.error('Cache write error:', error);
    }

    return products;
  }

  async autosuggest(query: string, limit: number = 10): Promise<any> {
    if (!query || query.trim().length < 2) {
      return {
        products: [],
        categories: [],
        subcategories: [],
      };
    }

    const searchRegex = new RegExp(query, 'i');

    // Search products
    const products = await this.productModel
      .find({
        isActive: true,
        $or: [
          { name: { $regex: searchRegex } },
          { sku: { $regex: searchRegex } },
          { description: { $regex: searchRegex } },
        ],
      })
      .select('_id name sku price discountPrice images')
      .limit(limit)
      .exec();

    // Search categories
    const categories = await this.categoryService.search(query, limit);

    // Search subcategories
    const subcategories = await this.subcategoryService.search(query, limit);

    return {
      products: products.map((p) => ({
        _id: p._id,
        name: p.name,
        sku: p.sku,
        price: p.price,
        discountPrice: p.discountPrice,
        image: p.images && p.images.length > 0 ? p.images[0] : null,
        type: 'product',
      })),
      categories: categories.map((c) => ({
        _id: c._id,
        name: c.name,
        slug: c.slug,
        type: 'category',
      })),
      subcategories: subcategories.map((s) => ({
        _id: s._id,
        name: s.name,
        slug: s.slug,
        type: 'subcategory',
      })),
    };
  }

  async getFeaturedProducts(limit: number = 12): Promise<Product[]> {
    const cacheKey = `${this.CACHE_PREFIX}featured:${limit}`;

    // Try to get from cache first
    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        this.logger.log(`Cache hit for featured products`);
        return JSON.parse(cached);
      }
    } catch (error) {
      this.logger.error('Cache read error:', error);
    }

    const products = await this.productModel
      .find({
        isActive: true,
        stock: { $gt: 0 },
      })
      .populate('genderId', 'name slug')
      .populate('categoryId', 'name slug')
      .populate('subcategoryId', 'name slug')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();

    // Cache the result
    try {
      await this.redisService.set(cacheKey, JSON.stringify(products), this.CACHE_TTL);
      this.logger.log(`Cached featured products`);
    } catch (error) {
      this.logger.error('Cache write error:', error);
    }

    return products;
  }

  /**
   * Creates a fuzzy regex pattern for search
   * Allows for typos and partial matches
   * e.g., "way" matches "sway", "wayward", etc.
   * e.g., "shrt" matches "shirt"
   */
  private createFuzzyRegex(searchTerm: string): string {
    // Split search term into words
    const words = searchTerm.toLowerCase().split(/\s+/);

    // Create patterns for each word
    const patterns = words.map(word => {
      // Allow any characters between each letter (fuzzy matching)
      // This helps with typos like "shrt" matching "shirt"
      const chars = word.split('');
      const fuzzyPattern = chars.join('.*?');

      // Also create a pattern that allows the word to be part of a larger word
      return `(${fuzzyPattern}|${word})`;
    });

    // Combine patterns - all words must match somewhere
    return patterns.join('.*');
  }
}

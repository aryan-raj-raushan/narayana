// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  addresses: Address[];
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface Admin {
  _id: string;
  name: string;
  email: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Product types
export interface Product {
  _id: string;
  name: string;
  sku: string;
  familySKU?: string;
  description?: string;
  genderId: Gender | string;
  categoryId: Category | string;
  subcategoryId: Subcategory | string;
  sizes?: string[];
  stock: number;
  price: number;
  discountPrice?: number;
  relatedProductIds?: string[];
  underPriceAmount?: number;
  images: string[];
  videos: string[];
  sliders: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Gender {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  genderId: Gender | string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subcategory {
  _id: string;
  name: string;
  slug: string;
  categoryId: Category | string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Cart types
export interface CartItem {
  _id: string;
  userId: string;
  productId: Product;
  quantity: number;
  addedAt: string;
  createdAt: string;
  updatedAt: string;
}

// Wishlist types
export interface WishlistItem {
  _id: string;
  userId: string;
  productId: Product;
  addedAt: string;
  createdAt: string;
  updatedAt: string;
}

// Order types
export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  price: number;
  discountPrice?: number;
  images: string[];
}

export interface Order {
  _id: string;
  orderId: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  totalAmount: number;
  totalItems: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
  shippingAddress?: string;
  contactEmail?: string;
  contactPhone?: string;
  createdAt: string;
  updatedAt: string;
}

// Offer types
export interface OfferRules {
  buyQuantity?: number;
  getQuantity?: number;
  bundlePrice?: number;
  discountPercentage?: number;
  discountAmount?: number;
  minQuantity?: number;
}

export interface Offer {
  _id: string;
  name: string;
  description?: string;
  offerType: 'buyXgetY' | 'bundleDiscount' | 'percentageOff' | 'fixedAmountOff';
  rules: OfferRules;
  productIds: string[];
  categoryIds: string[];
  subcategoryIds: string[];
  genderIds: string[];
  startDate: string;
  endDate: string;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  accessToken: string;
  user?: User;
  admin?: Admin;
}

// Login DTOs
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

// Create/Update DTOs
export interface CreateProductDto {
  name: string;
  sku?: string;
  familySKU?: string;
  description?: string;
  genderId: string;
  categoryId: string;
  subcategoryId: string;
  sizes?: string[];
  stock: number;
  price: number;
  discountPrice?: number;
  relatedProductIds?: string[];
  underPriceAmount?: number;
  images?: string[];
  videos?: string[];
  sliders?: string[];
  isActive?: boolean;
}

export interface CreateGenderDto {
  name: string;
  slug?: string;
  isActive?: boolean;
}

export interface CreateCategoryDto {
  name: string;
  slug?: string;
  genderId: string;
  isActive?: boolean;
}

export interface CreateSubcategoryDto {
  name: string;
  slug?: string;
  categoryId: string;
  isActive?: boolean;
}

export interface CreateOfferDto {
  name: string;
  description?: string;
  offerType: 'buyXgetY' | 'bundleDiscount' | 'percentageOff' | 'fixedAmountOff';
  rules: OfferRules;
  productIds?: string[];
  categoryIds?: string[];
  subcategoryIds?: string[];
  genderIds?: string[];
  startDate: string;
  endDate: string;
  isActive?: boolean;
  priority?: number;
}

export interface AddToCartDto {
  productId: string;
  quantity?: number;
}

export interface CreateOrderDto {
  notes?: string;
  shippingAddress?: string;
  contactEmail?: string;
  contactPhone?: string;
}

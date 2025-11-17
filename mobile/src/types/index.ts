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
  _id: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface Gender {
  _id: string;
  name: string;
  isActive: boolean;
}

export interface Category {
  _id: string;
  name: string;
  genderId: string;
  isActive: boolean;
}

export interface Subcategory {
  _id: string;
  name: string;
  categoryId: string | Category;
  imageUrl?: string;
  isActive: boolean;
}

export interface Product {
  _id: string;
  name: string;
  sku: string;
  familySKU?: string;
  description?: string;
  genderId: Gender;
  categoryId: Category;
  subcategoryId: Subcategory;
  sizes?: string[];
  stock: number;
  price: number;
  discountPrice?: number;
  relatedProductIds?: string[];
  images: string[];
  videos: string[];
  sliders: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartProduct {
  _id: string;
  name: string;
  sku: string;
  price: number;
  discountPrice?: number;
  images: string[];
}

export interface CartItem {
  _id: string;
  product: CartProduct;
  quantity: number;
  price: number;
  itemSubtotal: number;
  productDiscount: number;
  offerDiscount: number;
  itemTotal: number;
  appliedOffer: string | null;
  addedAt: string;
}

export interface CartSummary {
  subtotal: number;
  productDiscounts: number;
  offerDiscounts: number;
  totalDiscount: number;
  total: number;
}

export interface WishlistItem {
  _id: string;
  product: Product;
  addedAt: string;
}

export interface OrderItem {
  product: {
    _id: string;
    name: string;
    sku: string;
    images: string[];
  };
  quantity: number;
  price: number;
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

export interface Offer {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  price?: number;
  category?: string;
  isActive: boolean;
}

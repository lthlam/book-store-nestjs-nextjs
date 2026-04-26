export interface Genre {
  id: string;
  name: string;
}

export interface Author {
  id: string;
  name: string;
}

export interface Publisher {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  rating?: number;
  reviewCount?: number;
  soldCount?: number;
  stock?: number;
  year?: number | string;
  description?: string;
  genre?: Genre;
  author?: Author;
  publisher?: Publisher;
  createdAt?: string;
  special?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  contact?: string | number;
  avatar?: string;
  isBlocked?: boolean;
}

export interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface OrderAddressSnapshot {
  street: string;
  ward: string;
  province: string;
  wardCode?: string;
  contactName?: string;
  phoneNumber?: string;
}

export interface Order {
  id: string;
  user: User;
  userId?: string;
  items: OrderItem[];
  total: number;
  totalAmount?: number;
  shipping?: number;
  discount?: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED';
  shippingAddress: string;
  phoneNumber: string;
  address?: OrderAddressSnapshot;
  createdAt: string;
}

export interface EnrichedOrderItem {
  productId: string;
  quantity: number;
  price: number;
  product: Product | null;
}

export interface Review {
  id: string;
  user: User;
  product: Product;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Province {
  code: string;
  name: string;
}

export interface Ward {
  code: string;
  name: string;
  province?: Province;
}

export interface Address {
  id: string;
  user: User;
  street: string;
  wardCode: string;
  ward?: Ward;
  contactName?: string;
  phoneNumber?: string;
  isDefault?: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discount: number | string;
  type: string;
  description: string;
  minimum: number | string;
  startDate: string;
  expiryDate: string;
}

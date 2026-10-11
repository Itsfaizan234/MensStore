export type ProductCategory =
  | 'Watches'
  | "Men's Clothing"
  | 'Accessories'
  | 'Wallets'
  | 'Perfumes';

export type SortOption =
  | 'featured'
  | 'newest'
  | 'price-asc'
  | 'price-desc'
  | 'rating-desc';

export interface Product {
  id: string;
  sku: string;
  title: string;
  subtitle: string;
  brand: string;
  category: ProductCategory;
  price: number;
  oldPrice?: number;
  rating: number;
  reviewCount: number;
  stock: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  createdAt: string;
  image: string;
  imageFocus?: string;
  description: string;
  specifications: { label: string; value: string }[];
  variants: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant: string;
}

export interface OrderCustomer {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  paymentMethod: 'Card' | 'Bank Wire' | 'Cash on Delivery';
  shippingMethod: 'Standard Insured' | 'Express Armored';
  notes?: string;
}

export type OrderStatus =
  | 'Confirmed'
  | 'Horologist Inspection'
  | 'Dispatched'
  | 'Delivered';

export interface Order {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  status: OrderStatus;
  customer: OrderCustomer;
  items: CartItem[];
  subtotal: number;
  productSavings: number;
  promoCode?: string;
  promoDiscount: number;
  shippingCost: number;
  grandTotal: number;
}

export interface FilterState {
  searchQuery: string;
  category: ProductCategory | 'All';
  brand: string;
  maxPrice: number;
  minPrice: number;
  onlyInStock: boolean;
  sortBy: SortOption;
}

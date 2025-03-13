// Upstart Commerce API Response Types

export interface UpstartBook {
  id: string;
  sku: string;
  title: string;
  author: string;
  description: string;
  price: {
    amount: number;
    currency: string;
    compareAtAmount?: number;
  };
  images: {
    url: string;
    altText?: string;
  }[];
  categories: {
    id: string;
    name: string;
  }[];
  attributes: {
    format?: string;
    publicationYear?: number;
    isBestSeller?: boolean;
    isNewRelease?: boolean;
    rating?: number;
    reviewCount?: number;
  };
  inventoryStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
}

export interface UpstartBooksResponse {
  books: UpstartBook[];
  pagination: {
    totalCount: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
  };
}

export interface UpstartCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  image?: string;
}

export interface UpstartCategoriesResponse {
  categories: UpstartCategory[];
}

// Frontend Types
export interface CartItem {
  id: string;
  bookId: string;
  title: string;
  author: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export interface FilterState {
  categories: string[];
  priceRange: {
    min?: number;
    max?: number;
  };
  format: string[];
  rating: number | null;
  publicationYear: number[];
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface Order {
  items: CartItem[];
  total: number;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
}

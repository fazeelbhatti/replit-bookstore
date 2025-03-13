import axios from 'axios';
import { type UpstartBooksResponse, type UpstartBook, type UpstartCategoriesResponse } from '@shared/types';

// Ideally this would be in an environment variable
const UPSTART_API_BASE_URL = process.env.UPSTART_API_URL || 'https://api.upstartcommerce.com/v1';
const UPSTART_API_KEY = process.env.UPSTART_API_KEY || '';

// Create an axios instance with default config
const upstartApi = axios.create({
  baseURL: UPSTART_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${UPSTART_API_KEY}`
  }
});

// Error handling middleware
upstartApi.interceptors.response.use(
  response => response,
  error => {
    console.error('Upstart API Error:', error.response?.data || error.message);
    throw error;
  }
);

// Get all books with optional filters
export async function getBooks(options?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sort?: string;
}): Promise<UpstartBooksResponse> {
  try {
    const params = new URLSearchParams();
    
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.category) params.append('category', options.category);
    if (options?.search) params.append('q', options.search);
    if (options?.sort) params.append('sort', options.sort);
    
    const response = await upstartApi.get<UpstartBooksResponse>('/books', { params });
    return response.data;
  } catch (error) {
    // In a real implementation we might retry or handle different error cases
    console.error('Failed to fetch books from Upstart Commerce API', error);
    // Return empty response structure for error case
    return {
      books: [],
      pagination: {
        totalCount: 0,
        pageSize: 0,
        currentPage: 0,
        totalPages: 0
      }
    };
  }
}

// Get a single book by ID
export async function getBookById(id: string): Promise<UpstartBook | null> {
  try {
    const response = await upstartApi.get<{ book: UpstartBook }>(`/books/${id}`);
    return response.data.book;
  } catch (error) {
    console.error(`Failed to fetch book with id ${id} from Upstart Commerce API`, error);
    return null;
  }
}

// Get all categories
export async function getCategories(): Promise<UpstartCategoriesResponse> {
  try {
    const response = await upstartApi.get<UpstartCategoriesResponse>('/categories');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch categories from Upstart Commerce API', error);
    return { categories: [] };
  }
}

// These are mock/sample data for development, but in production would come from the actual API
// This is here temporarily until we have the real API integration
export const mockBooks: UpstartBook[] = [
  {
    id: '1',
    sku: 'book-001',
    title: 'The Silent Patient',
    author: 'Alex Michaelides',
    description: "A psychological thriller about a woman's act of violence against her husband and her refusal to explain it.",
    price: {
      amount: 16.99,
      currency: 'USD'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&h=700&fit=crop',
        altText: 'The Silent Patient'
      }
    ],
    categories: [
      {
        id: 'mystery',
        name: 'Mystery'
      },
      {
        id: 'thriller',
        name: 'Thriller'
      }
    ],
    attributes: {
      format: 'Hardcover',
      publicationYear: 2019,
      isBestSeller: true,
      rating: 4.5,
      reviewCount: 1204
    },
    inventoryStatus: 'IN_STOCK'
  },
  {
    id: '2',
    sku: 'book-002',
    title: 'Atomic Habits',
    author: 'James Clear',
    description: 'An easy and proven way to build good habits and break bad ones.',
    price: {
      amount: 21.99,
      currency: 'USD'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1603162955500-b15a42a92165?w=500&h=700&fit=crop',
        altText: 'Atomic Habits'
      }
    ],
    categories: [
      {
        id: 'non-fiction',
        name: 'Non-fiction'
      },
      {
        id: 'self-help',
        name: 'Self Help'
      }
    ],
    attributes: {
      format: 'Hardcover',
      publicationYear: 2018,
      isBestSeller: true,
      rating: 5.0,
      reviewCount: 3587
    },
    inventoryStatus: 'IN_STOCK'
  },
  {
    id: '3',
    sku: 'book-003',
    title: 'Educated',
    author: 'Tara Westover',
    description: 'A memoir about a young girl who, kept out of school, leaves her survivalist family and goes on to earn a PhD from Cambridge University.',
    price: {
      amount: 14.99,
      currency: 'USD'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=500&h=700&fit=crop',
        altText: 'Educated'
      }
    ],
    categories: [
      {
        id: 'non-fiction',
        name: 'Non-fiction'
      },
      {
        id: 'biography',
        name: 'Biography'
      }
    ],
    attributes: {
      format: 'Paperback',
      publicationYear: 2018,
      rating: 4.0,
      reviewCount: 2416
    },
    inventoryStatus: 'IN_STOCK'
  },
  {
    id: '4',
    sku: 'book-004',
    title: 'Where the Crawdads Sing',
    author: 'Delia Owens',
    description: 'A novel about a young woman who raises herself in the marshes of the deep South after she is abandoned by her family.',
    price: {
      amount: 17.99,
      currency: 'USD'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1531072901881-d644216d4bf9?w=500&h=700&fit=crop',
        altText: 'Where the Crawdads Sing'
      }
    ],
    categories: [
      {
        id: 'fiction',
        name: 'Fiction'
      }
    ],
    attributes: {
      format: 'Hardcover',
      publicationYear: 2018,
      rating: 4.5,
      reviewCount: 5102
    },
    inventoryStatus: 'IN_STOCK'
  },
  {
    id: '5',
    sku: 'book-005',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    description: 'Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.',
    price: {
      amount: 12.99,
      currency: 'USD'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1525640932057-7c4c13cb17b6?w=500&h=700&fit=crop',
        altText: 'The Midnight Library'
      }
    ],
    categories: [
      {
        id: 'fiction',
        name: 'Fiction'
      },
      {
        id: 'fantasy',
        name: 'Fantasy'
      }
    ],
    attributes: {
      format: 'Paperback',
      publicationYear: 2020,
      rating: 4.0,
      reviewCount: 1874
    },
    inventoryStatus: 'IN_STOCK'
  },
  {
    id: '6',
    sku: 'book-006',
    title: 'The Four Winds',
    author: 'Kristin Hannah',
    description: 'From the number-one bestselling author of The Nightingale and The Great Alone comes a powerful American epic about love and heroism and hope, set during the Great Depression.',
    price: {
      amount: 24.99,
      currency: 'USD'
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1587095951604-b9d924a3fda0?w=500&h=700&fit=crop',
        altText: 'The Four Winds'
      }
    ],
    categories: [
      {
        id: 'fiction',
        name: 'Fiction'
      },
      {
        id: 'historical',
        name: 'Historical'
      }
    ],
    attributes: {
      format: 'Hardcover',
      publicationYear: 2021,
      isNewRelease: true,
      rating: 4.5,
      reviewCount: 947
    },
    inventoryStatus: 'IN_STOCK'
  }
];

export const mockCategories = [
  { id: 'all', name: 'All Categories', slug: 'all' },
  { id: 'fiction', name: 'Fiction', slug: 'fiction' },
  { id: 'non-fiction', name: 'Non-fiction', slug: 'non-fiction' },
  { id: 'fantasy', name: 'Fantasy', slug: 'fantasy' },
  { id: 'mystery', name: 'Mystery', slug: 'mystery' },
  { id: 'romance', name: 'Romance', slug: 'romance' },
  { id: 'science-fiction', name: 'Science Fiction', slug: 'science-fiction' },
  { id: 'biography', name: 'Biography', slug: 'biography' },
  { id: 'thriller', name: 'Thriller', slug: 'thriller' },
  { id: 'historical', name: 'Historical', slug: 'historical' },
  { id: 'self-help', name: 'Self Help', slug: 'self-help' }
];

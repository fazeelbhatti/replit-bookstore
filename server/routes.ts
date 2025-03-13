import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertCartItemSchema } from "@shared/schema";
import {
  getBooks, 
  getBookById, 
  getCategories,
  searchBooks,
  getSearchFacets,
  mockBooks,
  mockCategories
} from "./api/upstart";
import { v4 as uuidv4 } from 'uuid';
import 'express-session';

// Extend the Express Request type to include session
declare module 'express-session' {
  interface SessionData {
    id: string;
  }
}

// Helper functions
const getSessionId = (req: Request): string => {
  if (!req.session.id) {
    req.session.id = uuidv4();
  }
  return req.session.id;
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Books API routes
  app.get("/api/books", async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;
      const category = req.query.category as string;
      const search = req.query.search as string;
      const sort = req.query.sort as string;

      // Call the Upstart Commerce API
      const result = await getBooks({ page, limit, category, search, sort });
      
      // Use mock data as fallback if the API call returns no books and we need to develop
      // without an API key temporarily
      if (result.books.length === 0 && process.env.NODE_ENV !== 'production') {
        console.warn('No books returned from API, using mock data for development');
        
        // Apply the same filters to mock data for development
        let filteredBooks = [...mockBooks];
        
        if (category && category !== 'all') {
          filteredBooks = filteredBooks.filter(book => 
            book.categories.some(cat => cat.id === category)
          );
        }
        
        if (search) {
          const searchLower = search.toLowerCase();
          filteredBooks = filteredBooks.filter(book => 
            book.title.toLowerCase().includes(searchLower) || 
            book.author.toLowerCase().includes(searchLower)
          );
        }
        
        // Apply sorting
        if (sort) {
          switch (sort) {
            case 'price-low-high':
              filteredBooks.sort((a, b) => a.price.amount - b.price.amount);
              break;
            case 'price-high-low':
              filteredBooks.sort((a, b) => b.price.amount - a.price.amount);
              break;
            case 'newest':
              filteredBooks.sort((a, b) => 
                (b.attributes.publicationYear || 0) - (a.attributes.publicationYear || 0)
              );
              break;
            case 'rating':
              filteredBooks.sort((a, b) => 
                (b.attributes.rating || 0) - (a.attributes.rating || 0)
              );
              break;
            default:
              filteredBooks.sort((a, b) => {
                if (a.attributes.isBestSeller && !b.attributes.isBestSeller) return -1;
                if (!a.attributes.isBestSeller && b.attributes.isBestSeller) return 1;
                return (b.attributes.reviewCount || 0) - (a.attributes.reviewCount || 0);
              });
          }
        }
        
        // Pagination
        const offset = (page - 1) * limit;
        const paginatedBooks = filteredBooks.slice(offset, offset + limit);
        
        res.json({
          books: paginatedBooks,
          pagination: {
            totalCount: filteredBooks.length,
            pageSize: limit,
            currentPage: page,
            totalPages: Math.ceil(filteredBooks.length / limit)
          }
        });
      } else {
        // Return the actual API response
        res.json(result);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
      res.status(500).json({ message: "Failed to fetch books" });
    }
  });

  app.get("/api/books/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Call the Upstart Commerce API
      const book = await getBookById(id);
      
      // Use mock data as fallback for development if API call returns no results
      if (!book && process.env.NODE_ENV !== 'production') {
        console.warn(`No book with id ${id} returned from API, using mock data for development`);
        const mockBook = mockBooks.find(b => b.id === id);
        
        if (!mockBook) {
          return res.status(404).json({ message: "Book not found" });
        }
        
        return res.json({ book: mockBook });
      }
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      res.json({ book });
    } catch (error) {
      console.error(`Error fetching book ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to fetch book details" });
    }
  });

  app.get("/api/categories", async (_req: Request, res: Response) => {
    try {
      // Get categories from Upstart Commerce API
      const result = await getCategories();
      
      // If we have categories from the API, use them
      if (result.categories.length > 0) {
        res.json(result);
      } else {
        // For development, use mock data if API returns no categories
        if (process.env.NODE_ENV !== 'production') {
          console.warn('No categories returned from API, using mock data for development');
          res.json({ categories: mockCategories });
        } else {
          // In production, return whatever the API gave us (empty array)
          res.json(result);
        }
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  
  // Advanced Search API
  app.get("/api/search", async (req: Request, res: Response) => {
    try {
      // Extract search parameters from query
      const query = req.query.q as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;
      
      // Parse filter parameters
      const filters: Record<string, string | number | Array<string | number>> = {};
      
      // Handle category filters
      if (req.query.category && req.query.category !== 'all') {
        filters['category.id'] = req.query.category as string;
      }
      
      // Handle price range filters
      const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined;
      const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;
      if (minPrice !== undefined || maxPrice !== undefined) {
        const priceValues: Array<string | number> = [];
        if (minPrice !== undefined) {
          priceValues.push(`>=${minPrice}`);
        }
        if (maxPrice !== undefined) {
          priceValues.push(`<=${maxPrice}`);
        }
        filters['price.amount'] = priceValues;
      }
      
      // Handle format filters
      if (req.query.format) {
        const formats = Array.isArray(req.query.format) 
          ? req.query.format as string[]
          : [req.query.format as string];
        if (formats.length > 0) {
          filters['attributes.format'] = formats;
        }
      }
      
      // Handle rating filter
      if (req.query.rating) {
        filters['attributes.rating'] = `>=${req.query.rating}`;
      }
      
      // Handle publication year filter
      if (req.query.year) {
        const years = Array.isArray(req.query.year) 
          ? req.query.year as string[]
          : [req.query.year as string];
        if (years.length > 0) {
          filters['attributes.publicationYear'] = years.map(y => parseInt(y));
        }
      }
      
      // Handle sorting
      let sort: { field: string; direction: 'asc' | 'desc' } | undefined;
      if (req.query.sort) {
        const sortValue = req.query.sort as string;
        switch (sortValue) {
          case 'price-low-high':
            sort = { field: 'price.amount', direction: 'asc' };
            break;
          case 'price-high-low':
            sort = { field: 'price.amount', direction: 'desc' };
            break;
          case 'newest':
            sort = { field: 'attributes.publicationYear', direction: 'desc' };
            break;
          case 'rating':
            sort = { field: 'attributes.rating', direction: 'desc' };
            break;
          // Default sorting is handled by the API
        }
      }
      
      // Specify which facets we want
      const facets = [
        'category',
        'price.amount',
        'attributes.format',
        'attributes.publicationYear',
        'attributes.rating'
      ];
      
      // Call the enhanced search API
      const searchResult = await searchBooks({
        query,
        page,
        limit,
        filters,
        facets,
        sort
      });
      
      // Development fallback if needed
      if (searchResult.items.length === 0 && process.env.NODE_ENV !== 'production') {
        console.warn('No search results returned from API, using mock data for development');
        
        // Apply filters to mock data to simulate search
        let filteredBooks = [...mockBooks];
        
        // Basic search by title or author
        if (query) {
          const queryLower = query.toLowerCase();
          filteredBooks = filteredBooks.filter(book => 
            book.title.toLowerCase().includes(queryLower) || 
            book.author.toLowerCase().includes(queryLower) ||
            book.description.toLowerCase().includes(queryLower)
          );
        }
        
        // Apply category filter
        if (filters['category.id']) {
          const category = filters['category.id'] as string;
          filteredBooks = filteredBooks.filter(book => 
            book.categories.some(cat => cat.id === category)
          );
        }
        
        // Apply price filter
        if (filters['price.amount']) {
          const priceValues = filters['price.amount'] as string[];
          filteredBooks = filteredBooks.filter(book => {
            for (const priceValue of priceValues) {
              if (priceValue.startsWith('>=')) {
                const minPrice = parseFloat(priceValue.substring(2));
                if (book.price.amount < minPrice) return false;
              } else if (priceValue.startsWith('<=')) {
                const maxPrice = parseFloat(priceValue.substring(2));
                if (book.price.amount > maxPrice) return false;
              }
            }
            return true;
          });
        }
        
        // Apply format filter
        if (filters['attributes.format']) {
          const formats = filters['attributes.format'] as string[];
          filteredBooks = filteredBooks.filter(book => 
            formats.includes(book.attributes.format || '')
          );
        }
        
        // Apply rating filter
        if (filters['attributes.rating']) {
          const ratingValue = filters['attributes.rating'] as string;
          if (ratingValue.startsWith('>=')) {
            const minRating = parseFloat(ratingValue.substring(2));
            filteredBooks = filteredBooks.filter(book => 
              (book.attributes.rating || 0) >= minRating
            );
          }
        }
        
        // Apply publication year filter
        if (filters['attributes.publicationYear']) {
          const years = filters['attributes.publicationYear'] as number[];
          filteredBooks = filteredBooks.filter(book => 
            years.includes(book.attributes.publicationYear || 0)
          );
        }
        
        // Apply sorting
        if (sort) {
          switch (sort.field) {
            case 'price.amount':
              filteredBooks.sort((a, b) => 
                sort.direction === 'asc' 
                  ? a.price.amount - b.price.amount
                  : b.price.amount - a.price.amount
              );
              break;
            case 'attributes.publicationYear':
              filteredBooks.sort((a, b) => 
                sort.direction === 'asc'
                  ? (a.attributes.publicationYear || 0) - (b.attributes.publicationYear || 0)
                  : (b.attributes.publicationYear || 0) - (a.attributes.publicationYear || 0)
              );
              break;
            case 'attributes.rating':
              filteredBooks.sort((a, b) => 
                sort.direction === 'asc'
                  ? (a.attributes.rating || 0) - (b.attributes.rating || 0)
                  : (b.attributes.rating || 0) - (a.attributes.rating || 0)
              );
              break;
          }
        }
        
        // Pagination
        const offset = (page - 1) * limit;
        const paginatedBooks = filteredBooks.slice(offset, offset + limit);
        
        // Generate mock facets based on all books for development
        const mockFacets = [
          {
            code: 'category',
            name: 'Category',
            type: 'TERMS' as const,
            values: mockCategories
              .filter(cat => cat.id !== 'all')
              .map(cat => ({
                value: cat.id,
                name: cat.name,
                count: mockBooks.filter(book => 
                  book.categories.some(c => c.id === cat.id)
                ).length,
                selected: filters['category.id'] === cat.id
              }))
          },
          {
            code: 'attributes.format',
            name: 'Format',
            type: 'TERMS' as const,
            values: Array.from(new Set(mockBooks.map(book => book.attributes.format)))
              .filter(Boolean)
              .map(format => ({
                value: format as string,
                name: format as string,
                count: mockBooks.filter(book => book.attributes.format === format).length,
                selected: Array.isArray(filters['attributes.format']) && 
                  filters['attributes.format'].includes(format as string)
              }))
          }
        ];
        
        res.json({
          items: paginatedBooks,
          facets: mockFacets,
          pagination: {
            totalCount: filteredBooks.length,
            pageSize: limit,
            currentPage: page,
            totalPages: Math.ceil(filteredBooks.length / limit)
          },
          query,
          sort
        });
      } else {
        // Return the actual API response
        res.json(searchResult);
      }
    } catch (error) {
      console.error("Error during search:", error);
      res.status(500).json({ message: "Failed to perform search" });
    }
  });
  
  // Get available search facets
  app.get("/api/search/facets", async (_req: Request, res: Response) => {
    try {
      const facets = await getSearchFacets();
      res.json({ facets });
    } catch (error) {
      console.error("Error fetching search facets:", error);
      res.status(500).json({ message: "Failed to fetch search facets" });
    }
  });

  // Cart API routes
  app.get("/api/cart", async (req: Request, res: Response) => {
    try {
      const sessionId = getSessionId(req);
      const cartItems = await storage.getCartItems(sessionId);
      
      let total = 0;
      const items = await Promise.all(cartItems.map(async item => {
        try {
          // Try to get real book data from the API
          const book = await getBookById(item.bookId);
          
          if (book) {
            const itemTotal = book.price.amount * item.quantity;
            total += itemTotal;
            
            return {
              id: item.id,
              bookId: item.bookId,
              title: book.title,
              author: book.author,
              price: book.price.amount,
              imageUrl: book.images[0]?.url || '',
              quantity: item.quantity
            };
          }
        } catch (bookError) {
          console.warn(`Could not fetch real book data for ${item.bookId}, will try mock data`);
        }
        
        // Fallback to mock data if API call fails or book not found
        if (process.env.NODE_ENV !== 'production') {
          const mockBook = mockBooks.find(b => b.id === item.bookId);
          if (mockBook) {
            const itemTotal = mockBook.price.amount * item.quantity;
            total += itemTotal;
            
            return {
              id: item.id,
              bookId: item.bookId,
              title: mockBook.title,
              author: mockBook.author,
              price: mockBook.price.amount,
              imageUrl: mockBook.images[0]?.url || '',
              quantity: item.quantity
            };
          }
        }
        
        return null;
      }));
      
      // Filter out any null items that weren't found
      const validItems = items.filter(item => item !== null);
      
      res.json({
        items: validItems,
        total
      });
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", async (req: Request, res: Response) => {
    try {
      const sessionId = getSessionId(req);
      
      const schema = z.object({
        bookId: z.string(),
        quantity: z.number().int().positive()
      });
      
      const validatedData = schema.parse(req.body);
      
      // Check if the item is already in the cart
      const existingItem = await storage.getCartItem(sessionId, validatedData.bookId);
      
      if (existingItem) {
        // Update quantity if the item already exists
        const updatedItem = await storage.updateCartItem(
          existingItem.id, 
          existingItem.quantity + validatedData.quantity
        );
        
        if (!updatedItem) {
          return res.status(500).json({ message: "Failed to update cart item" });
        }
        
        return res.status(200).json({
          message: "Cart updated successfully",
          item: {
            id: updatedItem.id,
            bookId: updatedItem.bookId,
            quantity: updatedItem.quantity
          }
        });
      }
      
      // Try to get the book from the API
      let bookPrice: number;
      try {
        const book = await getBookById(validatedData.bookId);
        if (book) {
          bookPrice = book.price.amount;
        } else {
          // If book not found in API and we're in development, try mock data
          if (process.env.NODE_ENV !== 'production') {
            const mockBook = mockBooks.find(b => b.id === validatedData.bookId);
            if (mockBook) {
              bookPrice = mockBook.price.amount;
            } else {
              return res.status(404).json({ message: "Book not found" });
            }
          } else {
            return res.status(404).json({ message: "Book not found" });
          }
        }
      } catch (error) {
        // If API call fails and we're in development, try mock data
        if (process.env.NODE_ENV !== 'production') {
          const mockBook = mockBooks.find(b => b.id === validatedData.bookId);
          if (mockBook) {
            bookPrice = mockBook.price.amount;
          } else {
            return res.status(404).json({ message: "Book not found" });
          }
        } else {
          console.error("Error fetching book:", error);
          return res.status(500).json({ message: "Error fetching book details" });
        }
      }
      
      // Add new item to cart
      const newCartItem = await storage.createCartItem({
        sessionId,
        bookId: validatedData.bookId,
        quantity: validatedData.quantity,
        price: bookPrice
      });
      
      res.status(201).json({
        message: "Item added to cart",
        item: {
          id: newCartItem.id,
          bookId: newCartItem.bookId,
          quantity: newCartItem.quantity
        }
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(400).json({ 
        message: "Failed to add item to cart",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.patch("/api/cart/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const schema = z.object({
        quantity: z.number().int().positive()
      });
      
      const validatedData = schema.parse(req.body);
      
      // Update the cart item
      const updatedItem = await storage.updateCartItem(
        parseInt(id), 
        validatedData.quantity
      );
      
      if (!updatedItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.json({
        message: "Cart updated successfully",
        item: {
          id: updatedItem.id,
          bookId: updatedItem.bookId,
          quantity: updatedItem.quantity
        }
      });
    } catch (error) {
      console.error("Error updating cart:", error);
      res.status(400).json({ 
        message: "Failed to update cart item",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.delete("/api/cart/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteCartItem(parseInt(id));
      
      if (!success) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove item from cart" });
    }
  });

  app.delete("/api/cart", async (req: Request, res: Response) => {
    try {
      const sessionId = getSessionId(req);
      await storage.clearCart(sessionId);
      res.json({ message: "Cart cleared successfully" });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Checkout API routes
  app.post("/api/checkout", async (req: Request, res: Response) => {
    try {
      const sessionId = getSessionId(req);
      
      // Validate checkout data
      const schema = z.object({
        shippingAddress: z.object({
          firstName: z.string(),
          lastName: z.string(),
          address: z.string(),
          city: z.string(),
          state: z.string(),
          postalCode: z.string(),
          country: z.string(),
          phone: z.string()
        }),
        billingAddress: z.object({
          firstName: z.string(),
          lastName: z.string(),
          address: z.string(),
          city: z.string(),
          state: z.string(),
          postalCode: z.string(),
          country: z.string(),
          phone: z.string()
        }).optional(),
        paymentMethod: z.string()
      });
      
      const validatedData = schema.parse(req.body);
      
      // Get cart items
      const cartItems = await storage.getCartItems(sessionId);
      
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      
      // Calculate total
      let total = 0;
      for (const item of cartItems) {
        total += item.price * item.quantity;
      }
      
      // Create order
      const order = await storage.createOrder({
        sessionId,
        userId: null, // No authentication in this example
        status: "pending",
        total,
        shippingAddress: validatedData.shippingAddress,
        billingAddress: validatedData.billingAddress || validatedData.shippingAddress,
        paymentMethod: validatedData.paymentMethod,
      });
      
      // Create order items
      for (const item of cartItems) {
        await storage.createOrderItem({
          orderId: order.id,
          bookId: item.bookId,
          quantity: item.quantity,
          price: item.price
        });
      }
      
      // Clear cart after successful checkout
      await storage.clearCart(sessionId);
      
      res.status(201).json({
        message: "Order placed successfully",
        orderId: order.id
      });
    } catch (error) {
      console.error("Error processing checkout:", error);
      res.status(400).json({ 
        message: "Failed to process checkout",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  
  return httpServer;
}

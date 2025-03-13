import { 
  type Book, type InsertBook, 
  type CartItem, type InsertCartItem,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem,
  type User, type InsertUser 
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Book methods
  getBooks(options?: { limit?: number; offset?: number; category?: string; search?: string }): Promise<Book[]>;
  getBookByExternalId(externalId: string): Promise<Book | undefined>;
  createBook(book: InsertBook): Promise<Book>;
  
  // Cart methods
  getCartItems(sessionId: string): Promise<CartItem[]>;
  getCartItem(sessionId: string, bookId: string): Promise<CartItem | undefined>;
  createCartItem(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  deleteCartItem(id: number): Promise<boolean>;
  clearCart(sessionId: string): Promise<boolean>;
  
  // Order methods
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersBySessionId(sessionId: string): Promise<Order[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private books: Map<number, Book>;
  private cartItems: Map<number, CartItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  
  userCurrentId: number;
  bookCurrentId: number;
  cartItemCurrentId: number;
  orderCurrentId: number;
  orderItemCurrentId: number;

  constructor() {
    this.users = new Map();
    this.books = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    
    this.userCurrentId = 1;
    this.bookCurrentId = 1;
    this.cartItemCurrentId = 1;
    this.orderCurrentId = 1;
    this.orderItemCurrentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Book methods
  async getBooks(options?: { limit?: number; offset?: number; category?: string; search?: string }): Promise<Book[]> {
    let books = Array.from(this.books.values());
    
    if (options?.category) {
      books = books.filter(book => book.category === options.category);
    }
    
    if (options?.search) {
      const searchLower = options.search.toLowerCase();
      books = books.filter(book => 
        book.title.toLowerCase().includes(searchLower) || 
        book.author.toLowerCase().includes(searchLower)
      );
    }
    
    const offset = options?.offset || 0;
    const limit = options?.limit || books.length;
    
    return books.slice(offset, offset + limit);
  }
  
  async getBookByExternalId(externalId: string): Promise<Book | undefined> {
    return Array.from(this.books.values()).find(
      (book) => book.externalId === externalId,
    );
  }
  
  async createBook(insertBook: InsertBook): Promise<Book> {
    const id = this.bookCurrentId++;
    const book: Book = { 
      ...insertBook, 
      id,
      imageUrl: insertBook.imageUrl || null,
      rating: insertBook.rating || null,
      reviewCount: insertBook.reviewCount || null,
      isBestSeller: insertBook.isBestSeller || false,
      isNewRelease: insertBook.isNewRelease || false,
      discount: insertBook.discount || 0,
      publicationYear: insertBook.publicationYear || null,
      createdAt: new Date() 
    };
    this.books.set(id, book);
    return book;
  }
  
  // Cart methods
  async getCartItems(sessionId: string): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(
      (item) => item.sessionId === sessionId,
    );
  }
  
  async getCartItem(sessionId: string, bookId: string): Promise<CartItem | undefined> {
    return Array.from(this.cartItems.values()).find(
      (item) => item.sessionId === sessionId && item.bookId === bookId,
    );
  }
  
  async createCartItem(insertCartItem: InsertCartItem): Promise<CartItem> {
    const id = this.cartItemCurrentId++;
    const cartItem: CartItem = { 
      ...insertCartItem, 
      id,
      userId: insertCartItem.userId || null,
      quantity: insertCartItem.quantity || 1,
      createdAt: new Date()
    };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }
  
  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;
    
    const updatedItem: CartItem = { ...cartItem, quantity };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }
  
  async deleteCartItem(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }
  
  async clearCart(sessionId: string): Promise<boolean> {
    const cartItems = Array.from(this.cartItems.values()).filter(
      (item) => item.sessionId === sessionId,
    );
    
    for (const item of cartItems) {
      this.cartItems.delete(item.id);
    }
    
    return true;
  }
  
  // Order methods
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.orderCurrentId++;
    const order: Order = { 
      ...insertOrder, 
      id,
      status: insertOrder.status || "pending",
      userId: insertOrder.userId || null,
      shippingAddress: insertOrder.shippingAddress || null,
      billingAddress: insertOrder.billingAddress || null,
      paymentMethod: insertOrder.paymentMethod || null,
      createdAt: new Date() 
    };
    this.orders.set(id, order);
    return order;
  }
  
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async getOrdersBySessionId(sessionId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.sessionId === sessionId,
    );
  }
  
  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemCurrentId++;
    const orderItem: OrderItem = { ...insertOrderItem, id };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }
  
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === orderId,
    );
  }
}

export const storage = new MemStorage();

import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Book schema
export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  externalId: text("external_id").notNull().unique(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  description: text("description").notNull(),
  price: doublePrecision("price").notNull(),
  imageUrl: text("image_url"),
  category: text("category").notNull(),
  format: text("format").notNull(),
  rating: doublePrecision("rating"),
  reviewCount: integer("review_count"),
  isBestSeller: boolean("is_best_seller").default(false),
  isNewRelease: boolean("is_new_release").default(false),
  discount: integer("discount").default(0),
  publicationYear: integer("publication_year"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBookSchema = createInsertSchema(books).omit({
  id: true,
  createdAt: true,
});

export type InsertBook = z.infer<typeof insertBookSchema>;
export type Book = typeof books.$inferSelect;

// Cart schema
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  sessionId: text("session_id").notNull(),
  bookId: text("book_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  price: doublePrecision("price").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
});

export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;

// Order schema
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  sessionId: text("session_id").notNull(),
  status: text("status").notNull().default("pending"),
  total: doublePrecision("total").notNull(),
  shippingAddress: jsonb("shipping_address"),
  billingAddress: jsonb("billing_address"),
  paymentMethod: text("payment_method"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Order items schema
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  bookId: text("book_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: doublePrecision("price").notNull(),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

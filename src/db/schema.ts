import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, jsonb, numeric } from 'drizzle-orm/pg-core';

// Define 'users' table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID or local-${timestamp}
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  passwordHash: text('password_hash'),
  role: text('role').default('customer').notNull(),
  fullName: text('full_name'),
  phone: text('phone'),
  address: text('address'),
  postalCode: text('postal_code'),
  city: text('city'),
  country: text('country'),
});

// Define 'carts' table with a foreign key to 'users'
export const carts = pgTable('carts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  items: jsonb('items').notNull(), // JSON representation of CartItem[]
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define 'orders' table
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  items: jsonb('items').notNull(), // JSON representation of the ordered items
  total: numeric('total', { precision: 10, scale: 2 }).notNull(),
  status: text('status').notNull().default('processing'), // processing, completed, etc.
  paymentMethod: text('payment_method').notNull(),
  billingDetails: jsonb('billing_details').notNull(), // Address, name, phone, etc.
  createdAt: timestamp('created_at').defaultNow(),
});

// Define 'products' table for dynamic client catalog & configuration options editability
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(), // e.g., 'business_card', 'flyer'
  name: text('name').notNull(),
  sizes: jsonb('sizes').notNull(), // array of size options
  paperTypes: jsonb('paper_types').notNull(), // array of paperType options
  printings: jsonb('printings').notNull(), // array of printing options
  finishings: jsonb('finishings').notNull(), // array of finishing/lamination options
  quantities: jsonb('quantities').notNull(), // array of quantities/orders
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  cart: one(carts, {
    fields: [users.id],
    references: [carts.userId],
  }),
  orders: many(orders),
}));

export const cartsRelations = relations(carts, ({ one }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
}));

import {
  pgTable,
  text,
  timestamp,
  varchar,
  pgEnum,
  integer,
  numeric,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// ─── Enums ─────────────────────────────────────────────────────────────────────

export const subscriptionTierEnum = pgEnum("SubscriptionTier", [
  "FREE",
  "PRO",
  "ENTERPRISE",
]);

export const roomStatusEnum = pgEnum("RoomStatus", [
  "available", // kosong / tersedia
  "occupied", // terisi / ditempati penyewa
  "maintenance", // dalam perbaikan
]);

export const paymentStatusEnum = pgEnum("PaymentStatus", [
  "pending",
  "paid",
  "late",
  "cancelled",
]);

export const activityTypeEnum = pgEnum("ActivityType", [
  "payment_received",
  "tenant_registered",
  "maintenance_request",
  "room_vacated",
  "property_added",
  "other",
]);

// ─── Users ─────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  username: varchar("username", { length: 255 }).unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: text("name"),
  imageUrl: text("image_url"),
  subscriptionTier: subscriptionTierEnum("subscription_tier")
    .default("FREE")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Properties ────────────────────────────────────────────────────────────────

export const properties = pgTable("properties", {
  id: varchar("id", { length: 255 }).primaryKey(),
  ownerId: varchar("owner_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Rooms ─────────────────────────────────────────────────────────────────────

export const rooms = pgTable("rooms", {
  id: varchar("id", { length: 255 }).primaryKey(),
  propertyId: varchar("property_id", { length: 255 })
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  roomNumber: varchar("room_number", { length: 20 }).notNull(),
  floor: integer("floor").default(1),
  status: roomStatusEnum("status").default("available").notNull(),
  pricePerMonth: numeric("price_per_month", { precision: 12, scale: 2 }),
  notes: text("notes"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Tenants ───────────────────────────────────────────────────────────────────

export const tenants = pgTable("tenants", {
  id: varchar("id", { length: 255 }).primaryKey(),
  ownerId: varchar("owner_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  identityNumber: varchar("identity_number", { length: 100 }),
  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Room Tenants (active lease) ───────────────────────────────────────────────

export const roomTenants = pgTable("room_tenants", {
  id: varchar("id", { length: 255 }).primaryKey(),
  roomId: varchar("room_id", { length: 255 })
    .notNull()
    .references(() => rooms.id, { onDelete: "cascade" }),
  tenantId: varchar("tenant_id", { length: 255 })
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Payments ──────────────────────────────────────────────────────────────────

export const payments = pgTable("payments", {
  id: varchar("id", { length: 255 }).primaryKey(),
  roomTenantId: varchar("room_tenant_id", { length: 255 })
    .notNull()
    .references(() => roomTenants.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  dueDate: date("due_date"),
  paidAt: timestamp("paid_at"),
  status: paymentStatusEnum("status").default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Activity Logs ─────────────────────────────────────────────────────────────

export const activityLogs = pgTable("activity_logs", {
  id: varchar("id", { length: 255 }).primaryKey(),
  ownerId: varchar("owner_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  propertyId: varchar("property_id", { length: 255 }).references(
    () => properties.id,
    { onDelete: "set null" },
  ),
  type: activityTypeEnum("type").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Zod Schemas ───────────────────────────────────────────────────────────────

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertPropertySchema = createInsertSchema(properties);
export const selectPropertySchema = createSelectSchema(properties);
export const insertRoomSchema = createInsertSchema(rooms);
export const selectRoomSchema = createSelectSchema(rooms);
export const insertTenantSchema = createInsertSchema(tenants);
export const selectTenantSchema = createSelectSchema(tenants);
export const insertRoomTenantSchema = createInsertSchema(roomTenants);
export const selectRoomTenantSchema = createSelectSchema(roomTenants);
export const insertPaymentSchema = createInsertSchema(payments);
export const selectPaymentSchema = createSelectSchema(payments);
export const insertActivityLogSchema = createInsertSchema(activityLogs);
export const selectActivityLogSchema = createSelectSchema(activityLogs);

// ─── Types ─────────────────────────────────────────────────────────────────────

export type User = z.infer<typeof selectUserSchema>;
export type NewUser = z.infer<typeof insertUserSchema>;
export type Property = z.infer<typeof selectPropertySchema>;
export type NewProperty = z.infer<typeof insertPropertySchema>;
export type Room = z.infer<typeof selectRoomSchema>;
export type NewRoom = z.infer<typeof insertRoomSchema>;
export type Tenant = z.infer<typeof selectTenantSchema>;
export type NewTenant = z.infer<typeof insertTenantSchema>;
export type RoomTenant = z.infer<typeof selectRoomTenantSchema>;
export type NewRoomTenant = z.infer<typeof insertRoomTenantSchema>;
export type Payment = z.infer<typeof selectPaymentSchema>;
export type NewPayment = z.infer<typeof insertPaymentSchema>;
export type ActivityLog = z.infer<typeof selectActivityLogSchema>;
export type NewActivityLog = z.infer<typeof insertActivityLogSchema>;

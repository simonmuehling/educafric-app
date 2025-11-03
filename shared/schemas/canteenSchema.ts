import { pgTable, serial, integer, text, decimal, date, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Canteen Menus Table
export const canteenMenus = pgTable("canteen_menus", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").notNull(),
  date: date("date").notNull(),
  mealNameFr: text("meal_name_fr").notNull(),
  mealNameEn: text("meal_name_en").notNull(),
  descriptionFr: text("description_fr"),
  descriptionEn: text("description_en"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  available: boolean("available").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

// Canteen Reservations Table
export const canteenReservations = pgTable("canteen_reservations", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  menuId: integer("menu_id").notNull(),
  reservedDate: date("reserved_date").notNull(),
  paid: boolean("paid").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

// Canteen Balance Table (for tracking student balances)
export const canteenBalances = pgTable("canteen_balances", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().unique(),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow()
});

// Insert Schemas - simplified for compatibility
export const insertCanteenMenuSchema = z.object({
  schoolId: z.number(),
  date: z.string(),
  mealNameFr: z.string(),
  mealNameEn: z.string(),
  descriptionFr: z.string().optional(),
  descriptionEn: z.string().optional(),
  price: z.string(),
  available: z.boolean().optional()
});

export const insertCanteenReservationSchema = z.object({
  studentId: z.number(),
  menuId: z.number(),
  reservedDate: z.string(),
  paid: z.boolean().optional()
});

export const insertCanteenBalanceSchema = z.object({
  studentId: z.number(),
  balance: z.string()
});

// Types
export type CanteenMenu = typeof canteenMenus.$inferSelect;
export type InsertCanteenMenu = z.infer<typeof insertCanteenMenuSchema>;

export type CanteenReservation = typeof canteenReservations.$inferSelect;
export type InsertCanteenReservation = z.infer<typeof insertCanteenReservationSchema>;

export type CanteenBalance = typeof canteenBalances.$inferSelect;
export type InsertCanteenBalance = z.infer<typeof insertCanteenBalanceSchema>;

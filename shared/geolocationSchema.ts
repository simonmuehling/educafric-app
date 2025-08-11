import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Geolocation and Safety Tables
export const geolocationDevices = pgTable("geolocation_devices", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  deviceType: text("device_type").notNull(), // 'smartphone', 'smartwatch', 'gps_tracker'
  deviceId: text("device_id").notNull().unique(),
  isActive: boolean("is_active").default(true),
  batteryLevel: integer("battery_level"),
  lastUpdate: timestamp("last_update"),
  emergencyMode: boolean("emergency_mode").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const safeZones = pgTable("safe_zones", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  radius: integer("radius").notNull(),
  isActive: boolean("is_active").default(true),
  alertOnEntry: boolean("alert_on_entry").default(false),
  alertOnExit: boolean("alert_on_exit").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const locationTracking = pgTable("location_tracking", {
  id: serial("id").primaryKey(),
  deviceId: integer("device_id").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  accuracy: integer("accuracy"),
  altitude: decimal("altitude", { precision: 8, scale: 2 }),
  speed: decimal("speed", { precision: 6, scale: 2 }),
  heading: integer("heading"),
  batteryLevel: integer("battery_level"),
  isEmergency: boolean("is_emergency").default(false),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const geolocationAlerts = pgTable("geolocation_alerts", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  deviceId: integer("device_id").notNull(),
  alertType: text("alert_type").notNull(),
  priority: text("priority").notNull(),
  message: text("message").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  safeZoneId: integer("safe_zone_id"),
  isResolved: boolean("is_resolved").default(false),
  resolvedBy: integer("resolved_by"),
  resolvedAt: timestamp("resolved_at"),
  notificationsSent: jsonb("notifications_sent"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const emergencyContacts = pgTable("emergency_contacts", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  name: text("name").notNull(),
  relationship: text("relationship").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  priority: integer("priority").default(1),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas for geolocation tables
export const insertGeolocationDevice = createInsertSchema(geolocationDevices);
export const insertSafeZone = createInsertSchema(safeZones);
export const insertLocationTracking = createInsertSchema(locationTracking);
export const insertGeolocationAlert = createInsertSchema(geolocationAlerts);
export const insertEmergencyContact = createInsertSchema(emergencyContacts);

// Export types
export type GeolocationDevice = typeof geolocationDevices.$inferSelect;
export type SafeZone = typeof safeZones.$inferSelect;
export type LocationTracking = typeof locationTracking.$inferSelect;
export type GeolocationAlert = typeof geolocationAlerts.$inferSelect;
export type EmergencyContact = typeof emergencyContacts.$inferSelect;

export type InsertGeolocationDevice = z.infer<typeof insertGeolocationDevice>;
export type InsertSafeZone = z.infer<typeof insertSafeZone>;
export type InsertLocationTracking = z.infer<typeof insertLocationTracking>;
export type InsertGeolocationAlert = z.infer<typeof insertGeolocationAlert>;
export type InsertEmergencyContact = z.infer<typeof insertEmergencyContact>;
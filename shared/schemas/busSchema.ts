import { pgTable, serial, integer, text, time, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Bus Routes Table
export const busRoutes = pgTable("bus_routes", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").notNull(),
  busName: text("bus_name").notNull(),
  busNameFr: text("bus_name_fr"),
  busNameEn: text("bus_name_en"),
  driverName: text("driver_name").notNull(),
  driverPhone: text("driver_phone"),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

// Bus Stations Table
export const busStations = pgTable("bus_stations", {
  id: serial("id").primaryKey(),
  routeId: integer("route_id").notNull(),
  stationNameFr: text("station_name_fr").notNull(),
  stationNameEn: text("station_name_en").notNull(),
  stationTime: time("station_time").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 6 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 6 }).notNull(),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow()
});

// Bus Students (enrollment)
export const busStudents = pgTable("bus_students", {
  id: serial("id").primaryKey(),
  routeId: integer("route_id").notNull(),
  studentId: integer("student_id").notNull(),
  stationId: integer("station_id").notNull(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

// Insert Schemas - simplified for compatibility
export const insertBusRouteSchema = z.object({
  schoolId: z.number(),
  busName: z.string(),
  busNameFr: z.string().optional(),
  busNameEn: z.string().optional(),
  driverName: z.string(),
  driverPhone: z.string().optional(),
  startTime: z.string(),
  endTime: z.string(),
  active: z.boolean().optional()
});

export const insertBusStationSchema = z.object({
  routeId: z.number(),
  stationNameFr: z.string(),
  stationNameEn: z.string(),
  stationTime: z.string(),
  latitude: z.string(),
  longitude: z.string(),
  orderIndex: z.number().optional()
});

export const insertBusStudentSchema = z.object({
  routeId: z.number(),
  studentId: z.number(),
  stationId: z.number(),
  active: z.boolean().optional()
});

// Types
export type BusRoute = typeof busRoutes.$inferSelect;
export type InsertBusRoute = z.infer<typeof insertBusRouteSchema>;

export type BusStation = typeof busStations.$inferSelect;
export type InsertBusStation = z.infer<typeof insertBusStationSchema>;

export type BusStudent = typeof busStudents.$inferSelect;
export type InsertBusStudent = z.infer<typeof insertBusStudentSchema>;

// ===== REQUEST VALIDATION SCHEMAS =====
// Zod schemas for validating API requests and preventing security issues

import { z } from "zod";

// Room management validation schemas
export const roomCreationSchema = z.object({
  name: z.string().min(1, "Room name is required").max(100, "Room name too long"),
  capacity: z.number().int().min(1, "Capacity must be at least 1").max(500, "Capacity too large")
});

export const roomUpdateSchema = z.object({
  name: z.string().min(1, "Room name is required").max(100, "Room name too long").optional(),
  capacity: z.number().int().min(1, "Capacity must be at least 1").max(500, "Capacity too large").optional(),
  isOccupied: z.boolean().optional()
});

export const roomsBulkUpdateSchema = z.object({
  rooms: z.array(z.object({
    id: z.number().int().positive("Invalid room ID"),
    name: z.string().min(1).max(100).optional(),
    capacity: z.number().int().min(1).max(500).optional(),
    isOccupied: z.boolean().optional()
  })).max(50, "Too many rooms to update at once")
});

// Messaging validation schemas
export const messageCreationSchema = z.object({
  to: z.string().min(1, "Recipient is required").max(200, "Recipient name too long"),
  toRole: z.enum(['Admin', 'Director', 'Teacher', 'Student', 'Parent', 'Freelancer'], {
    errorMap: () => ({ message: "Invalid recipient role" })
  }).optional(),
  subject: z.string().min(1, "Subject is required").max(200, "Subject too long"),
  message: z.string().min(1, "Message content is required").max(5000, "Message too long"),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal')
});

// Settings update validation schemas
export const userSettingsUpdateSchema = z.object({
  profile: z.object({
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
    email: z.string().email("Invalid email format").optional(),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format").optional()
  }).optional(),
  preferences: z.object({
    language: z.enum(['fr', 'en']).optional(),
    notifications: z.object({
      email: z.boolean().optional(),
      sms: z.boolean().optional(),
      push: z.boolean().optional()
    }).optional(),
    theme: z.enum(['light', 'dark', 'modern', 'classic']).optional()
  }).optional(),
  security: z.object({
    twoFactorEnabled: z.boolean().optional(),
    sessionTimeout: z.number().int().min(5).max(480).optional() // 5 minutes to 8 hours
  }).optional()
});

// Parameter validation schemas
export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a positive number").transform(Number)
});

export const roomIdParamSchema = z.object({
  roomId: z.string().regex(/^\d+$/, "Room ID must be a positive number").transform(Number)
});

// Query parameter validation schemas
export const paginationQuerySchema = z.object({
  page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform((val) => val ? Math.min(parseInt(val, 10), 100) : 10),
  classId: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined),
  teacherId: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined)
});

// User creation validation (for critical user management endpoints)
export const userCreationSchema = z.object({
  email: z.string().email("Invalid email format"),
  firstName: z.string().min(1, "First name is required").max(100, "First name too long"),
  lastName: z.string().min(1, "Last name is required").max(100, "Last name too long"),
  role: z.enum(['Admin', 'Director', 'Teacher', 'Student', 'Parent', 'Freelancer', 'Commercial'], {
    errorMap: () => ({ message: "Invalid user role" })
  }),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format").optional(),
  schoolId: z.number().int().positive("Invalid school ID").optional()
});

// Type exports for better TypeScript integration
export type RoomCreationData = z.infer<typeof roomCreationSchema>;
export type RoomUpdateData = z.infer<typeof roomUpdateSchema>;
export type MessageCreationData = z.infer<typeof messageCreationSchema>;
export type UserSettingsUpdateData = z.infer<typeof userSettingsUpdateSchema>;
export type IdParam = z.infer<typeof idParamSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type UserCreationData = z.infer<typeof userCreationSchema>;
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

// School Partnership Contract validation schema - CRITICAL SECURITY
export const schoolPartnershipContractSchema = z.object({
  schoolName: z.string()
    .trim()
    .min(1, "School name is required")
    .max(200, "School name too long")
    .regex(/^[a-zA-Z0-9\s\-'".,()\u00e0\u00e2\u00e4\u00e9\u00e8\u00ea\u00eb\u00ef\u00ee\u00f4\u00f6\u00f9\u00fb\u00fc\u00ff\u00e7\u00c0\u00c2\u00c4\u00c9\u00c8\u00ca\u00cb\u00cf\u00ce\u00d4\u00d6\u00d9\u00db\u00dc\u0178\u00c7]+$/, "Invalid characters in school name")
    .optional(),
  amount: z.string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, "Amount must be a valid number")
    .transform((val) => parseFloat(val))
    .refine((val) => val >= 0 && val <= 1000000, "Amount must be between 0 and 1,000,000")
    .optional(),
  studentCount: z.string()
    .trim()
    .regex(/^\d+$/, "Student count must be a positive integer")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1 && val <= 10000, "Student count must be between 1 and 10,000")
    .optional(),
  contactInfo: z.string()
    .trim()
    .max(500, "Contact info too long")
    .regex(/^[a-zA-Z0-9\s\-'\".,()@+\u00e0\u00e2\u00e4\u00e9\u00e8\u00ea\u00eb\u00ef\u00ee\u00f4\u00f6\u00f9\u00fb\u00fc\u00ff\u00e7\u00c0\u00c2\u00c4\u00c9\u00c8\u00ca\u00cb\u00cf\u00ce\u00d4\u00d6\u00d9\u00db\u00dc\u0178\u00c7\n\r]+$/, "Invalid characters in contact info")
    .optional()
});

/**
 * Sanitize HTML content to prevent XSS attacks
 * Removes all HTML tags and dangerous characters
 * CRITICAL SECURITY FUNCTION
 */
export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    // Remove all HTML tags
    .replace(/<[^>]*>/g, '')
    // Escape HTML entities
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    // Remove control characters except newlines and tabs
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Trim whitespace
    .trim();
}

export type SchoolPartnershipContractData = z.infer<typeof schoolPartnershipContractSchema>;
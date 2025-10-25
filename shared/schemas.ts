import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { users, schools, classes, subjects, grades, attendance } from "./schema";

// Define USER_ROLES directly here
export const USER_ROLES = [
  'SiteAdmin', 'Admin', 'Director', 'Teacher', 
  'Parent', 'Student', 'Freelancer', 'Commercial'
] as const;

// Basic validation schemas
export const emailSchema = z.string().email("Invalid email format");
export const passwordSchema = z.string().min(8, "Password must be at least 8 characters");
export const nameSchema = z.string().min(2, "Name must be at least 2 characters");
export const phoneSchema = z.string().optional();

// Normalized user schemas
export const createUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true,
  firebaseUid: true,
}).extend({
  email: emailSchema.optional(), // Email is now OPTIONAL - phone is primary identifier
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  phoneNumber: z.string().min(10, "Phone number must be at least 10 characters"), // Phone is required
  role: z.enum(USER_ROLES),
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true });
export const selectUserSchema = createSelectSchema(users).omit({ password: true });

// For updating profile information (basic profile updates)
export const basicProfileUpdateSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  phone: phoneSchema,
  whatsappNumber: phoneSchema,
  preferredLanguage: z.enum(['en', 'fr']).optional(),
});

// Authentication schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

export const passwordResetSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// School schemas
export const createSchoolSchema = createInsertSchema(schools).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateSchoolSchema = createSchoolSchema.partial();
export const selectSchoolSchema = createSelectSchema(schools);

// Academic schemas
export const createClassSchema = createInsertSchema(classes).omit({
  id: true,
  createdAt: true,
});

export const createSubjectSchema = createInsertSchema(subjects).omit({ id: true });
export const createGradeSchema = createInsertSchema(grades).omit({ id: true });
export const createAttendanceSchema = createInsertSchema(attendance).omit({ 
  id: true, 
  createdAt: true
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Profile update schema
export const updateProfileSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  phone: phoneSchema,
  whatsappNumber: phoneSchema,
  preferredLanguage: z.enum(['en', 'fr']).optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
});

// Export types
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type SelectUser = z.infer<typeof selectUserSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type PasswordResetRequest = z.infer<typeof passwordResetRequestSchema>;
export type PasswordReset = z.infer<typeof passwordResetSchema>;
export type ChangePassword = z.infer<typeof changePasswordSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
export type PaginationQuery = z.infer<typeof paginationSchema>;
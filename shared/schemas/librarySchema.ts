import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Library Books table - stores book information with bilingual support
export const libraryBooks = pgTable("library_books", {
  id: serial("id").primaryKey(),
  title: jsonb("title").$type<{ fr: string; en: string }>().notNull(), // Bilingual title
  author: text("author").notNull(),
  description: jsonb("description").$type<{ fr: string; en: string }>(), // Bilingual description
  linkUrl: text("link_url"), // URL to access the book (optional)
  coverUrl: text("cover_url"), // URL to book cover image (optional)
  subjectIds: jsonb("subject_ids").$type<number[]>().default([]), // Array of subject IDs
  recommendedLevel: text("recommended_level"), // 'primary' | 'secondary' (optional)
  departmentIds: jsonb("department_ids").$type<number[]>().default([]), // Array of department IDs (optional)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Library Recommendations table - tracks which teachers recommend books to which audiences
export const libraryRecommendations = pgTable("library_recommendations", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id").notNull().references(() => libraryBooks.id, { onDelete: "cascade" }),
  teacherId: integer("teacher_id").notNull(), // References users table
  audienceType: text("audience_type").notNull().$type<"student" | "class" | "department">(), // Type of audience
  audienceIds: jsonb("audience_ids").$type<number[]>().notNull().default([]), // Array of student/class/department IDs
  note: text("note"), // Optional note from teacher
  recommendedAt: timestamp("recommended_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});

// Library Recommendation Audience table - normalized storage for recommendation targets
export const libraryRecommendationAudience = pgTable("library_recommendation_audience", {
  id: serial("id").primaryKey(),
  recommendationId: integer("recommendation_id").notNull().references(() => libraryRecommendations.id, { onDelete: "cascade" }),
  targetType: text("target_type").notNull().$type<"student" | "class" | "department">(), // Type of target
  targetId: integer("target_id").notNull(), // ID of student/class/department
  createdAt: timestamp("created_at").defaultNow()
});

// Library Recommendation Dispatch table - tracks notification sending status
export const libraryRecommendationDispatch = pgTable("library_recommendation_dispatch", {
  id: serial("id").primaryKey(),
  recommendationId: integer("recommendation_id").notNull().references(() => libraryRecommendations.id, { onDelete: "cascade" }),
  parentId: integer("parent_id").notNull(), // ID of parent receiving notification
  channel: text("channel").notNull().$type<"email" | "push" | "sms" | "whatsapp">(), // Notification channel
  status: text("status").notNull().$type<"queued" | "sent" | "failed">().default("queued"), // Dispatch status
  error: text("error"), // Error message if failed
  sentAt: timestamp("sent_at"), // When notification was sent
  createdAt: timestamp("created_at").defaultNow()
});

// WebPush Subscriptions table - stores push notification subscriptions
export const webpushSubscriptions = pgTable("webpush_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // References users table
  endpoint: text("endpoint").notNull(), // Push service endpoint
  p256dhKey: text("p256dh_key").notNull(), // P256DH public key
  authKey: text("auth_key").notNull(), // Auth secret
  userAgent: text("user_agent"), // Browser/device info (optional)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Additional validation schemas for better type safety (defined first to avoid circular deps)
export const libraryBookTitleSchema = z.object({
  fr: z.string().min(1, "French title is required"),
  en: z.string().min(1, "English title is required")
});

export const libraryBookDescriptionSchema = z.object({
  fr: z.string().optional(),
  en: z.string().optional()
}).optional();

// Zod schemas for validation
export const insertLibraryBookSchema = createInsertSchema(libraryBooks).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertLibraryRecommendationSchema = createInsertSchema(libraryRecommendations).omit({
  id: true,
  createdAt: true,
  recommendedAt: true
});

export const insertLibraryRecommendationAudienceSchema = createInsertSchema(libraryRecommendationAudience).omit({
  id: true,
  createdAt: true
});

export const insertLibraryRecommendationDispatchSchema = createInsertSchema(libraryRecommendationDispatch).omit({
  id: true,
  createdAt: true
});

export const insertWebpushSubscriptionSchema = createInsertSchema(webpushSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const audienceTypeSchema = z.enum(["student", "class", "department"]);
export const notificationChannelSchema = z.enum(["email", "push", "sms", "whatsapp"]);
export const dispatchStatusSchema = z.enum(["queued", "sent", "failed"]);

// TypeScript types
export type LibraryBook = typeof libraryBooks.$inferSelect;
export type InsertLibraryBook = z.infer<typeof insertLibraryBookSchema>;
export type LibraryRecommendation = typeof libraryRecommendations.$inferSelect;
export type InsertLibraryRecommendation = z.infer<typeof insertLibraryRecommendationSchema>;

export type LibraryRecommendationAudience = typeof libraryRecommendationAudience.$inferSelect;
export type InsertLibraryRecommendationAudience = z.infer<typeof insertLibraryRecommendationAudienceSchema>;
export type LibraryRecommendationDispatch = typeof libraryRecommendationDispatch.$inferSelect;
export type InsertLibraryRecommendationDispatch = z.infer<typeof insertLibraryRecommendationDispatchSchema>;
export type WebpushSubscription = typeof webpushSubscriptions.$inferSelect;
export type InsertWebpushSubscription = z.infer<typeof insertWebpushSubscriptionSchema>;

// Additional helper types for API responses
export type LibraryBookWithRecommendations = LibraryBook & {
  recommendations?: LibraryRecommendation[];
};

export type LibraryRecommendationWithBook = LibraryRecommendation & {
  book: LibraryBook;
  teacherName?: string;
};

// Enhanced types for the new class-specific system
export type LibraryRecommendationWithAudience = LibraryRecommendation & {
  book: LibraryBook;
  teacherName?: string;
  audiences: LibraryRecommendationAudience[];
  dispatch?: LibraryRecommendationDispatch[];
};

export type ParentLibraryRecommendation = {
  childId: number;
  childName: string;
  className: string;
  schoolName: string;
  recommendations: LibraryRecommendationWithBook[];
};
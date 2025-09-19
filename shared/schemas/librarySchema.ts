import { pgTable, text, serial, integer, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
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

// Additional validation schemas for better type safety
export const libraryBookTitleSchema = z.object({
  fr: z.string().min(1, "French title is required"),
  en: z.string().min(1, "English title is required")
});

export const libraryBookDescriptionSchema = z.object({
  fr: z.string().optional(),
  en: z.string().optional()
}).optional();

export const audienceTypeSchema = z.enum(["student", "class", "department"]);

// TypeScript types
export type LibraryBook = typeof libraryBooks.$inferSelect;
export type InsertLibraryBook = z.infer<typeof insertLibraryBookSchema>;
export type LibraryRecommendation = typeof libraryRecommendations.$inferSelect;
export type InsertLibraryRecommendation = z.infer<typeof insertLibraryRecommendationSchema>;

// Additional helper types for API responses
export type LibraryBookWithRecommendations = LibraryBook & {
  recommendations?: LibraryRecommendation[];
};

export type LibraryRecommendationWithBook = LibraryRecommendation & {
  book: LibraryBook;
  teacherName?: string;
};
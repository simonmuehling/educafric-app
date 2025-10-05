// ===== LIBRARY STORAGE MODULE =====
// Handles library books and recommendations storage operations

import { eq, and, inArray, desc } from "drizzle-orm";
import { db } from "../db";
import { ILibraryStorage } from "./interfaces";
import { 
  libraryBooks, 
  libraryRecommendations,
  type LibraryBook,
  type LibraryRecommendation,
  type InsertLibraryBook,
  type InsertLibraryRecommendation
} from "../../shared/schemas/librarySchema";
import { users, classes } from "../../shared/schema";

export class LibraryStorage implements ILibraryStorage {
  
  // === BOOK MANAGEMENT ===
  
  async getBooks(filters?: {
    subjectIds?: number[];
    departmentIds?: number[];
    recommendedLevel?: string;
    schoolId?: number;
  }): Promise<LibraryBook[]> {
    try {
      let whereConditions: any[] = [];
      
      if (filters?.recommendedLevel) {
        whereConditions.push(eq(libraryBooks.recommendedLevel, filters.recommendedLevel));
      }
      
      let query = db.select().from(libraryBooks);
      
      if (whereConditions.length > 0) {
        query = query.where(and(...whereConditions));
      }
      
      const result = await query.orderBy(desc(libraryBooks.createdAt));
      return result;
    } catch (error) {
      console.error("[LIBRARY_STORAGE] Error getting books:", error);
      throw error;
    }
  }
  
  async getBook(id: number): Promise<LibraryBook | null> {
    try {
      const result = await db.select()
        .from(libraryBooks)
        .where(eq(libraryBooks.id, id))
        .limit(1);
      
      return result[0] || null;
    } catch (error) {
      console.error("[LIBRARY_STORAGE] Error getting book:", error);
      throw error;
    }
  }
  
  async createBook(bookData: any): Promise<LibraryBook> {
    try {
      const result = await db.insert(libraryBooks)
        .values(bookData as any)
        .returning();
      
      console.log("[LIBRARY_STORAGE] ✅ Book created successfully");
      return result[0];
    } catch (error) {
      console.error("[LIBRARY_STORAGE] Error creating book:", error);
      throw error;
    }
  }
  
  async updateBook(id: number, updates: any): Promise<LibraryBook> {
    try {
      const updateData = { ...updates };
      updateData.updatedAt = new Date();
      
      const result = await db.update(libraryBooks)
        .set(updateData)
        .where(eq(libraryBooks.id, id))
        .returning();
      
      if (result.length === 0) {
        throw new Error(`Book with ID ${id} not found`);
      }
      
      console.log("[LIBRARY_STORAGE] ✅ Book updated successfully");
      return result[0];
    } catch (error) {
      console.error("[LIBRARY_STORAGE] Error updating book:", error);
      throw error;
    }
  }
  
  async deleteBook(id: number): Promise<void> {
    try {
      await db.delete(libraryBooks)
        .where(eq(libraryBooks.id, id));
      
      console.log("[LIBRARY_STORAGE] ✅ Book deleted successfully");
    } catch (error) {
      console.error("[LIBRARY_STORAGE] Error deleting book:", error);
      throw error;
    }
  }
  
  // === RECOMMENDATION MANAGEMENT ===
  
  async getRecommendations(filters?: {
    teacherId?: number;
    audienceType?: string;
    audienceIds?: number[];
    schoolId?: number;
  }): Promise<LibraryRecommendation[]> {
    try {
      let query = db.select()
        .from(libraryRecommendations);
      
      const conditions: any[] = [];
      
      if (filters?.teacherId) {
        conditions.push(eq(libraryRecommendations.teacherId, filters.teacherId));
      }
      
      if (filters?.audienceType) {
        conditions.push(eq(libraryRecommendations.audienceType, filters.audienceType));
      }
      
      if (filters?.audienceIds && filters.audienceIds.length > 0) {
        conditions.push(
          `EXISTS (SELECT 1 FROM jsonb_array_elements_text(audience_ids) elem 
           WHERE elem::int = ANY(ARRAY[${filters.audienceIds.join(',')}]))`
        );
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      return await query.orderBy(desc(libraryRecommendations.recommendedAt));
    } catch (error) {
      console.error("[LIBRARY_STORAGE] Error getting recommendations:", error);
      throw error;
    }
  }
  
  async getRecommendation(id: number): Promise<LibraryRecommendation | null> {
    try {
      const result = await db.select()
        .from(libraryRecommendations)
        .where(eq(libraryRecommendations.id, id))
        .limit(1);
      
      return result[0] || null;
    } catch (error) {
      console.error("[LIBRARY_STORAGE] Error getting recommendation:", error);
      throw error;
    }
  }
  
  async createRecommendation(recommendationData: InsertLibraryRecommendation): Promise<LibraryRecommendation> {
    try {
      const result = await db.insert(libraryRecommendations)
        .values(recommendationData)
        .returning();
      
      console.log("[LIBRARY_STORAGE] ✅ Recommendation created successfully");
      return result[0];
    } catch (error) {
      console.error("[LIBRARY_STORAGE] Error creating recommendation:", error);
      throw error;
    }
  }
  
  async updateRecommendation(id: number, updates: Partial<InsertLibraryRecommendation>): Promise<LibraryRecommendation> {
    try {
      const result = await db.update(libraryRecommendations)
        .set(updates)
        .where(eq(libraryRecommendations.id, id))
        .returning();
      
      if (result.length === 0) {
        throw new Error(`Recommendation with ID ${id} not found`);
      }
      
      console.log("[LIBRARY_STORAGE] ✅ Recommendation updated successfully");
      return result[0];
    } catch (error) {
      console.error("[LIBRARY_STORAGE] Error updating recommendation:", error);
      throw error;
    }
  }
  
  async deleteRecommendation(id: number): Promise<void> {
    try {
      await db.delete(libraryRecommendations)
        .where(eq(libraryRecommendations.id, id));
      
      console.log("[LIBRARY_STORAGE] ✅ Recommendation deleted successfully");
    } catch (error) {
      console.error("[LIBRARY_STORAGE] Error deleting recommendation:", error);
      throw error;
    }
  }
  
  // === COMBINED QUERIES ===
  
  async getRecommendedBooksForStudent(studentId: number, schoolId: number): Promise<any[]> {
    try {
      // Get recommendations for this specific student or their class
      const query = `
        SELECT 
          lb.*,
          lr.note,
          lr.recommended_at,
          u.name as teacher_name
        FROM library_books lb
        JOIN library_recommendations lr ON lb.id = lr.book_id
        JOIN users u ON lr.teacher_id = u.id
        WHERE (
          (lr.audience_type = 'student' AND lr.audience_ids ? $1::text) OR
          (lr.audience_type = 'class' AND lr.audience_ids ? (
            SELECT class_id::text FROM students WHERE id = $1
          ))
        )
        ORDER BY lr.recommended_at DESC
      `;
      
      const result = await db.execute({ sql: query, args: [studentId.toString()] });
      return result.rows;
    } catch (error) {
      console.error("[LIBRARY_STORAGE] Error getting student recommendations:", error);
      throw error;
    }
  }
  
  async getRecommendedBooksForParent(parentId: number, schoolId: number): Promise<any[]> {
    try {
      // Get recommendations for all children of this parent
      const query = `
        SELECT 
          lb.*,
          lr.note,
          lr.recommended_at,
          u.name as teacher_name,
          s.name as student_name
        FROM library_books lb
        JOIN library_recommendations lr ON lb.id = lr.book_id
        JOIN users u ON lr.teacher_id = u.id
        JOIN students s ON s.id = ANY(
          SELECT CAST(elem AS INTEGER) 
          FROM jsonb_array_elements_text(lr.audience_ids) AS elem
        )
        WHERE lr.audience_type = 'student' 
        AND s.id IN (
          SELECT student_id FROM parent_child_connections 
          WHERE parent_id = $1 AND verified = true
        )
        ORDER BY lr.recommended_at DESC
      `;
      
      const result = await db.execute({ sql: query, args: [parentId.toString()] });
      return result.rows;
    } catch (error) {
      console.error("[LIBRARY_STORAGE] Error getting parent recommendations:", error);
      throw error;
    }
  }
  
  async getTeacherRecommendations(teacherId: number, schoolId: number): Promise<any[]> {
    try {
      const query = `
        SELECT 
          lb.*,
          lr.*,
          CASE 
            WHEN lr.audience_type = 'student' THEN 
              (SELECT array_agg(name) FROM users 
               WHERE id = ANY(SELECT CAST(elem AS INTEGER) FROM jsonb_array_elements_text(lr.audience_ids) AS elem))
            WHEN lr.audience_type = 'class' THEN 
              (SELECT array_agg(name) FROM classes 
               WHERE id = ANY(SELECT CAST(elem AS INTEGER) FROM jsonb_array_elements_text(lr.audience_ids) AS elem))
            WHEN lr.audience_type = 'department' THEN 
              ARRAY['Department: ' || lr.audience_ids::text]
          END as audience_names
        FROM library_books lb
        JOIN library_recommendations lr ON lb.id = lr.book_id
        WHERE lr.teacher_id = $1
        ORDER BY lr.recommended_at DESC
      `;
      
      const result = await db.execute({ sql: query, args: [teacherId.toString()] });
      return result.rows;
    } catch (error) {
      console.error("[LIBRARY_STORAGE] Error getting teacher recommendations:", error);
      throw error;
    }
  }
}
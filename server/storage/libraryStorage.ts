// ===== LIBRARY STORAGE MODULE =====
// Handles library books and recommendations storage operations

import { eq, and, inArray, desc, sql } from "drizzle-orm";
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
      // Get all recommendations and filter for this student
      const allRecommendations = await db.select()
        .from(libraryRecommendations)
        .leftJoin(libraryBooks, eq(libraryRecommendations.bookId, libraryBooks.id))
        .leftJoin(users, eq(libraryRecommendations.teacherId, users.id))
        .orderBy(desc(libraryRecommendations.recommendedAt));
      
      // Filter for this specific student
      const filtered = allRecommendations.filter(row => {
        const rec = row.library_recommendations;
        if (!rec.audienceIds || !Array.isArray(rec.audienceIds)) return false;
        
        // Check if student ID is in the audience
        if (rec.audienceType === 'student') {
          return rec.audienceIds.includes(studentId);
        }
        // For class recommendations, would need to check student's class
        // Simplified for now - can enhance later
        return false;
      });
      
      return filtered.map(row => ({
        ...row.library_books,
        note: row.library_recommendations?.note,
        recommended_at: row.library_recommendations?.recommendedAt,
        teacher_name: row.users?.name
      }));
    } catch (error) {
      console.error("[LIBRARY_STORAGE] Error getting student recommendations:", error);
      throw error;
    }
  }
  
  async getRecommendedBooksForParent(parentId: number, schoolId: number): Promise<any[]> {
    try {
      // Simplified: Get all student recommendations and filter
      const allRecommendations = await db.select()
        .from(libraryRecommendations)
        .leftJoin(libraryBooks, eq(libraryRecommendations.bookId, libraryBooks.id))
        .leftJoin(users, eq(libraryRecommendations.teacherId, users.id))
        .where(eq(libraryRecommendations.audienceType, 'student'))
        .orderBy(desc(libraryRecommendations.recommendedAt));
      
      // For parent recommendations, would need to check parent_child_connections
      // Simplified for now - returns all student recommendations
      return allRecommendations.map(row => ({
        ...row.library_books,
        note: row.library_recommendations?.note,
        recommended_at: row.library_recommendations?.recommendedAt,
        teacher_name: row.users?.name,
        student_name: 'Student' // Simplified - would need student lookup
      }));
    } catch (error) {
      console.error("[LIBRARY_STORAGE] Error getting parent recommendations:", error);
      throw error;
    }
  }
  
  async getTeacherRecommendations(teacherId: number, schoolId: number): Promise<any[]> {
    try {
      // Simplified approach: Get basic data with Drizzle, then enrich with audience names
      const baseRecommendations = await db.select()
        .from(libraryRecommendations)
        .leftJoin(libraryBooks, eq(libraryRecommendations.bookId, libraryBooks.id))
        .where(eq(libraryRecommendations.teacherId, teacherId))
        .orderBy(desc(libraryRecommendations.recommendedAt));
      
      // Format results to match expected structure
      const results = await Promise.all(baseRecommendations.map(async (row) => {
        const rec = row.library_recommendations;
        const book = row.library_books;
        
        let audienceNames: string[] = [];
        
        try {
          if (rec.audienceType === 'student' && rec.audienceIds && Array.isArray(rec.audienceIds)) {
            const studentRecords = await db.select({ name: users.name })
              .from(users)
              .where(inArray(users.id, rec.audienceIds as number[]));
            audienceNames = studentRecords.map(s => s.name);
          } else if (rec.audienceType === 'class' && rec.audienceIds && Array.isArray(rec.audienceIds)) {
            const classRecords = await db.select({ name: classes.name })
              .from(classes)
              .where(inArray(classes.id, rec.audienceIds as number[]));
            audienceNames = classRecords.map(c => c.name);
          } else if (rec.audienceType === 'department') {
            audienceNames = [`Department: ${JSON.stringify(rec.audienceIds)}`];
          }
        } catch (err) {
          console.error("[LIBRARY_STORAGE] Error fetching audience names:", err);
        }
        
        return {
          ...book,
          ...rec,
          book,
          audienceNames
        };
      }));
      
      return results;
    } catch (error) {
      console.error("[LIBRARY_STORAGE] Error getting teacher recommendations:", error);
      throw error;
    }
  }
}
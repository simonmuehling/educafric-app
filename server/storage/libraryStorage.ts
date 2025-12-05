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
import { users, classes, parentStudentRelations, enrollments } from "../../shared/schema";

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
      console.log(`[LIBRARY_STORAGE] 📚 Getting recommendations for parent ${parentId}, school ${schoolId}`);
      
      // Step 1: Find all children of this parent via parent_student_relations
      // Note: studentId in parent_student_relations refers directly to users.id of Student role
      const parentChildren = await db.select({
        studentId: parentStudentRelations.studentId,
        studentFirstName: users.firstName,
        studentLastName: users.lastName,
        relationship: parentStudentRelations.relationship
      })
        .from(parentStudentRelations)
        .leftJoin(users, eq(parentStudentRelations.studentId, users.id))
        .where(eq(parentStudentRelations.parentId, parentId));
      
      console.log(`[LIBRARY_STORAGE] Found ${parentChildren.length} children for parent ${parentId}`);
      
      if (parentChildren.length === 0) {
        console.log(`[LIBRARY_STORAGE] ⚠️ No children found for parent ${parentId}`);
        return [];
      }
      
      // Get student IDs (these are user IDs of students)
      const childStudentIds = parentChildren.map(c => c.studentId).filter(Boolean);
      
      // Step 2: Get children's class IDs for class-level recommendations
      const childEnrollments = await db.select({
        studentId: enrollments.studentId,
        classId: enrollments.classId
      })
        .from(enrollments)
        .where(inArray(enrollments.studentId, childStudentIds));
      
      const childClassIds = [...new Set(childEnrollments.map(e => e.classId).filter(Boolean))];
      
      // Step 3: Get all recommendations where children are in the audience
      // Filter by schoolId to prevent cross-school data leakage
      // Use alias to avoid column name conflicts
      const teacherUsers = users;
      const allRecommendations = await db.select({
        recommendation: libraryRecommendations,
        book: libraryBooks,
        teacher: {
          id: teacherUsers.id,
          firstName: teacherUsers.firstName,
          lastName: teacherUsers.lastName
        }
      })
        .from(libraryRecommendations)
        .leftJoin(libraryBooks, eq(libraryRecommendations.bookId, libraryBooks.id))
        .leftJoin(teacherUsers, eq(libraryRecommendations.teacherId, teacherUsers.id))
        .where(eq(libraryRecommendations.schoolId, schoolId))
        .orderBy(desc(libraryRecommendations.recommendedAt));
      
      // Step 4: Filter recommendations that match this parent's children
      const matchingRecommendations: any[] = [];
      
      for (const row of allRecommendations) {
        const rec = row.recommendation;
        const book = row.book;
        const teacher = row.teacher;
        
        if (!rec || !book) continue;
        
        const audienceIds = rec.audienceIds as number[] | null;
        if (!audienceIds || !Array.isArray(audienceIds)) continue;
        
        let matchedChild: typeof parentChildren[0] | null = null;
        let matchedClassId: number | null = null;
        
        // Check if recommendation targets one of the parent's children
        if (rec.audienceType === 'student') {
          // Check against student user IDs
          for (const child of parentChildren) {
            if (audienceIds.includes(child.studentId)) {
              matchedChild = child;
              break;
            }
          }
        } else if (rec.audienceType === 'class') {
          // Check if any of the parent's children are in the target class
          for (const classId of audienceIds) {
            if (childClassIds.includes(classId)) {
              matchedClassId = classId;
              // Find which child is in this class
              const enrollment = childEnrollments.find(e => e.classId === classId);
              if (enrollment) {
                matchedChild = parentChildren.find(c => c.studentId === enrollment.studentId) || null;
              }
              break;
            }
          }
        }
        
        if (matchedChild || matchedClassId) {
          matchingRecommendations.push({
            id: rec.id,
            bookId: rec.bookId,
            teacherId: rec.teacherId,
            audienceType: rec.audienceType,
            audienceIds: rec.audienceIds,
            note: rec.note,
            recommendedAt: rec.recommendedAt,
            book: {
              id: book.id,
              title: book.title,
              author: book.author,
              description: book.description,
              linkUrl: book.linkUrl,
              coverUrl: book.coverUrl,
              recommendedLevel: book.recommendedLevel
            },
            teacherName: teacher?.firstName ? `${teacher.firstName} ${teacher.lastName || ''}`.trim() : 'Professeur',
            childName: matchedChild 
              ? `${matchedChild.studentFirstName || ''} ${matchedChild.studentLastName || ''}`.trim() 
              : 'Votre enfant',
            childClass: matchedClassId ? `Classe ${matchedClassId}` : undefined
          });
        }
      }
      
      console.log(`[LIBRARY_STORAGE] ✅ Found ${matchingRecommendations.length} recommendations for parent's children`);
      return matchingRecommendations;
      
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
// ARCHIVE STORAGE - BULLETIN AND MASTERSHEET ARCHIVING OPERATIONS
// Handles storage, retrieval, and management of archived documents

import { db } from "../db";
import { archivedDocuments, archiveAccessLogs } from "../../shared/schema";
import type { 
  ArchivedDocument, 
  NewArchivedDocument, 
  ArchiveAccessLog, 
  NewArchiveAccessLog,
  ArchiveFilter,
  ArchiveResponse 
} from "../../shared/schemas/archiveSchema";
import { eq, and, desc, asc, like, sql, count } from "drizzle-orm";
// Note: object storage integration check - implement as needed
// import { check_object_storage_status } from "../integrations/objectStorage";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

export class ArchiveStorage {
  
  // ===== ARCHIVAL OPERATIONS =====
  
  /**
   * Save document to archive with metadata
   */
  async saveArchive(archiveData: NewArchivedDocument): Promise<ArchivedDocument> {
    try {
      console.log(`[ARCHIVE_STORAGE] 📁 Saving archive for type:${archiveData.type}, school:${archiveData.schoolId}`);
      
      const [archived] = await db.insert(archivedDocuments)
        .values({
          schoolId: archiveData.schoolId,
          type: archiveData.type,
          bulletinId: archiveData.bulletinId || null,
          classId: archiveData.classId,
          academicYear: archiveData.academicYear,
          term: archiveData.term,
          studentId: archiveData.studentId || null,
          language: archiveData.language,
          filename: archiveData.filename,
          storageKey: archiveData.storageKey,
          checksumSha256: archiveData.checksumSha256,
          sizeBytes: archiveData.sizeBytes,
          recipients: archiveData.recipients || null,
          snapshot: archiveData.snapshot || null,
          meta: archiveData.meta || null,
          version: archiveData.version || "1.0",
          sentAt: archiveData.sentAt,
          sentBy: archiveData.sentBy,
        })
        .returning();
      
      console.log(`[ARCHIVE_STORAGE] ✅ Archive saved with ID: ${archived.id}`);
      return archived;
    } catch (error) {
      console.error('[ARCHIVE_STORAGE] ❌ Error saving archive:', error);
      throw error;
    }
  }

  /**
   * List archives with filtering and pagination
   */
  async listArchives(schoolId: number, filters: ArchiveFilter): Promise<ArchiveResponse> {
    try {
      console.log(`[ARCHIVE_STORAGE] 📋 Listing archives for school:${schoolId} with filters:`, filters);
      
      // Build where conditions
      const conditions = [eq(archivedDocuments.schoolId, schoolId)];
      
      if (filters.academicYear) {
        conditions.push(eq(archivedDocuments.academicYear, filters.academicYear));
      }
      
      if (filters.classId) {
        conditions.push(eq(archivedDocuments.classId, filters.classId));
      }
      
      if (filters.term) {
        conditions.push(eq(archivedDocuments.term, filters.term));
      }
      
      if (filters.type) {
        conditions.push(eq(archivedDocuments.type, filters.type));
      }
      
      if (filters.studentId) {
        conditions.push(eq(archivedDocuments.studentId, filters.studentId));
      }
      
      if (filters.search) {
        conditions.push(like(archivedDocuments.filename, `%${filters.search}%`));
      }

      // Get total count
      const [totalResult] = await db
        .select({ count: count() })
        .from(archivedDocuments)
        .where(and(...conditions));
      
      const total = totalResult.count;
      const totalPages = Math.ceil(total / filters.limit);
      const offset = (filters.page - 1) * filters.limit;

      // Get paginated results
      const documents = await db
        .select()
        .from(archivedDocuments)
        .where(and(...conditions))
        .orderBy(desc(archivedDocuments.sentAt))
        .limit(filters.limit)
        .offset(offset);

      console.log(`[ARCHIVE_STORAGE] ✅ Retrieved ${documents.length}/${total} archives`);
      
      return {
        documents,
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages
      };
    } catch (error) {
      console.error('[ARCHIVE_STORAGE] ❌ Error listing archives:', error);
      throw error;
    }
  }

  /**
   * Get archive by ID with school verification
   */
  async getArchiveById(id: number, schoolId: number): Promise<ArchivedDocument | null> {
    try {
      const [archive] = await db
        .select()
        .from(archivedDocuments)
        .where(and(
          eq(archivedDocuments.id, id),
          eq(archivedDocuments.schoolId, schoolId)
        ))
        .limit(1);
      
      return archive || null;
    } catch (error) {
      console.error('[ARCHIVE_STORAGE] ❌ Error getting archive:', error);
      throw error;
    }
  }

  /**
   * Get presigned download URL for archived document
   */
  async getPresignedUrl(archiveId: number, schoolId: number, ttlSeconds: number = 300): Promise<string | null> {
    try {
      const archive = await this.getArchiveById(archiveId, schoolId);
      if (!archive) {
        return null;
      }

      // For now, use API download endpoint (object storage integration can be added later)
      console.log(`[ARCHIVE_STORAGE] 🔗 Generating download URL for archive: ${archive.storageKey}`);
      return `/api/archives/${archiveId}/download`;
    } catch (error) {
      console.error('[ARCHIVE_STORAGE] ❌ Error generating presigned URL:', error);
      return null;
    }
  }

  /**
   * Log archive access for audit trail
   */
  async logAccess(accessData: NewArchiveAccessLog): Promise<ArchiveAccessLog> {
    try {
      const [log] = await db.insert(archiveAccessLogs)
        .values({
          archiveId: accessData.archiveId || null,
          schoolId: accessData.schoolId,
          userId: accessData.userId,
          action: accessData.action,
          ip: accessData.ip || null,
          userAgent: accessData.userAgent || null,
        })
        .returning();
      
      console.log(`[ARCHIVE_STORAGE] 📝 Logged ${accessData.action} access for archive:${accessData.archiveId} by user:${accessData.userId}`);
      return log;
    } catch (error) {
      console.error('[ARCHIVE_STORAGE] ❌ Error logging access:', error);
      throw error;
    }
  }

  /**
   * Get access logs for an archive
   */
  async getAccessLogs(archiveId: number, schoolId: number, limit: number = 50): Promise<ArchiveAccessLog[]> {
    try {
      const logs = await db
        .select()
        .from(archiveAccessLogs)
        .where(and(
          eq(archiveAccessLogs.archiveId, archiveId),
          eq(archiveAccessLogs.schoolId, schoolId)
        ))
        .orderBy(desc(archiveAccessLogs.createdAt))
        .limit(limit);
      
      return logs;
    } catch (error) {
      console.error('[ARCHIVE_STORAGE] ❌ Error getting access logs:', error);
      throw error;
    }
  }

  // ===== FILE OPERATIONS =====
  
  /**
   * Calculate SHA-256 checksum for file integrity verification
   */
  async calculateChecksum(filePath: string): Promise<string> {
    try {
      const fileBuffer = await fs.readFile(filePath);
      const hash = crypto.createHash('sha256');
      hash.update(fileBuffer);
      return hash.digest('hex');
    } catch (error) {
      console.error('[ARCHIVE_STORAGE] ❌ Error calculating checksum:', error);
      throw error;
    }
  }

  /**
   * Generate storage key for archived document
   */
  generateStorageKey(schoolId: number, academicYear: string, classId: number, term: string, type: string, filename: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const hash = crypto.createHash('md5').update(`${schoolId}-${classId}-${term}-${filename}-${Date.now()}`).digest('hex').substring(0, 8);
    
    return `schools/${schoolId}/archives/${academicYear}/${classId}/${term}/${type}/${timestamp}-${hash}-${filename}`;
  }

  /**
   * Get file size in bytes
   */
  async getFileSize(filePath: string): Promise<number> {
    try {
      const stats = await fs.stat(filePath);
      return stats.size;
    } catch (error) {
      console.error('[ARCHIVE_STORAGE] ❌ Error getting file size:', error);
      throw error;
    }
  }

  // ===== STATISTICS =====
  
  /**
   * Get archive statistics for dashboard
   */
  async getArchiveStats(schoolId: number, academicYear?: string): Promise<{
    totalArchives: number;
    bulletinCount: number;
    transcriptCount: number;
    totalSize: number;
    byClass: Array<{ classId: number; count: number; }>;
    byTerm: Array<{ term: string; count: number; }>;
  }> {
    try {
      const conditions = [eq(archivedDocuments.schoolId, schoolId)];
      if (academicYear) {
        conditions.push(eq(archivedDocuments.academicYear, academicYear));
      }

      // Total documents
      const [totalResult] = await db
        .select({ count: count() })
        .from(archivedDocuments)
        .where(and(...conditions));

      // Bulletins count
      const [bulletinsResult] = await db
        .select({ count: count() })
        .from(archivedDocuments)
        .where(and(...conditions, eq(archivedDocuments.type, 'bulletin')));

      // Transcripts count (mastersheet or transcript type)
      const [transcriptsResult] = await db
        .select({ count: count() })
        .from(archivedDocuments)
        .where(and(...conditions, eq(archivedDocuments.type, 'transcript')));

      // Total size
      const [sizeResult] = await db
        .select({ totalSize: sql<number>`COALESCE(sum(${archivedDocuments.sizeBytes}), 0)` })
        .from(archivedDocuments)
        .where(and(...conditions));

      // By class
      const byClass = await db
        .select({
          classId: archivedDocuments.classId,
          count: count()
        })
        .from(archivedDocuments)
        .where(and(...conditions))
        .groupBy(archivedDocuments.classId);

      // By term
      const byTerm = await db
        .select({
          term: archivedDocuments.term,
          count: count()
        })
        .from(archivedDocuments)
        .where(and(...conditions))
        .groupBy(archivedDocuments.term);

      return {
        totalArchives: totalResult.count,
        bulletinCount: bulletinsResult.count,
        transcriptCount: transcriptsResult.count,
        totalSize: Number(sizeResult[0]?.totalSize) || 0,
        byClass,
        byTerm
      };
    } catch (error) {
      console.error('[ARCHIVE_STORAGE] ❌ Error getting archive stats:', error);
      throw error;
    }
  }
}
import AdmZip from 'adm-zip';
import path from 'path';
import { db } from '../db';
import { users } from '../../shared/schema';
import { eq, and, or, like, sql } from 'drizzle-orm';
import { objectStorageClient } from '../objectStorage';

interface PhotoUploadResult {
  success: boolean;
  matched: number;
  notMatched: number;
  errors: Array<{
    filename: string;
    message: string;
  }>;
  matchedStudents: Array<{
    filename: string;
    studentName: string;
    matricule: string;
    photoUrl: string;
  }>;
  unmatchedFiles: string[];
}

const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB per image

export class BulkPhotoUploadService {
  
  private getBucketName(): string {
    const publicPaths = process.env.PUBLIC_OBJECT_SEARCH_PATHS || '';
    const firstPath = publicPaths.split(',')[0].trim();
    if (!firstPath) {
      throw new Error('Object storage not configured');
    }
    const parts = firstPath.split('/').filter(p => p);
    return parts[0];
  }
  
  private getPublicPath(): string {
    const publicPaths = process.env.PUBLIC_OBJECT_SEARCH_PATHS || '';
    const firstPath = publicPaths.split(',')[0].trim();
    if (!firstPath) {
      throw new Error('Object storage not configured');
    }
    return firstPath;
  }

  async processZipUpload(
    zipBuffer: Buffer, 
    schoolId: number, 
    lang: 'fr' | 'en' = 'fr'
  ): Promise<PhotoUploadResult> {
    const result: PhotoUploadResult = {
      success: true,
      matched: 0,
      notMatched: 0,
      errors: [],
      matchedStudents: [],
      unmatchedFiles: []
    };

    try {
      const zip = new AdmZip(zipBuffer);
      const zipEntries = zip.getEntries();
      
      console.log(`[BULK_PHOTO] Processing ZIP with ${zipEntries.length} entries for school ${schoolId}`);

      const schoolStudents = await db.select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        educafricNumber: users.educafricNumber,
        profilePictureUrl: users.profilePictureUrl
      }).from(users).where(
        and(
          eq(users.schoolId, schoolId),
          eq(users.role, 'Student')
        )
      );

      console.log(`[BULK_PHOTO] Found ${schoolStudents.length} students in school ${schoolId}`);

      const studentsByMatricule = new Map<string, typeof schoolStudents[0]>();
      for (const student of schoolStudents) {
        if (student.educafricNumber) {
          const normalizedMatricule = student.educafricNumber.toLowerCase().replace(/[^a-z0-9]/g, '');
          studentsByMatricule.set(normalizedMatricule, student);
          
          const shortMatricule = student.educafricNumber.replace(/^EDU-CM-/i, '').toLowerCase().replace(/[^a-z0-9]/g, '');
          studentsByMatricule.set(shortMatricule, student);
        }
      }

      for (const entry of zipEntries) {
        if (entry.isDirectory) continue;
        
        const filename = path.basename(entry.entryName);
        const ext = path.extname(filename).toLowerCase();
        const baseName = path.basename(filename, ext);
        
        if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
          result.errors.push({
            filename,
            message: lang === 'fr' 
              ? `Format non supporté. Utilisez: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`
              : `Unsupported format. Use: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`
          });
          continue;
        }
        
        const fileData = entry.getData();
        if (fileData.length > MAX_IMAGE_SIZE) {
          result.errors.push({
            filename,
            message: lang === 'fr'
              ? `Image trop volumineuse (max 5MB)`
              : `Image too large (max 5MB)`
          });
          continue;
        }
        
        const normalizedBaseName = baseName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const student = studentsByMatricule.get(normalizedBaseName);
        
        if (!student) {
          result.unmatchedFiles.push(filename);
          result.notMatched++;
          continue;
        }
        
        try {
          const timestamp = Date.now();
          const uniqueFilename = `student-photos/${schoolId}/${student.id}-${timestamp}${ext}`;
          const bucketName = this.getBucketName();
          const bucket = objectStorageClient.bucket(bucketName);
          const file = bucket.file(`public/${uniqueFilename}`);
          
          await file.save(fileData, {
            contentType: this.getMimeType(ext),
            metadata: {
              studentId: String(student.id),
              schoolId: String(schoolId),
              originalFilename: filename
            }
          });
          
          const photoUrl = `/api/objects/public/${uniqueFilename}`;
          
          await db.execute(sql`
            UPDATE users SET profile_picture_url = ${photoUrl} WHERE id = ${student.id}
          `);
          
          result.matchedStudents.push({
            filename,
            studentName: `${student.firstName} ${student.lastName}`,
            matricule: student.educafricNumber || '',
            photoUrl
          });
          result.matched++;
          
          console.log(`[BULK_PHOTO] ✅ Uploaded photo for ${student.firstName} ${student.lastName} (${student.educafricNumber})`);
          
        } catch (uploadError: any) {
          result.errors.push({
            filename,
            message: lang === 'fr'
              ? `Erreur d'upload: ${uploadError.message}`
              : `Upload error: ${uploadError.message}`
          });
        }
      }
      
      result.success = result.errors.length === 0 && result.matched > 0;
      
      console.log(`[BULK_PHOTO] Completed: ${result.matched} matched, ${result.notMatched} not matched, ${result.errors.length} errors`);
      
    } catch (error: any) {
      console.error('[BULK_PHOTO] Error processing ZIP:', error);
      result.success = false;
      result.errors.push({
        filename: 'ZIP',
        message: lang === 'fr'
          ? `Erreur de traitement du fichier ZIP: ${error.message}`
          : `Error processing ZIP file: ${error.message}`
      });
    }
    
    return result;
  }
  
  private getMimeType(ext: string): string {
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }
}

export const bulkPhotoUploadService = new BulkPhotoUploadService();

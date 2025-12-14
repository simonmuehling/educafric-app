import AdmZip from 'adm-zip';
import path from 'path';
import { db } from '../db';
import { users } from '../../shared/schema';
import { eq, and, or, like, sql } from 'drizzle-orm';
import { objectStorageClient } from '../objectStorage';

interface MatchedUser {
  filename: string;
  userName: string;
  matricule: string;
  photoUrl: string;
}

interface PhotoUploadResult {
  success: boolean;
  matched: number;
  notMatched: number;
  errors: Array<{
    filename: string;
    message: string;
  }>;
  matchedStudents: MatchedUser[];
  matchedUsers: MatchedUser[];
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
    lang: 'fr' | 'en' = 'fr',
    userType: 'students' | 'teachers' = 'students'
  ): Promise<PhotoUploadResult> {
    const result: PhotoUploadResult = {
      success: true,
      matched: 0,
      notMatched: 0,
      errors: [],
      matchedStudents: [],
      matchedUsers: [],
      unmatchedFiles: []
    };

    const role = userType === 'teachers' ? 'Teacher' : 'Student';
    const userLabel = userType === 'teachers' ? 'teachers' : 'students';
    const photoFolder = userType === 'teachers' ? 'teacher-photos' : 'student-photos';

    try {
      const zip = new AdmZip(zipBuffer);
      const zipEntries = zip.getEntries();
      
      console.log(`[BULK_PHOTO] Processing ZIP with ${zipEntries.length} entries for school ${schoolId}, userType: ${userType}`);

      const schoolUsers = await db.select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        educafricNumber: users.educafricNumber,
        profilePictureUrl: users.profilePictureUrl
      }).from(users).where(
        and(
          eq(users.schoolId, schoolId),
          eq(users.role, role)
        )
      );

      console.log(`[BULK_PHOTO] Found ${schoolUsers.length} ${userLabel} in school ${schoolId}`);

      const usersByMatricule = new Map<string, typeof schoolUsers[0]>();
      for (const user of schoolUsers) {
        if (user.educafricNumber) {
          const normalizedMatricule = user.educafricNumber.toLowerCase().replace(/[^a-z0-9]/g, '');
          usersByMatricule.set(normalizedMatricule, user);
          
          const shortMatricule = user.educafricNumber.replace(/^EDU-CM-/i, '').toLowerCase().replace(/[^a-z0-9]/g, '');
          usersByMatricule.set(shortMatricule, user);
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
        const matchedUser = usersByMatricule.get(normalizedBaseName);
        
        if (!matchedUser) {
          result.unmatchedFiles.push(filename);
          result.notMatched++;
          continue;
        }
        
        try {
          const timestamp = Date.now();
          const uniqueFilename = `${photoFolder}/${schoolId}/${matchedUser.id}-${timestamp}${ext}`;
          const bucketName = this.getBucketName();
          const bucket = objectStorageClient.bucket(bucketName);
          const file = bucket.file(`public/${uniqueFilename}`);
          
          await file.save(fileData, {
            contentType: this.getMimeType(ext),
            metadata: {
              userId: String(matchedUser.id),
              schoolId: String(schoolId),
              userType: userType,
              originalFilename: filename
            }
          });
          
          const photoUrl = `/api/objects/public/${uniqueFilename}`;
          
          await db.execute(sql`
            UPDATE users SET profile_picture_url = ${photoUrl} WHERE id = ${matchedUser.id}
          `);
          
          const formattedName = lang === 'en' 
            ? `${matchedUser.firstName} ${matchedUser.lastName}`
            : `${(matchedUser.lastName || '').toUpperCase()} ${matchedUser.firstName}`;
          
          const matchedEntry: MatchedUser = {
            filename,
            userName: formattedName,
            matricule: matchedUser.educafricNumber || '',
            photoUrl
          };
          result.matchedStudents.push(matchedEntry);
          result.matchedUsers.push(matchedEntry);
          result.matched++;
          
          console.log(`[BULK_PHOTO] ✅ Uploaded photo for ${matchedUser.firstName} ${matchedUser.lastName} (${matchedUser.educafricNumber})`);
          
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

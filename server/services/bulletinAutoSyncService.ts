import { db } from '../db';
import { bulletinComprehensive, teacherGradeSubmissions, students, classes, subjects, users } from '../../shared/schema';
import { eq, and, sql } from 'drizzle-orm';

interface SyncResult {
  bulletinId: number;
  studentId: number;
  updated: boolean;
  gradesAdded: number;
  newAverage?: number;
}

export class BulletinAutoSyncService {
  
  static async syncApprovedGradesToBulletin(
    studentId: number,
    classId: number,
    term: 'T1' | 'T2' | 'T3',
    academicYear: string,
    schoolId: number
  ): Promise<SyncResult | null> {
    try {
      console.log('[BULLETIN_AUTO_SYNC] 🔄 Starting sync for:', { studentId, classId, term, academicYear, schoolId });

      const approvedGrades = await db.select({
        id: teacherGradeSubmissions.id,
        subjectId: teacherGradeSubmissions.subjectId,
        grade: teacherGradeSubmissions.grade,
        coefficient: teacherGradeSubmissions.coefficient,
        appreciation: teacherGradeSubmissions.teacherAppreciation,
        teacherId: teacherGradeSubmissions.teacherId,
        subjectName: subjects.nameFr,
        subjectNameEn: subjects.nameEn,
        teacherFirstName: users.firstName,
        teacherLastName: users.lastName
      })
      .from(teacherGradeSubmissions)
      .leftJoin(subjects, eq(subjects.id, teacherGradeSubmissions.subjectId))
      .leftJoin(users, eq(users.id, teacherGradeSubmissions.teacherId))
      .where(and(
        eq(teacherGradeSubmissions.studentId, studentId),
        eq(teacherGradeSubmissions.classId, classId),
        eq(teacherGradeSubmissions.term, term),
        eq(teacherGradeSubmissions.academicYear, academicYear),
        eq(teacherGradeSubmissions.reviewStatus, 'approved')
      ));

      if (approvedGrades.length === 0) {
        console.log('[BULLETIN_AUTO_SYNC] ⚠️ No approved grades found');
        return null;
      }

      console.log('[BULLETIN_AUTO_SYNC] 📊 Found', approvedGrades.length, 'approved grades');

      const [existingBulletin] = await db.select()
        .from(bulletinComprehensive)
        .where(and(
          eq(bulletinComprehensive.studentId, studentId),
          eq(bulletinComprehensive.classId, classId),
          eq(bulletinComprehensive.term, term),
          eq(bulletinComprehensive.academicYear, academicYear),
          eq(bulletinComprehensive.schoolId, schoolId)
        ))
        .limit(1);

      const subjectsData = approvedGrades.map(g => ({
        subjectId: g.subjectId,
        subjectName: g.subjectName || g.subjectNameEn || 'Unknown',
        grade: g.grade,
        coefficient: g.coefficient || 1,
        appreciation: g.appreciation || '',
        teacherName: g.teacherFirstName && g.teacherLastName 
          ? `${g.teacherFirstName} ${g.teacherLastName}` 
          : 'N/A'
      }));

      let totalWeighted = 0;
      let totalCoeff = 0;
      for (const s of subjectsData) {
        const grade = typeof s.grade === 'number' ? s.grade : parseFloat(String(s.grade)) || 0;
        const coeff = s.coefficient || 1;
        totalWeighted += grade * coeff;
        totalCoeff += coeff;
      }
      const generalAverage = totalCoeff > 0 ? Math.round((totalWeighted / totalCoeff) * 100) / 100 : 0;

      console.log('[BULLETIN_AUTO_SYNC] 📈 Calculated average:', generalAverage, 'from', subjectsData.length, 'subjects');

      if (existingBulletin) {
        console.log('[BULLETIN_AUTO_SYNC] 📝 Updating existing bulletin:', existingBulletin.id);
        
        await db.update(bulletinComprehensive)
          .set({
            subjectsData: JSON.stringify(subjectsData),
            generalAverage: generalAverage,
            totalSubjects: subjectsData.length,
            updatedAt: new Date(),
            status: existingBulletin.status === 'draft' ? 'pending_review' : existingBulletin.status
          })
          .where(eq(bulletinComprehensive.id, existingBulletin.id));

        console.log('[BULLETIN_AUTO_SYNC] ✅ Bulletin updated with', subjectsData.length, 'subjects');

        return {
          bulletinId: existingBulletin.id,
          studentId,
          updated: true,
          gradesAdded: subjectsData.length,
          newAverage: generalAverage
        };
      } else {
        console.log('[BULLETIN_AUTO_SYNC] 🆕 Creating new bulletin for student:', studentId);
        
        const [student] = await db.select({
          firstName: students.firstName,
          lastName: students.lastName
        })
        .from(students)
        .where(eq(students.id, studentId))
        .limit(1);

        const [classInfo] = await db.select({
          name: classes.name,
          level: classes.level
        })
        .from(classes)
        .where(eq(classes.id, classId))
        .limit(1);

        const [newBulletin] = await db.insert(bulletinComprehensive)
          .values({
            studentId,
            classId,
            schoolId,
            term,
            academicYear,
            studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
            className: classInfo?.name || 'Unknown',
            subjectsData: JSON.stringify(subjectsData),
            generalAverage,
            totalSubjects: subjectsData.length,
            status: 'pending_review',
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning();

        console.log('[BULLETIN_AUTO_SYNC] ✅ New bulletin created:', newBulletin.id);

        return {
          bulletinId: newBulletin.id,
          studentId,
          updated: false,
          gradesAdded: subjectsData.length,
          newAverage: generalAverage
        };
      }
    } catch (error) {
      console.error('[BULLETIN_AUTO_SYNC] ❌ Error syncing grades:', error);
      throw error;
    }
  }

  static async syncAllApprovedGradesForClass(
    classId: number,
    term: 'T1' | 'T2' | 'T3',
    academicYear: string,
    schoolId: number
  ): Promise<SyncResult[]> {
    try {
      console.log('[BULLETIN_AUTO_SYNC] 🔄 Bulk sync for class:', { classId, term, academicYear, schoolId });

      const studentsWithGrades = await db.selectDistinct({
        studentId: teacherGradeSubmissions.studentId
      })
      .from(teacherGradeSubmissions)
      .where(and(
        eq(teacherGradeSubmissions.classId, classId),
        eq(teacherGradeSubmissions.term, term),
        eq(teacherGradeSubmissions.academicYear, academicYear),
        eq(teacherGradeSubmissions.reviewStatus, 'approved')
      ));

      console.log('[BULLETIN_AUTO_SYNC] 👥 Found', studentsWithGrades.length, 'students with approved grades');

      const results: SyncResult[] = [];

      for (const { studentId } of studentsWithGrades) {
        try {
          const result = await this.syncApprovedGradesToBulletin(
            studentId,
            classId,
            term,
            academicYear,
            schoolId
          );
          if (result) {
            results.push(result);
          }
        } catch (studentError) {
          console.error('[BULLETIN_AUTO_SYNC] ❌ Error syncing student', studentId, ':', studentError);
        }
      }

      console.log('[BULLETIN_AUTO_SYNC] ✅ Bulk sync complete:', results.length, 'bulletins processed');

      return results;
    } catch (error) {
      console.error('[BULLETIN_AUTO_SYNC] ❌ Bulk sync error:', error);
      throw error;
    }
  }
}

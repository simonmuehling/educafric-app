import { db } from '../db';
import { bulletinComprehensive, teacherGradeSubmissions, classes, subjects, users } from '../../shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import { enrollments } from '../../shared/schemas/classEnrollmentSchema';

interface TeacherInfo {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
}

interface StudentInfo {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  className: string;
  classLevel?: string;
}

interface SyncResult {
  bulletinId: number;
  studentId: number;
  updated: boolean;
  gradesAdded: number;
  newAverage?: number;
  student: StudentInfo;
  teachers: TeacherInfo[];
  term: string;
  academicYear: string;
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
        termAverage: teacherGradeSubmissions.termAverage,
        coefficient: teacherGradeSubmissions.coefficient,
        appreciation: teacherGradeSubmissions.subjectComments,
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

      // Get student info
      const [studentData] = await db.select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName
      })
      .from(users)
      .where(eq(users.id, studentId))
      .limit(1);

      // Get class info
      const [classInfo] = await db.select({
        name: classes.name,
        level: classes.level
      })
      .from(classes)
      .where(eq(classes.id, classId))
      .limit(1);

      // Extract unique teachers from grades
      const teacherMap = new Map<number, TeacherInfo>();
      for (const g of approvedGrades) {
        if (g.teacherId && g.teacherFirstName && g.teacherLastName && !teacherMap.has(g.teacherId)) {
          teacherMap.set(g.teacherId, {
            id: g.teacherId,
            firstName: g.teacherFirstName,
            lastName: g.teacherLastName,
            fullName: `${g.teacherFirstName} ${g.teacherLastName}`
          });
        }
      }
      const teachers = Array.from(teacherMap.values());

      const studentInfo: StudentInfo = {
        id: studentId,
        firstName: studentData?.firstName || 'Unknown',
        lastName: studentData?.lastName || 'Unknown',
        fullName: studentData ? `${studentData.firstName} ${studentData.lastName}` : 'Unknown',
        className: classInfo?.name || 'Unknown',
        classLevel: classInfo?.level || undefined
      };

      console.log('[BULLETIN_AUTO_SYNC] 👤 Student:', studentInfo.fullName, '| 👨‍🏫 Teachers:', teachers.length);

      const [existingBulletin] = await db.select({
        id: bulletinComprehensive.id,
        status: bulletinComprehensive.status,
        generalAverage: bulletinComprehensive.generalAverage
      })
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
        grade: g.termAverage ? parseFloat(String(g.termAverage)) : 0,
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
        
        // Use raw SQL to avoid TypeScript issues with column names
        const newStatus = existingBulletin.status === 'draft' ? 'pending_review' : existingBulletin.status;
        await db.execute(sql`
          UPDATE bulletin_comprehensive 
          SET general_average = ${generalAverage}, 
              number_of_averages = ${subjectsData.length}, 
              updated_at = NOW(),
              status = ${newStatus}
          WHERE id = ${existingBulletin.id}
        `);

        console.log('[BULLETIN_AUTO_SYNC] ✅ Bulletin updated with', subjectsData.length, 'subjects');

        return {
          bulletinId: existingBulletin.id,
          studentId,
          updated: true,
          gradesAdded: subjectsData.length,
          newAverage: generalAverage,
          student: studentInfo,
          teachers,
          term,
          academicYear
        };
      } else {
        console.log('[BULLETIN_AUTO_SYNC] 🆕 Creating new bulletin for student:', studentId);

        const insertResult = await db.execute(sql`
          INSERT INTO bulletin_comprehensive 
          (student_id, class_id, school_id, term, academic_year, general_average, number_of_averages, status, data_source, created_at, updated_at)
          VALUES (${studentId}, ${classId}, ${schoolId}, ${term}, ${academicYear}, ${generalAverage}, ${subjectsData.length}, 'pending_review', 'generated', NOW(), NOW())
          RETURNING id
        `);
        const newBulletinId = insertResult.rows?.[0]?.id || insertResult[0]?.id;

        console.log('[BULLETIN_AUTO_SYNC] ✅ New bulletin created:', newBulletinId);

        return {
          bulletinId: newBulletinId,
          studentId,
          updated: false,
          gradesAdded: subjectsData.length,
          newAverage: generalAverage,
          student: studentInfo,
          teachers,
          term,
          academicYear
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

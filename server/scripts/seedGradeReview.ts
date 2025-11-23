import { db } from '../db';
import { 
  users, 
  classes
} from '../../shared/schema';
import { teacherClassSubjects } from '../../shared/schemas/classSubjectsSchema';
import { 
  teacherGradeSubmissions,
  gradeReviewHistory
} from '../../shared/schemas/bulletinSchema';
import { sql, eq, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

/**
 * Seed script for generating realistic Teacher Grade Review test data
 * 
 * Generates:
 * - 10 teachers (each teaching 2-3 subjects to different classes)
 * - 50 students across 5 classes
 * - 50+ grade submissions with varied statuses (pending, approved, returned)
 * - 30+ review history entries
 * 
 * Usage: tsx server/scripts/seedGradeReview.ts
 */

interface TeacherData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface StudentData {
  id: number;
  firstName: string;
  lastName: string;
  classId: number;
}

interface ClassData {
  id: number;
  name: string;
}

const SCHOOL_ID = 1; // Sandbox school
const CURRENT_YEAR = '2024-2025';
const PASSWORD_HASH = bcrypt.hashSync('password123', 10);

const TEACHER_NAMES = [
  { firstName: 'Jean', lastName: 'Mballa' },
  { firstName: 'Marie', lastName: 'Nguessong' },
  { firstName: 'Paul', lastName: 'Kamga' },
  { firstName: 'Sophie', lastName: 'Nkotto' },
  { firstName: 'André', lastName: 'Fouda' },
  { firstName: 'Claire', lastName: 'Biya' },
  { firstName: 'David', lastName: 'Tchouta' },
  { firstName: 'Emma', lastName: 'Mbassi' },
  { firstName: 'François', lastName: 'Njoya' },
  { firstName: 'Grace', lastName: 'Ateba' }
];

const STUDENT_NAMES = [
  { firstName: 'Alain', lastName: 'Kouam' },
  { firstName: 'Bernadette', lastName: 'Essomba' },
  { firstName: 'Christian', lastName: 'Manga' },
  { firstName: 'Delphine', lastName: 'Ngo' },
  { firstName: 'Eric', lastName: 'Simo' },
  { firstName: 'Fabienne', lastName: 'Onana' },
  { firstName: 'Gaston', lastName: 'Talla' },
  { firstName: 'Hélène', lastName: 'Bilong' },
  { firstName: 'Isaac', lastName: 'Djomo' },
  { firstName: 'Joséphine', lastName: 'Ekotto' }
];

const SUBJECTS = [
  'Mathématiques',
  'Français',
  'Anglais',
  'Sciences Physiques',
  'Sciences de la Vie et de la Terre',
  'Histoire-Géographie',
  'Informatique',
  'Éducation Physique et Sportive'
];

const CLASSES_DATA = [
  { name: '6ème A', level: '6ème' },
  { name: '5ème B', level: '5ème' },
  { name: '4ème C', level: '4ème' },
  { name: '3ème A', level: '3ème' },
  { name: '2nde D', level: '2nde' }
];

const COMMENTS = [
  'Excellent travail, continue ainsi!',
  'Bon effort, mais peut mieux faire.',
  'Résultats satisfaisants dans l\'ensemble.',
  'Attention aux fautes d\'orthographe.',
  'Très bonne maîtrise du sujet.',
  'Participation active en classe.',
  'Doit redoubler d\'efforts.',
  'Progrès remarquables ce trimestre.',
  'Manque de sérieux dans le travail.',
  'Excellente progression!'
];

const FEEDBACK_POSITIVE = [
  'Notes bien justifiées, merci!',
  'Évaluation juste et équitable.',
  'Bonne cohérence dans les notes.',
  'Approbation avec félicitations.',
  'Notes conformes aux attentes.'
];

const FEEDBACK_NEGATIVE = [
  'Veuillez vérifier les calculs de moyenne.',
  'Certaines notes semblent surévaluées.',
  'Merci de revoir l\'évaluation de cet élève.',
  'Écarts importants avec les moyennes de classe.',
  'Notes non conformes aux critères de notation.'
];

const RETURN_REASONS = [
  'Erreur dans le calcul de la moyenne générale.',
  'Notes trop élevées par rapport aux résultats des examens.',
  'Manque de justification pour certaines notes.',
  'Incohérence entre les notes d\'évaluation continue et d\'examen.',
  'Commentaires insuffisamment détaillés.'
];

async function main() {
  console.log('🚀 Starting Grade Review seed script...\n');

  try {
    // Step 1: Get existing school classes
    console.log('📚 Step 1: Fetching existing school classes...');
    const createdClasses: ClassData[] = await db
      .select()
      .from(classes)
      .where(and(
        eq(classes.schoolId, SCHOOL_ID),
        eq(classes.isActive, true)
      ))
      .limit(10);
    
    if (createdClasses.length === 0) {
      throw new Error(`No active classes found for school ID ${SCHOOL_ID}. Please create classes first via the Director dashboard.`);
    }
    
    console.log(`✅ Found ${createdClasses.length} existing classes\n`);

    // Step 2: Create teachers
    console.log('👨‍🏫 Step 2: Creating teachers...');
    const teacherIds: TeacherData[] = [];
    
    for (const teacher of TEACHER_NAMES) {
      const email = `${teacher.firstName.toLowerCase()}.${teacher.lastName.toLowerCase()}@test.educafric.com`;
      
      const [existingTeacher] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingTeacher) {
        teacherIds.push({
          id: existingTeacher.id,
          firstName: existingTeacher.firstName,
          lastName: existingTeacher.lastName,
          email: existingTeacher.email
        });
        console.log(`  ✓ Found existing teacher: ${teacher.firstName} ${teacher.lastName}`);
      } else {
        const [newTeacher] = await db
          .insert(users)
          .values({
            role: 'teacher',
            firstName: teacher.firstName,
            lastName: teacher.lastName,
            email,
            phone: `+237${Math.floor(600000000 + Math.random() * 99999999)}`,
            password: PASSWORD_HASH,
            schoolId: SCHOOL_ID,
            activeRole: 'teacher',
            secondaryRoles: []
          })
          .returning();
        
        teacherIds.push({
          id: newTeacher.id,
          firstName: newTeacher.firstName,
          lastName: newTeacher.lastName,
          email: newTeacher.email
        });
        console.log(`  ✓ Created teacher: ${teacher.firstName} ${teacher.lastName}`);
      }
    }
    console.log(`✅ ${teacherIds.length} teachers ready\n`);

    // Step 3: Assign teachers to classes and subjects
    console.log('📖 Step 3: Assigning teachers to classes and subjects...');
    let assignmentCount = 0;
    
    for (const teacher of teacherIds) {
      // Each teacher teaches 2-3 subjects to random classes
      const numSubjects = Math.floor(Math.random() * 2) + 2; // 2-3 subjects
      const teacherSubjects = SUBJECTS.sort(() => 0.5 - Math.random()).slice(0, numSubjects);
      
      for (const subject of teacherSubjects) {
        // Assign to 1-2 classes
        const numClasses = Math.floor(Math.random() * 2) + 1; // 1-2 classes
        const assignedClasses = createdClasses.sort(() => 0.5 - Math.random()).slice(0, numClasses);
        
        for (const classData of assignedClasses) {
          const [existing] = await db
            .select()
            .from(teacherClassSubjects)
            .where(and(
              eq(teacherClassSubjects.teacherId, teacher.id),
              eq(teacherClassSubjects.classId, classData.id),
              eq(teacherClassSubjects.subjectName, subject)
            ))
            .limit(1);

          if (!existing) {
            await db.insert(teacherClassSubjects).values({
              teacherId: teacher.id,
              classId: classData.id,
              schoolId: SCHOOL_ID,
              subjectName: subject,
              academicYear: CURRENT_YEAR
            });
            
            assignmentCount++;
            console.log(`  ✓ ${teacher.firstName} ${teacher.lastName} → ${subject} → ${classData.name}`);
          }
        }
      }
    }
    console.log(`✅ ${assignmentCount} teacher-subject-class assignments created\n`);

    // Step 4: Create students
    console.log('👨‍🎓 Step 4: Creating students...');
    const studentIds: StudentData[] = [];
    
    for (let i = 0; i < 50; i++) {
      const studentName = STUDENT_NAMES[i % STUDENT_NAMES.length];
      const classData = createdClasses[i % createdClasses.length];
      const email = `${studentName.firstName.toLowerCase()}.${studentName.lastName.toLowerCase()}${i}@test.educafric.com`;
      
      const [existingStudent] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      let userId: number;
      if (existingStudent) {
        userId = existingStudent.id;
        console.log(`  ✓ Found existing student: ${studentName.firstName} ${studentName.lastName} ${i}`);
      } else {
        const [newUser] = await db
          .insert(users)
          .values({
            role: 'student',
            firstName: studentName.firstName,
            lastName: studentName.lastName,
            email,
            phone: `+237${Math.floor(600000000 + Math.random() * 99999999)}`,
            password: PASSWORD_HASH,
            schoolId: SCHOOL_ID,
            activeRole: 'student',
            secondaryRoles: [],
            dateOfBirth: `${2005 + Math.floor(Math.random() * 5)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
            gender: Math.random() > 0.5 ? 'M' : 'F'
          })
          .returning();
        
        userId = newUser.id;
        console.log(`  ✓ Created student: ${studentName.firstName} ${studentName.lastName} ${i}`);
      }

      studentIds.push({
        id: userId, // Use userId directly as studentId
        firstName: studentName.firstName,
        lastName: studentName.lastName,
        classId: classData.id
      });
    }
    console.log(`✅ ${studentIds.length} students ready\n`);

    // Step 5: Create grade submissions
    console.log('📊 Step 5: Creating grade submissions...');
    let submissionCount = 0;
    const submissionIds: number[] = [];
    
    // Get all teacher assignments
    const assignments = await db
      .select()
      .from(teacherClassSubjects)
      .where(eq(teacherClassSubjects.schoolId, SCHOOL_ID));

    for (const assignment of assignments) {
      // Get students in this class
      const classStudents = studentIds.filter(s => s.classId === assignment.classId);
      
      // Create 2-4 submissions per assignment (random students)
      const numSubmissions = Math.min(Math.floor(Math.random() * 3) + 2, classStudents.length);
      const selectedStudents = classStudents.sort(() => 0.5 - Math.random()).slice(0, numSubmissions);
      
      for (const student of selectedStudents) {
        const status = ['pending', 'approved', 'returned'][Math.floor(Math.random() * 3)] as 'pending' | 'approved' | 'returned';
        const grade = Math.floor(Math.random() * 15) + 5; // 5-20
        
        const [submission] = await db
          .insert(teacherGradeSubmissions)
          .values({
            teacherId: assignment.teacherId,
            studentId: student.id,
            schoolId: SCHOOL_ID,
            classId: assignment.classId,
            subjectName: assignment.subjectName,
            term: ['T1', 'T2', 'T3'][Math.floor(Math.random() * 3)],
            academicYear: CURRENT_YEAR,
            termAverage: grade,
            subjectComments: COMMENTS[Math.floor(Math.random() * COMMENTS.length)],
            status,
            submittedAt: new Date()
          })
          .returning();
        
        submissionIds.push(submission.id);
        submissionCount++;
      }
    }
    console.log(`✅ ${submissionCount} grade submissions created\n`);

    // Step 6: Create review history
    console.log('📝 Step 6: Creating review history entries...');
    let historyCount = 0;
    
    // Get director user
    const [director] = await db
      .select()
      .from(users)
      .where(and(
        eq(users.schoolId, SCHOOL_ID),
        eq(users.role, 'director')
      ))
      .limit(1);

    if (!director) {
      console.log('⚠️ No director found for school, skipping history creation');
    } else {
      // Create history for approved and returned submissions (30-40% of submissions)
      const reviewedSubmissions = submissionIds.sort(() => 0.5 - Math.random()).slice(0, Math.floor(submissionIds.length * 0.35));
      
      for (const submissionId of reviewedSubmissions) {
        const [submission] = await db
          .select()
          .from(teacherGradeSubmissions)
          .where(eq(teacherGradeSubmissions.id, submissionId))
          .limit(1);

        if (!submission || submission.status === 'pending') continue;

        const isApproved = submission.status === 'approved';
        
        await db.insert(gradeReviewHistory).values({
          submissionId,
          reviewerId: director.id,
          action: isApproved ? 'approved' : 'returned',
          feedback: isApproved 
            ? FEEDBACK_POSITIVE[Math.floor(Math.random() * FEEDBACK_POSITIVE.length)]
            : FEEDBACK_NEGATIVE[Math.floor(Math.random() * FEEDBACK_NEGATIVE.length)],
          returnReason: !isApproved 
            ? RETURN_REASONS[Math.floor(Math.random() * RETURN_REASONS.length)]
            : null,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) // Random date in last 30 days
        });
        
        historyCount++;
      }
      console.log(`✅ ${historyCount} review history entries created\n`);
    }

    console.log('🎉 Grade Review seed script completed successfully!\n');
    console.log('Summary:');
    console.log(`  - ${createdClasses.length} classes`);
    console.log(`  - ${teacherIds.length} teachers`);
    console.log(`  - ${assignmentCount} teacher-subject-class assignments`);
    console.log(`  - ${studentIds.length} students`);
    console.log(`  - ${submissionCount} grade submissions`);
    console.log(`  - ${historyCount} review history entries`);

  } catch (error) {
    console.error('❌ Error during seed:', error);
    throw error;
  }
}

main()
  .then(() => {
    console.log('\n✅ Seed completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  });

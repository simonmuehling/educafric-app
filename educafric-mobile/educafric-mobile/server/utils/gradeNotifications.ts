// ===== GRADE NOTIFICATION UTILITIES =====
// Real PWA notifications for grade entry/updates

export interface GradeNotificationData {
  studentName: string;
  subjectName: string;
  score: number | string;
  teacherName: string;
  className?: string;
  maxScore?: number;
  gradeType?: string; // exam, homework, assignment, etc.
}

/**
 * Generate bilingual notification messages for grade notifications
 */
export function generateGradeNotificationMessages(data: GradeNotificationData, language: 'fr' | 'en' = 'fr') {
  const { studentName, subjectName, score, teacherName, className, gradeType } = data;
  
  if (language === 'en') {
    return {
      studentTitle: `📊 New Grade in ${subjectName}`,
      studentMessage: `You received ${score}/20 in ${subjectName}${gradeType ? ` (${gradeType})` : ''} from ${teacherName}${className ? ` - ${className}` : ''}`,
      
      parentTitle: `📊 New Grade for ${studentName}`,
      parentMessage: `${studentName} received ${score}/20 in ${subjectName}${gradeType ? ` (${gradeType})` : ''} from ${teacherName}${className ? ` - ${className}` : ''}`
    };
  }
  
  // French (default)
  return {
    studentTitle: `📊 Nouvelle note en ${subjectName}`,
    studentMessage: `Vous avez obtenu ${score}/20 en ${subjectName}${gradeType ? ` (${gradeType})` : ''} par ${teacherName}${className ? ` - ${className}` : ''}`,
    
    parentTitle: `📊 Nouvelle note pour ${studentName}`,
    parentMessage: `${studentName} a obtenu ${score}/20 en ${subjectName}${gradeType ? ` (${gradeType})` : ''} par ${teacherName}${className ? ` - ${className}` : ''}`
  };
}

/**
 * Generate grade update notification messages
 */
export function generateGradeUpdateMessages(data: GradeNotificationData & { oldScore: number | string }, language: 'fr' | 'en' = 'fr') {
  const { studentName, subjectName, score, oldScore, teacherName, className, gradeType } = data;
  
  if (language === 'en') {
    return {
      studentTitle: `📝 Grade Updated in ${subjectName}`,
      studentMessage: `Your grade has been updated from ${oldScore}/20 to ${score}/20 in ${subjectName}${gradeType ? ` (${gradeType})` : ''} by ${teacherName}${className ? ` - ${className}` : ''}`,
      
      parentTitle: `📝 Grade Updated for ${studentName}`,
      parentMessage: `${studentName}'s grade has been updated from ${oldScore}/20 to ${score}/20 in ${subjectName}${gradeType ? ` (${gradeType})` : ''} by ${teacherName}${className ? ` - ${className}` : ''}`
    };
  }
  
  // French (default)  
  return {
    studentTitle: `📝 Note modifiée en ${subjectName}`,
    studentMessage: `Votre note a été modifiée de ${oldScore}/20 à ${score}/20 en ${subjectName}${gradeType ? ` (${gradeType})` : ''} par ${teacherName}${className ? ` - ${className}` : ''}`,
    
    parentTitle: `📝 Note modifiée pour ${studentName}`,
    parentMessage: `La note de ${studentName} a été modifiée de ${oldScore}/20 à ${score}/20 en ${subjectName}${gradeType ? ` (${gradeType})` : ''} par ${teacherName}${className ? ` - ${className}` : ''}`
  };
}

/**
 * Determine notification priority based on grade score
 */
export function getGradePriority(score: number | string): 'low' | 'normal' | 'high' {
  const numericScore = typeof score === 'string' ? parseFloat(score) : score;
  
  if (numericScore >= 16) return 'high'; // Excellent grade - high priority
  if (numericScore < 10) return 'high'; // Failing grade - high priority  
  return 'normal'; // Regular grade
}

/**
 * Generate notification metadata for grade notifications
 */
export function generateGradeNotificationMetadata(gradeData: any, isUpdate: boolean = false) {
  return {
    gradeId: gradeData.id,
    studentId: gradeData.studentId,
    subjectId: gradeData.subjectId,
    teacherId: gradeData.teacherId,
    score: gradeData.score,
    maxScore: gradeData.maxScore || 20,
    gradeType: gradeData.gradeType || 'evaluation',
    isUpdate,
    actionUrl: `/grades/view/${gradeData.id}`,
    actionText: 'Voir la note',
    timestamp: new Date().toISOString()
  };
}
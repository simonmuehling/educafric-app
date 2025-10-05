/**
 * Service Anti-Duplication pour Educafric
 * Gère la prévention des duplications à tous les niveaux
 */
import { withLock } from '../middleware/idempotency';
import { storage } from '../storage';

export class AntiDuplicationService {
  private static instance: AntiDuplicationService;
  
  public static getInstance(): AntiDuplicationService {
    if (!AntiDuplicationService.instance) {
      AntiDuplicationService.instance = new AntiDuplicationService();
    }
    return AntiDuplicationService.instance;
  }
  
  /**
   * Enregistrement sécurisé des présences avec verrou par classe/date
   */
  async recordAttendanceSafe(
    teacherId: number,
    classId: number,
    date: string,
    attendanceData: Array<{ studentId: number; present: boolean; note?: string }>
  ) {
    const lockKey = `attendance:${classId}:${date}`;
    
    return await withLock(lockKey, 30000, async () => {
      console.log(`[ATTENDANCE_LOCK] Processing attendance for class ${classId} on ${date}`);
      
      // Vérifier si les présences existent déjà pour cette classe/date
      const existing = await storage.getAttendanceByClassAndDate(classId, date);
      
      if (existing && existing.length > 0) {
        console.log(`[ATTENDANCE_DEDUP] Attendance already exists, updating...`);
        
        // Mettre à jour les présences existantes
        return await storage.updateAttendance(classId, date, attendanceData);
      } else {
        console.log(`[ATTENDANCE_DEDUP] Creating new attendance record`);
        
        // Créer nouvelles présences
        return await storage.createAttendance(teacherId, classId, date, attendanceData);
      }
    });
  }
  
  /**
   * Enregistrement sécurisé des notes avec protection anti-duplication
   */
  async recordGradesSafe(
    teacherId: number,
    studentId: number,
    subject: string,
    grade: number,
    term: string
  ) {
    const lockKey = `grades:${studentId}:${subject}:${term}`;
    
    return await withLock(lockKey, 15000, async () => {
      console.log(`[GRADES_LOCK] Processing grade for student ${studentId} in ${subject}`);
      
      // Utiliser UPSERT pour éviter les doublons
      return await storage.upsertGrade({
        teacherId,
        studentId,
        subject,
        grade,
        term,
        recordedAt: new Date()
      });
    });
  }
  
  /**
   * Inscription sécurisée d'élève avec vérification d'unicité
   */
  async enrollStudentSafe(
    studentData: {
      email: string;
      firstName: string;
      lastName: string;
      schoolId: number;
      classId: number;
    }
  ) {
    const lockKey = `enrollment:${studentData.email}:${studentData.schoolId}`;
    
    return await withLock(lockKey, 20000, async () => {
      console.log(`[ENROLLMENT_LOCK] Processing enrollment for ${studentData.email}`);
      
      // Vérifier si l'élève existe déjà dans cette école
      const existing = await storage.getStudentByEmailAndSchool(
        studentData.email, 
        studentData.schoolId
      );
      
      if (existing) {
        console.log(`[ENROLLMENT_DEDUP] Student already enrolled, updating class assignment`);
        
        // Mettre à jour l'affectation de classe
        return await storage.updateStudentClass(existing.id, studentData.classId);
      } else {
        console.log(`[ENROLLMENT_DEDUP] Creating new student enrollment`);
        
        // Créer nouvel élève
        return await storage.createStudent(studentData);
      }
    });
  }
  
  /**
   * Création sécurisée de classe avec vérification d'unicité nom/école
   */
  async createClassSafe(classData: {
    name: string;
    level: string;
    schoolId: number;
    teacherId?: number;
  }) {
    const lockKey = `class:${classData.schoolId}:${classData.name}:${classData.level}`;
    
    return await withLock(lockKey, 10000, async () => {
      console.log(`[CLASS_LOCK] Processing class creation: ${classData.name}`);
      
      // Utiliser la méthode UPSERT du storage
      return await storage.upsertClass(classData);
    });
  }
  
  /**
   * Enregistrement sécurisé de paiement avec vérification de transaction
   */
  async recordPaymentSafe(paymentData: {
    userId: number;
    amount: number;
    currency: string;
    transactionId: string;
    paymentMethod: string;
  }) {
    const lockKey = `payment:${paymentData.transactionId}`;
    
    return await withLock(lockKey, 60000, async () => {
      console.log(`[PAYMENT_LOCK] Processing payment: ${paymentData.transactionId}`);
      
      // Vérifier si la transaction existe déjà
      const existing = await storage.getPaymentByTransactionId(paymentData.transactionId);
      
      if (existing) {
        console.log(`[PAYMENT_DEDUP] Payment already processed, returning existing`);
        return existing;
      } else {
        console.log(`[PAYMENT_DEDUP] Creating new payment record`);
        return await storage.createPayment(paymentData);
      }
    });
  }
  
  /**
   * Envoi sécurisé de notification avec throttling
   */
  async sendNotificationSafe(
    userId: number,
    type: string,
    content: string,
    throttleMinutes = 5
  ) {
    const throttleKey = `notification:${userId}:${type}`;
    
    // Vérifier le throttling via le cache du middleware
    const lastSent = await this.getThrottleStatus(throttleKey);
    
    if (lastSent) {
      const timeDiff = Date.now() - lastSent;
      if (timeDiff < throttleMinutes * 60 * 1000) {
        console.log(`[NOTIFICATION_THROTTLE] Notification throttled for user ${userId}`);
        return { throttled: true, message: 'Notification throttled' };
      }
    }
    
    // Envoyer la notification
    const result = await storage.createNotification(userId, type, content);
    
    // Marquer le timestamp de throttling
    await this.setThrottleStatus(throttleKey, Date.now(), throttleMinutes * 60);
    
    return result;
  }
  
  /**
   * Utilitaires pour le throttling des notifications
   */
  private throttleCache = new Map<string, number>();
  
  private async getThrottleStatus(key: string): Promise<number | null> {
    return this.throttleCache.get(key) || null;
  }
  
  private async setThrottleStatus(key: string, timestamp: number, ttlSeconds: number): Promise<void> {
    this.throttleCache.set(key, timestamp);
    
    // Auto-nettoyage après TTL
    setTimeout(() => {
      this.throttleCache.delete(key);
    }, ttlSeconds * 1000);
  }
  
  /**
   * Nettoyage périodique des caches de throttling
   */
  startCleanupScheduler() {
    setInterval(() => {
      const now = Date.now();
      const maxAge = 60 * 60 * 1000; // 1 heure
      
      for (const [key, timestamp] of Array.from(this.throttleCache.entries())) {
        if (now - timestamp > maxAge) {
          this.throttleCache.delete(key);
        }
      }
      
      console.log(`[ANTI_DEDUP_CLEANUP] Cleaned throttle cache, ${this.throttleCache.size} entries remaining`);
    }, 15 * 60 * 1000); // Nettoyage toutes les 15 minutes
  }
}

// Instance singleton
export const antiDuplicationService = AntiDuplicationService.getInstance();

// Démarrer le nettoyage automatique
antiDuplicationService.startCleanupScheduler();
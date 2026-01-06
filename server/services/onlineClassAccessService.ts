import { db } from "../db";
import { timetables, users, schools } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { onlineClassActivationService } from "./onlineClassActivationService";
import { SubscriptionService } from "./subscriptionService";

interface AccessCheckResult {
  allowed: boolean;
  reason: string;
  activationType?: "school" | "teacher" | null;
  message?: string;
  timeWindow?: {
    start: Date;
    end: Date;
  };
  nextAvailableAt?: Date;
  canStartSession?: boolean; // For school access - can they start sessions now?
  canCreateCourses?: boolean; // Can teacher create new courses?
  timeRestriction?: {
    reason: string;
    nextAvailableAt?: Date;
  } | null;
  subscriptionDetails?: {
    startDate: string;
    endDate: string;
    durationDays: number;
    daysRemaining: number;
    durationType: string;
    isExpiringSoon: boolean;
  };
}

export class OnlineClassAccessService {
  
  /**
   * Vérifier si un utilisateur est exempt des restrictions premium
   * (comptes sandbox et @test.educafric.com)
   * 
   * ATTENTION: La logique est STRICTE pour éviter de marquer des vrais utilisateurs
   * comme exempts. Un email comme "testsimon@yahoo.com" n'est PAS exempt.
   */
  private isSandboxOrTestUser(userEmail: string): boolean {
    if (!userEmail) return false;
    
    const email = userEmail.toLowerCase();
    
    // Vérifier les domaines exemptés EDUCAFRIC (suffixes)
    // Seuls les domaines Educafric internes sont exemptés
    const exemptDomains = [
      '@educafric.demo',
      '@educafric.test', 
      '@test.educafric.com',
      '@demo.educafric.com'
    ];
    
    if (exemptDomains.some(domain => email.endsWith(domain))) {
      console.log(`[SANDBOX_CHECK] ✅ ${email} exempt via domain pattern`);
      return true;
    }
    
    // Vérifier des emails exacts pour les comptes de test internes
    // NE PAS utiliser de préfixes génériques comme "test" qui pourraient
    // correspondre à de vrais utilisateurs (ex: testsimon@yahoo.com)
    const exactExemptEmails = [
      'sandbox@educafric.com',
      'demo@educafric.com',
      'test@educafric.com'
    ];
    
    if (exactExemptEmails.includes(email)) {
      console.log(`[SANDBOX_CHECK] ✅ ${email} exempt via exact match`);
      return true;
    }
    
    // Pour les préfixes, EXIGER que le domaine soit aussi @educafric.* 
    // Cela évite d'exempter des emails réels comme testsimon@yahoo.com
    const isEducafricDomain = email.includes('@educafric');
    if (isEducafricDomain) {
      const localPart = email.split('@')[0];
      const exemptPrefixes = ['sandbox', 'demo', 'test'];
      
      if (exemptPrefixes.some(prefix => localPart.startsWith(prefix))) {
        console.log(`[SANDBOX_CHECK] ✅ ${email} exempt via Educafric prefix pattern`);
        return true;
      }
    }
    
    console.log(`[SANDBOX_CHECK] ❌ ${email} is NOT a sandbox/test account`);
    return false;
  }
  
  /**
   * Parse time string (HH:MM) to Date object for today
   */
  private parseTimeToDate(timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  /**
   * Get day of week in French format compatible with timetable
   */
  private getDayOfWeek(date: Date): number {
    // JavaScript: 0=Sunday, 1=Monday, etc.
    // Our timetable: 1=Monday, 2=Tuesday, etc.
    const jsDay = date.getDay();
    return jsDay === 0 ? 7 : jsDay; // Convert Sunday from 0 to 7
  }

  /**
   * Get human-readable duration label based on days
   */
  private getDurationLabel(durationDays: number): string {
    if (durationDays <= 1) return '1 jour';
    if (durationDays <= 7) return '1 semaine';
    if (durationDays <= 31) return '1 mois';
    if (durationDays <= 93) return '3 mois';
    if (durationDays <= 186) return '6 mois';
    return '1 an';
  }

  /**
   * Check if school can use online class based on timetable restrictions
   * Schools can use 2h BEFORE first class and 2h AFTER last class
   */
  private async checkSchoolTimeWindow(
    schoolId: number,
    currentTime: Date
  ): Promise<AccessCheckResult> {
    const dayOfWeek = this.getDayOfWeek(currentTime);
    
    // Get today's timetable for the school
    const todayClasses = await db
      .select()
      .from(timetables)
      .where(
        and(
          eq(timetables.schoolId, schoolId),
          eq(timetables.dayOfWeek, dayOfWeek),
          eq(timetables.isActive, true)
        )
      )
      .orderBy(timetables.startTime);

    // No classes scheduled today = unlimited access
    if (todayClasses.length === 0) {
      return {
        allowed: true,
        reason: "no_classes_scheduled",
        message: "Aucun cours programmé aujourd'hui - accès illimité"
      };
    }

    // Get first and last class times
    const firstClassTime = todayClasses[0].startTime;
    const lastClassTime = todayClasses[todayClasses.length - 1].endTime;

    // Parse times to Date objects
    const firstClassStart = this.parseTimeToDate(firstClassTime);
    const lastClassEnd = this.parseTimeToDate(lastClassTime);

    // Calculate allowed windows (2h before first class, 2h after last class)
    const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
    const morningWindowStart = new Date(firstClassStart.getTime() - TWO_HOURS_MS);
    const morningWindowEnd = firstClassStart;
    const eveningWindowStart = lastClassEnd;
    const eveningWindowEnd = new Date(lastClassEnd.getTime() + TWO_HOURS_MS);

    const now = currentTime;

    // Check if in morning window (2h before first class)
    if (now >= morningWindowStart && now < morningWindowEnd) {
      return {
        allowed: true,
        reason: "before_school_hours",
        message: "Créneau matinal autorisé (2h avant les cours)",
        timeWindow: {
          start: morningWindowStart,
          end: morningWindowEnd
        }
      };
    }

    // Check if in evening window (2h after last class)
    if (now >= eveningWindowStart && now <= eveningWindowEnd) {
      return {
        allowed: true,
        reason: "after_school_hours",
        message: "Créneau soirée autorisé (2h après les cours)",
        timeWindow: {
          start: eveningWindowStart,
          end: eveningWindowEnd
        }
      };
    }

    // During school hours = not allowed
    if (now >= morningWindowEnd && now < eveningWindowStart) {
      return {
        allowed: false,
        reason: "during_school_hours",
        message: "Cours en ligne disponibles 2h avant/après les cours de l'école",
        nextAvailableAt: eveningWindowStart
      };
    }

    // Outside all windows (late evening/early morning)
    // If after evening window, next available is tomorrow morning
    const nextWindowStart = now > eveningWindowEnd 
      ? new Date(morningWindowStart.getTime() + 24 * 60 * 60 * 1000) // Next day
      : morningWindowStart;
    
    return {
      allowed: false,
      reason: "outside_allowed_windows",
      message: "Horaire non autorisé - voir emploi du temps",
      nextAvailableAt: nextWindowStart
    };
  }

  /**
   * Main method: Check if a teacher can create/access online class
   */
  async canTeacherAccessOnlineClass(
    teacherId: number,
    currentTime: Date = new Date(),
    userEmail?: string
  ): Promise<AccessCheckResult> {
    
    console.log(`[ONLINE_CLASS_ACCESS] 🔍 Checking access for teacherId: ${teacherId}, email: ${userEmail}`);
    
    // ✅ EXEMPTION PERMANENTE: Vérifier sandbox/test users AVANT la base de données
    if (userEmail && this.isSandboxOrTestUser(userEmail)) {
      console.log(`[PREMIUM_EXEMPT] ✅ User ${userEmail} permanently exempt from online classes subscription`);
      console.log(`[LIMITS_EXEMPT] ✅ Online classes unlimited access granted`);
      return {
        allowed: true,
        reason: "sandbox_exemption",
        message: "Accès illimité (compte sandbox/test)",
        activationType: null
      };
    }
    
    console.log(`[ONLINE_CLASS_ACCESS] ❌ Email ${userEmail} did not pass exemption check, proceeding to database lookup`);
    
    // Get teacher info
    const [teacher] = await db
      .select()
      .from(users)
      .where(eq(users.id, teacherId))
      .limit(1);

    if (!teacher) {
      return {
        allowed: false,
        reason: "teacher_not_found",
        message: "Enseignant non trouvé"
      };
    }

    const schoolId = teacher.schoolId;

    // ✅ PRIORITÉ: Vérifier l'abonnement personnel EN PREMIER
    // Personal subscription gives full course creation rights regardless of school access
    const teacherActivation = await onlineClassActivationService.checkTeacherActivation(teacherId);
    
    if (teacherActivation) {
      const now = new Date();
      const startDate = new Date(teacherActivation.startDate);
      const endDate = new Date(teacherActivation.endDate);
      const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const durationType = this.getDurationLabel(durationDays);
      const isExpiringSoon = daysRemaining <= 7;
      
      console.log(`[ONLINE_CLASS_ACCESS] ✅ Teacher ${teacherId} has personal subscription - prioritized over school access`);
      
      return {
        allowed: true,
        reason: "teacher_personal_subscription",
        message: `Abonnement personnel actif (${durationType}) - expire le ${endDate.toLocaleDateString('fr-FR')}`,
        activationType: "teacher",
        subscriptionDetails: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          durationDays,
          daysRemaining,
          durationType,
          isExpiringSoon
        }
      };
    }

    // Case 1: Teacher is assigned to a school (but no personal subscription)
    if (schoolId) {
      // Check if school has activation
      const schoolActivation = await onlineClassActivationService.checkSchoolActivation(schoolId);
      
      if (schoolActivation) {
        // School has activation - ALWAYS allow viewing assigned sessions
        // Time window only restricts WHEN they can start, not VIEWING
        const timeWindowCheck = await this.checkSchoolTimeWindow(schoolId, currentTime);
        const schoolEndDate = new Date(schoolActivation.endDate);
        const daysRemaining = Math.ceil((schoolEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          allowed: true, // Always allow for viewing assigned sessions
          reason: timeWindowCheck.allowed ? "school_access" : "school_access_time_restricted",
          message: timeWindowCheck.allowed 
            ? "Accès école - vous pouvez démarrer vos sessions assignées"
            : `Accès école - ${timeWindowCheck.message}`,
          activationType: "school",
          canStartSession: timeWindowCheck.allowed, // Only start during allowed windows OR for scheduled sessions
          timeRestriction: !timeWindowCheck.allowed ? {
            reason: timeWindowCheck.reason,
            nextAvailableAt: timeWindowCheck.nextAvailableAt
          } : null,
          subscriptionDetails: {
            startDate: new Date(schoolActivation.startDate).toISOString(),
            endDate: schoolEndDate.toISOString(),
            durationDays: Math.ceil((schoolEndDate.getTime() - new Date(schoolActivation.startDate).getTime()) / (1000 * 60 * 60 * 24)),
            daysRemaining,
            durationType: "école",
            isExpiringSoon: daysRemaining <= 7
          }
        };
      }
      
      // Neither school nor teacher has activation - BUT still allow viewing the interface
      // They can see the module but cannot create/start sessions without subscribing
      return {
        allowed: true, // ✅ Allow viewing the interface
        reason: "no_school_activation",
        message: "Votre école n'a pas activé ce module. Souscrivez personnellement ou contactez l'administration.",
        activationType: null, // No activation
        canStartSession: false, // Cannot start sessions
        canCreateCourses: false // Cannot create courses
      };
    }

    // Case 2: Independent teacher (no school assignment, no personal subscription)
    // Allow viewing the interface but with limited features
    return {
      allowed: true, // ✅ Allow viewing the interface
      reason: "no_activation",
      message: "Souscrivez pour 150,000 CFA/an pour créer des cours en ligne.",
      activationType: null, // No activation
      canStartSession: false, // Cannot start sessions
      canCreateCourses: false // Cannot create courses
    };
  }

  /**
   * Get subscription expiration date for a teacher
   * Returns the end date of the subscription (school or personal)
   * Used to limit JWT token duration
   */
  async getSubscriptionEndDate(
    teacherId: number,
    userEmail?: string
  ): Promise<{ endDate: Date | null; activationType: "school" | "teacher" | "sandbox" | null }> {
    
    // Sandbox/test users have no expiration (infinite access)
    if (userEmail && this.isSandboxOrTestUser(userEmail)) {
      console.log(`[SUBSCRIPTION_EXPIRY] ✅ Sandbox user ${userEmail} - no expiration limit`);
      return { endDate: null, activationType: "sandbox" };
    }
    
    // Get teacher info
    const [teacher] = await db
      .select()
      .from(users)
      .where(eq(users.id, teacherId))
      .limit(1);

    if (!teacher) {
      return { endDate: null, activationType: null };
    }

    const schoolId = teacher.schoolId;

    // Check personal activation first (takes priority for JWT duration)
    const teacherActivation = await onlineClassActivationService.checkTeacherActivation(teacherId);
    if (teacherActivation) {
      const endDate = new Date(teacherActivation.endDate);
      console.log(`[SUBSCRIPTION_EXPIRY] 🎓 Teacher ${teacherId} personal subscription ends: ${endDate.toISOString()}`);
      return { endDate, activationType: "teacher" };
    }

    // Check school activation
    if (schoolId) {
      const schoolActivation = await onlineClassActivationService.checkSchoolActivation(schoolId);
      if (schoolActivation) {
        const endDate = new Date(schoolActivation.endDate);
        console.log(`[SUBSCRIPTION_EXPIRY] 🏫 School ${schoolId} activation ends: ${endDate.toISOString()}`);
        return { endDate, activationType: "school" };
      }
    }

    console.log(`[SUBSCRIPTION_EXPIRY] ❌ No active subscription for teacher ${teacherId}`);
    return { endDate: null, activationType: null };
  }

  /**
   * Calculate JWT expiration in minutes based on subscription end date AND session max duration
   * Returns the minimum of: subscription remaining, session max duration, or default cap
   * JWT will expire when session ends OR subscription expires, whichever comes first
   * Uses ceiling to ensure token expires AT or BEFORE limits
   */
  calculateJwtExpirationMinutes(
    subscriptionEndDate: Date | null,
    defaultMinutes: number = 60,
    sessionMaxDuration?: number // Session maxDuration in minutes (from school-assigned session)
  ): number {
    let effectiveMaxMinutes = defaultMinutes;
    
    // If session has maxDuration, use it as the cap (e.g., 60 min session = max 60 min token)
    if (sessionMaxDuration && sessionMaxDuration > 0) {
      effectiveMaxMinutes = Math.min(effectiveMaxMinutes, sessionMaxDuration);
      console.log(`[JWT_EXPIRY] 📚 Session maxDuration: ${sessionMaxDuration} min, effective cap: ${effectiveMaxMinutes} min`);
    }
    
    // No subscription end date means unlimited subscription (use session duration as cap)
    if (!subscriptionEndDate) {
      console.log(`[JWT_EXPIRY] ✅ No subscription limit, using session cap: ${effectiveMaxMinutes} min`);
      return effectiveMaxMinutes;
    }

    const now = new Date();
    const msUntilExpiry = subscriptionEndDate.getTime() - now.getTime();

    // If subscription already expired, return 0 (caller should have rejected already)
    if (msUntilExpiry <= 0) {
      console.log(`[JWT_EXPIRY] ❌ Subscription already expired - returning 0`);
      return 0;
    }

    // Convert to minutes using ceiling to avoid extending past subscription end
    const minutesUntilExpiry = Math.ceil(msUntilExpiry / (1000 * 60));

    // Return the MINIMUM of: subscription remaining OR session cap
    const finalMinutes = Math.min(minutesUntilExpiry, effectiveMaxMinutes);
    
    if (finalMinutes < effectiveMaxMinutes) {
      console.log(`[JWT_EXPIRY] ⏰ Limiting JWT to ${finalMinutes} min (subscription ends before session ends)`);
    } else {
      console.log(`[JWT_EXPIRY] ✅ JWT set to ${finalMinutes} min (session ends before subscription)`);
    }
    
    return finalMinutes;
  }

  /**
   * Check if a school has online class activated (for admin purposes)
   */
  async isSchoolActivated(schoolId: number): Promise<boolean> {
    const activation = await onlineClassActivationService.checkSchoolActivation(schoolId);
    return activation !== null;
  }

  /**
   * Check if a teacher has personal activation (for admin purposes)
   */
  async isTeacherActivated(teacherId: number): Promise<boolean> {
    const activation = await onlineClassActivationService.checkTeacherActivation(teacherId);
    return activation !== null;
  }

  /**
   * Get detailed access info for UI display
   */
  async getAccessDetails(teacherId: number) {
    const [teacher] = await db
      .select()
      .from(users)
      .where(eq(users.id, teacherId))
      .limit(1);

    if (!teacher) {
      return null;
    }

    const result: any = {
      teacherId,
      schoolId: teacher.schoolId,
      hasSchoolActivation: false,
      hasPersonalActivation: false,
      canAccess: false
    };

    if (teacher.schoolId) {
      const schoolActivation = await onlineClassActivationService.checkSchoolActivation(teacher.schoolId);
      result.hasSchoolActivation = !!schoolActivation;
      result.schoolActivation = schoolActivation;
    }

    const teacherActivation = await onlineClassActivationService.checkTeacherActivation(teacherId);
    result.hasPersonalActivation = !!teacherActivation;
    result.teacherActivation = teacherActivation;

    const accessCheck = await this.canTeacherAccessOnlineClass(
      teacherId, 
      new Date(), 
      teacher.email || undefined  // Pass email for sandbox/test exemption check
    );
    result.canAccess = accessCheck.allowed;
    result.accessDetails = accessCheck;

    return result;
  }
}

export const onlineClassAccessService = new OnlineClassAccessService();

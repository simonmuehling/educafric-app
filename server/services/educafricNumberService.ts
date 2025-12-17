// ===== EDUCAFRIC NUMBER MANAGEMENT SERVICE =====
// Handles generation, validation, and management of EDUCAFRIC numbers
// Format: EDU-{CC}-XX-### where CC = CM/CI/SN, XX = SC/TE/ST/PA/CO, ### = 3-digit counter

import { db } from "../db";
import { educafricNumbers, educafricNumberCounters, schools, users } from "@shared/schema";
import { eq, and, sql, isNull } from "drizzle-orm";
import { type CountryCode, COUNTRY_CONFIGS, getCountryConfig } from "@shared/countryConfig";

export interface EducafricNumberConfig {
  type: 'SC' | 'TE' | 'ST' | 'PA' | 'CO'; // School, Teacher, Student, Parent, Commercial
  countryCode?: CountryCode; // CM, CI, SN - defaults to CM
  entityType: 'school' | 'user';
  entityId?: number;
  issuedBy?: number;
  notes?: string;
}

export class EducafricNumberService {
  
  // Supported country codes
  static readonly SUPPORTED_COUNTRIES: CountryCode[] = ['CM', 'CI', 'SN'];
  
  /**
   * Generate next EDUCAFRIC number for a given type and country
   * Format: EDU-{CC}-{type}-{counter} where CC = CM/CI/SN
   */
  static async generateNumber(type: 'SC' | 'TE' | 'ST' | 'PA' | 'CO', countryCode: CountryCode = 'CM'): Promise<string> {
    // Validate country code
    if (!this.SUPPORTED_COUNTRIES.includes(countryCode)) {
      throw new Error(`Unsupported country code: ${countryCode}. Supported: ${this.SUPPORTED_COUNTRIES.join(', ')}`);
    }
    
    // Get current counter and increment atomically using raw SQL for atomic operation
    const [counter] = await db
      .update(educafricNumberCounters)
      .set({ 
        currentCounter: sql`current_counter + 1`
      })
      .where(eq(educafricNumberCounters.type, type))
      .returning();

    if (!counter) {
      throw new Error(`Counter not found for type: ${type}`);
    }

    // Format number with leading zeros (e.g., 001, 002, etc.)
    const paddedCounter = counter.currentCounter.toString().padStart(3, '0');
    const educafricNumber = `EDU-${countryCode}-${type}-${paddedCounter}`;

    // Update last generated in a separate query
    await db
      .update(educafricNumberCounters)
      .set({ lastGenerated: educafricNumber })
      .where(eq(educafricNumberCounters.type, type));

    return educafricNumber;
  }

  /**
   * Create and assign EDUCAFRIC number
   */
  static async createNumber(config: EducafricNumberConfig): Promise<typeof educafricNumbers.$inferSelect> {
    const countryCode = config.countryCode || 'CM';
    const educafricNumber = await this.generateNumber(config.type, countryCode);

    const [record] = await db
      .insert(educafricNumbers)
      .values({
        educafricNumber,
        type: config.type,
        entityType: config.entityType,
        entityId: config.entityId,
        status: 'active',
        issuedBy: config.issuedBy,
        notes: config.notes
      })
      .returning();

    return record;
  }

  /**
   * Validate EDUCAFRIC number format (supports all countries: CM, CI, SN)
   */
  static validateFormat(number: string): boolean {
    const regex = /^EDU-(CM|CI|SN)-(SC|TE|ST|PA|CO)-\d{3}$/;
    return regex.test(number);
  }
  
  /**
   * Extract country code from EDUCAFRIC number
   */
  static extractCountryCode(number: string): CountryCode | null {
    const match = number.match(/^EDU-(CM|CI|SN)-/);
    return match ? (match[1] as CountryCode) : null;
  }

  /**
   * Check if EDUCAFRIC number exists and is available
   */
  static async isNumberAvailable(educafricNumber: string): Promise<boolean> {
    const [existing] = await db
      .select()
      .from(educafricNumbers)
      .where(eq(educafricNumbers.educafricNumber, educafricNumber))
      .limit(1);

    return !existing;
  }

  /**
   * Verify EDUCAFRIC number is valid and active for school signup
   */
  static async verifySchoolNumber(educafricNumber: string): Promise<{
    valid: boolean;
    message: string;
    messageFr: string;
    messageEn: string;
    countryCode?: CountryCode;
    record?: typeof educafricNumbers.$inferSelect;
  }> {
    // Check format (now supports CM, CI, SN)
    if (!this.validateFormat(educafricNumber)) {
      return { 
        valid: false, 
        message: 'Format du numéro EDUCAFRIC invalide. Formats attendus: EDU-CM-SC-XXX, EDU-CI-SC-XXX, EDU-SN-SC-XXX',
        messageFr: 'Format du numéro EDUCAFRIC invalide. Formats attendus: EDU-CM-SC-XXX, EDU-CI-SC-XXX, EDU-SN-SC-XXX',
        messageEn: 'Invalid EDUCAFRIC number format. Expected formats: EDU-CM-SC-XXX, EDU-CI-SC-XXX, EDU-SN-SC-XXX'
      };
    }

    // Check if it's a school number (supports all countries)
    const schoolPattern = /^EDU-(CM|CI|SN)-SC-/;
    if (!schoolPattern.test(educafricNumber)) {
      return { 
        valid: false, 
        message: 'Ce numéro n\'est pas un numéro EDUCAFRIC pour école. Les numéros école contiennent -SC-',
        messageFr: 'Ce numéro n\'est pas un numéro EDUCAFRIC pour école. Les numéros école contiennent -SC-',
        messageEn: 'This is not a school EDUCAFRIC number. School numbers contain -SC-'
      };
    }
    
    // Extract country code
    const countryCode = this.extractCountryCode(educafricNumber);

    // Check if exists
    const [record] = await db
      .select()
      .from(educafricNumbers)
      .where(eq(educafricNumbers.educafricNumber, educafricNumber))
      .limit(1);

    if (!record) {
      return { 
        valid: false, 
        message: `Le numéro EDUCAFRIC "${educafricNumber}" n'existe pas dans notre système. Veuillez contacter l'administration EDUCAFRIC pour obtenir un numéro valide.`,
        messageFr: `Le numéro EDUCAFRIC "${educafricNumber}" n'existe pas dans notre système. Veuillez contacter l'administration EDUCAFRIC pour obtenir un numéro valide.`,
        messageEn: `The EDUCAFRIC number "${educafricNumber}" does not exist in our system. Please contact EDUCAFRIC administration to obtain a valid number.`
      };
    }

    // Check if already assigned to a school
    if (record.entityId) {
      return { 
        valid: false, 
        message: `Le numéro EDUCAFRIC "${educafricNumber}" a déjà été utilisé pour créer une autre école. Chaque numéro ne peut être utilisé qu'une seule fois.`,
        messageFr: `Le numéro EDUCAFRIC "${educafricNumber}" a déjà été utilisé pour créer une autre école. Chaque numéro ne peut être utilisé qu'une seule fois.`,
        messageEn: `The EDUCAFRIC number "${educafricNumber}" has already been used to create another school. Each number can only be used once.`
      };
    }

    // Check status
    if (record.status !== 'active') {
      const statusMessages: Record<string, { fr: string; en: string }> = {
        'revoked': { 
          fr: `Le numéro EDUCAFRIC "${educafricNumber}" a été révoqué. Veuillez contacter l'administration.`,
          en: `The EDUCAFRIC number "${educafricNumber}" has been revoked. Please contact administration.`
        },
        'expired': { 
          fr: `Le numéro EDUCAFRIC "${educafricNumber}" a expiré. Veuillez demander un renouvellement.`,
          en: `The EDUCAFRIC number "${educafricNumber}" has expired. Please request a renewal.`
        },
        'pending': { 
          fr: `Le numéro EDUCAFRIC "${educafricNumber}" est en attente d'activation. Veuillez patienter ou contacter l'administration.`,
          en: `The EDUCAFRIC number "${educafricNumber}" is pending activation. Please wait or contact administration.`
        }
      };
      const statusMsg = statusMessages[record.status] || { 
        fr: `Le numéro EDUCAFRIC "${educafricNumber}" n'est pas actif (statut: ${record.status}).`,
        en: `The EDUCAFRIC number "${educafricNumber}" is not active (status: ${record.status}).`
      };
      return { 
        valid: false, 
        message: statusMsg.fr,
        messageFr: statusMsg.fr,
        messageEn: statusMsg.en
      };
    }

    return { 
      valid: true, 
      message: 'Numéro EDUCAFRIC valide', 
      messageFr: 'Numéro EDUCAFRIC valide',
      messageEn: 'EDUCAFRIC number is valid',
      countryCode: countryCode || 'CM',
      record 
    };
  }

  /**
   * Assign EDUCAFRIC number to school during signup
   * Can accept a transaction client for atomic operations
   */
  static async assignToSchool(educafricNumber: string, schoolId: number, txClient?: any): Promise<void> {
    const dbClient = txClient || db;

    // Conditional update to prevent race conditions - only update if not already assigned
    const [updated] = await dbClient
      .update(educafricNumbers)
      .set({ 
        entityId: schoolId,
        updatedAt: new Date()
      })
      .where(and(
        eq(educafricNumbers.educafricNumber, educafricNumber),
        isNull(educafricNumbers.entityId) // Only update if not already assigned
      ))
      .returning();

    if (!updated) {
      throw new Error('EDUCAFRIC number has already been assigned to another school');
    }

    // Note: School record already has educafricNumber from insert, no need to update again
  }

  /**
   * Auto-generate and assign EDUCAFRIC number to user (Teacher/Student/Parent only)
   * Note: School and Commercial get numbers from admins, not auto-generated
   */
  static async autoAssignToUser(userId: number, userRole: string, countryCode: CountryCode = 'CM'): Promise<string | null> {
    // Determine type based on role
    let type: 'TE' | 'ST' | 'PA' | null = null;
    
    if (userRole === 'Teacher') type = 'TE';
    else if (userRole === 'Student') type = 'ST';
    else if (userRole === 'Parent') type = 'PA';

    if (!type) return null; // Only auto-generate for Teacher, Student, Parent

    // Generate and create number with country code
    const record = await this.createNumber({
      type,
      countryCode,
      entityType: 'user',
      entityId: userId
    });

    // Update user record
    await db
      .update(users)
      .set({ educafricNumber: record.educafricNumber })
      .where(eq(users.id, userId));

    return record.educafricNumber;
  }

  /**
   * Get all school EDUCAFRIC numbers for admin management
   */
  static async getSchoolNumbers() {
    const numbers = await db
      .select({
        id: educafricNumbers.id,
        educafricNumber: educafricNumbers.educafricNumber,
        status: educafricNumbers.status,
        entityId: educafricNumbers.entityId,
        notes: educafricNumbers.notes,
        createdAt: educafricNumbers.createdAt,
        schoolName: schools.name,
        schoolEmail: schools.email
      })
      .from(educafricNumbers)
      .leftJoin(schools, eq(educafricNumbers.entityId, schools.id))
      .where(eq(educafricNumbers.type, 'SC'))
      .orderBy(sql`${educafricNumbers.createdAt} DESC`);

    return numbers;
  }

  /**
   * Get all commercial EDUCAFRIC numbers for admin management
   */
  static async getCommercialNumbers() {
    const numbers = await db
      .select({
        id: educafricNumbers.id,
        educafricNumber: educafricNumbers.educafricNumber,
        status: educafricNumbers.status,
        entityId: educafricNumbers.entityId,
        notes: educafricNumbers.notes,
        createdAt: educafricNumbers.createdAt,
        userName: users.firstName,
        userLastName: users.lastName,
        userEmail: users.email
      })
      .from(educafricNumbers)
      .leftJoin(users, eq(educafricNumbers.entityId, users.id))
      .where(eq(educafricNumbers.type, 'CO'))
      .orderBy(sql`${educafricNumbers.createdAt} DESC`);

    return numbers;
  }

  /**
   * Update EDUCAFRIC number status or notes
   */
  static async updateNumber(id: number, data: { status?: string; notes?: string }) {
    const [updated] = await db
      .update(educafricNumbers)
      .set({ 
        ...data,
        updatedAt: new Date()
      })
      .where(eq(educafricNumbers.id, id))
      .returning();

    return updated;
  }

  /**
   * Release EDUCAFRIC number (make it available again by removing entity assignment)
   * Used during rollback scenarios when school creation fails
   */
  static async releaseNumber(educafricNumber: string): Promise<void> {
    const [updated] = await db
      .update(educafricNumbers)
      .set({ 
        entityId: null,
        updatedAt: new Date()
      })
      .where(eq(educafricNumbers.educafricNumber, educafricNumber))
      .returning();

    if (!updated) {
      throw new Error(`EDUCAFRIC number not found: ${educafricNumber}`);
    }

    console.log(`[EDUCAFRIC_SERVICE] Released number ${educafricNumber}, now available`);
  }

  /**
   * Revoke/Delete EDUCAFRIC number (admin only)
   */
  static async revokeNumber(id: number): Promise<void> {
    const [record] = await db
      .select()
      .from(educafricNumbers)
      .where(eq(educafricNumbers.id, id))
      .limit(1);

    if (!record) {
      throw new Error('EDUCAFRIC number not found');
    }

    // If assigned to a school, cannot delete
    if (record.entityId && record.type === 'SC') {
      throw new Error('Cannot delete EDUCAFRIC number that is assigned to a school');
    }

    // Delete the number
    await db
      .delete(educafricNumbers)
      .where(eq(educafricNumbers.id, id));
  }

  /**
   * Get counter statistics (shows next numbers for all countries)
   */
  static async getCounterStats() {
    const counters = await db
      .select()
      .from(educafricNumberCounters)
      .orderBy(educafricNumberCounters.type);

    return counters.map(counter => ({
      type: counter.type,
      label: this.getTypeLabel(counter.type),
      currentCounter: counter.currentCounter,
      lastGenerated: counter.lastGenerated,
      // Show next numbers for all supported countries
      nextNumbers: {
        CM: `EDU-CM-${counter.type}-${(counter.currentCounter + 1).toString().padStart(3, '0')}`,
        CI: `EDU-CI-${counter.type}-${(counter.currentCounter + 1).toString().padStart(3, '0')}`,
        SN: `EDU-SN-${counter.type}-${(counter.currentCounter + 1).toString().padStart(3, '0')}`
      },
      // Backward compatibility
      nextNumber: `EDU-CM-${counter.type}-${(counter.currentCounter + 1).toString().padStart(3, '0')}`
    }));
  }

  /**
   * Get human-readable label for type
   */
  private static getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      SC: 'School',
      TE: 'Teacher',
      ST: 'Student',
      PA: 'Parent',
      CO: 'Commercial'
    };
    return labels[type] || type;
  }
}

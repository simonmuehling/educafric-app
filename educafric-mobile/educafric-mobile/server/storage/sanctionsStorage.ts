// ===== SANCTIONS STORAGE MODULE =====
// Storage layer for disciplinary sanctions management

import { db } from "../db";
import { sanctions } from "../../shared/schema";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import type { InsertSanction, SelectSanction } from "../../shared/schemas/sanctionsSchema";

export interface ISanctionStorage {
  createSanction(sanction: InsertSanction): Promise<SelectSanction>;
  getSanction(id: number): Promise<SelectSanction | null>;
  updateSanction(id: number, updates: Partial<InsertSanction>): Promise<SelectSanction>;
  deleteSanction(id: number): Promise<void>;
  getStudentSanctions(studentId: number, filters?: any): Promise<SelectSanction[]>;
  getClassSanctions(classId: number, filters?: any): Promise<SelectSanction[]>;
  getSchoolSanctions(schoolId: number, filters?: any): Promise<SelectSanction[]>;
  getSanctionsByType(schoolId: number, sanctionType: string): Promise<SelectSanction[]>;
  revokeSanction(id: number, revokedBy: number, reason: string): Promise<SelectSanction>;
  appealSanction(id: number, appealReason: string): Promise<SelectSanction>;
  expireSanctions(): Promise<void>;
}

export class SanctionStorage implements ISanctionStorage {
  async createSanction(sanction: InsertSanction): Promise<SelectSanction> {
    try {
      console.log('[SANCTIONS_STORAGE] 📝 Création nouvelle sanction:', sanction.sanctionType, 'pour étudiant:', sanction.studentId);
      
      // Auto-calculate end date for temporary exclusions
      let sanctionData = { ...sanction };
      if (sanction.sanctionType === 'exclusion_temporary' && sanction.duration && sanction.startDate) {
        const startDate = new Date(sanction.startDate);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + sanction.duration - 1);
        sanctionData.endDate = endDate.toISOString().split('T')[0];
      }

      const [newSanction] = await db.insert(sanctions)
        .values(sanctionData)
        .returning();
      
      console.log('[SANCTIONS_STORAGE] ✅ Sanction créée avec ID:', newSanction.id);
      return newSanction;
    } catch (error) {
      console.error('[SANCTIONS_STORAGE] ❌ Erreur création sanction:', error);
      throw new Error(`Failed to create sanction: ${error}`);
    }
  }

  async getSanction(id: number): Promise<SelectSanction | null> {
    try {
      console.log('[SANCTIONS_STORAGE] 🔍 Récupération sanction ID:', id);
      
      const [sanction] = await db.select().from(sanctions)
        .where(eq(sanctions.id, id))
        .limit(1);
      
      if (sanction) {
        console.log('[SANCTIONS_STORAGE] ✅ Sanction trouvée:', sanction.sanctionType);
      } else {
        console.log('[SANCTIONS_STORAGE] ⚠️ Sanction introuvable');
      }
      
      return sanction || null;
    } catch (error) {
      console.error('[SANCTIONS_STORAGE] ❌ Erreur récupération sanction:', error);
      return null;
    }
  }

  async updateSanction(id: number, updates: Partial<InsertSanction>): Promise<SelectSanction> {
    try {
      console.log('[SANCTIONS_STORAGE] 📝 Mise à jour sanction ID:', id);
      
      const updateData = { 
        ...updates, 
        updatedAt: new Date() 
      };
      
      const [updatedSanction] = await db.update(sanctions)
        .set(updateData)
        .where(eq(sanctions.id, id))
        .returning();
      
      if (!updatedSanction) {
        throw new Error(`Sanction with ID ${id} not found`);
      }
      
      console.log('[SANCTIONS_STORAGE] ✅ Sanction mise à jour');
      return updatedSanction;
    } catch (error) {
      console.error('[SANCTIONS_STORAGE] ❌ Erreur mise à jour sanction:', error);
      throw new Error(`Failed to update sanction: ${error}`);
    }
  }

  async deleteSanction(id: number): Promise<void> {
    try {
      console.log('[SANCTIONS_STORAGE] 🗑️ Suppression sanction ID:', id);
      
      await db.delete(sanctions)
        .where(eq(sanctions.id, id));
      
      console.log('[SANCTIONS_STORAGE] ✅ Sanction supprimée');
    } catch (error) {
      console.error('[SANCTIONS_STORAGE] ❌ Erreur suppression sanction:', error);
      throw new Error(`Failed to delete sanction: ${error}`);
    }
  }

  async getStudentSanctions(studentId: number, filters: any = {}): Promise<SelectSanction[]> {
    try {
      console.log('[SANCTIONS_STORAGE] 📚 Récupération sanctions étudiant:', studentId);
      
      let query = db.select().from(sanctions)
        .where(eq(sanctions.studentId, studentId));
      
      // Apply filters
      if (filters.sanctionType) {
        query = query.where(and(eq(sanctions.studentId, studentId), eq(sanctions.sanctionType, filters.sanctionType)));
      }
      
      if (filters.status) {
        query = query.where(and(eq(sanctions.studentId, studentId), eq(sanctions.status, filters.status)));
      }
      
      if (filters.academicYear) {
        query = query.where(and(eq(sanctions.studentId, studentId), eq(sanctions.academicYear, filters.academicYear)));
      }
      
      if (filters.term) {
        query = query.where(and(eq(sanctions.studentId, studentId), eq(sanctions.term, filters.term)));
      }
      
      const studentSanctions = await query.orderBy(desc(sanctions.createdAt));
      
      console.log('[SANCTIONS_STORAGE] ✅ Trouvé', studentSanctions.length, 'sanctions pour l\'étudiant');
      return studentSanctions;
    } catch (error) {
      console.error('[SANCTIONS_STORAGE] ❌ Erreur récupération sanctions étudiant:', error);
      return [];
    }
  }

  async getClassSanctions(classId: number, filters: any = {}): Promise<SelectSanction[]> {
    try {
      console.log('[SANCTIONS_STORAGE] 🏫 Récupération sanctions classe:', classId);
      
      let conditions = [eq(sanctions.classId, classId)];
      
      if (filters.sanctionType) {
        conditions.push(eq(sanctions.sanctionType, filters.sanctionType));
      }
      
      if (filters.status) {
        conditions.push(eq(sanctions.status, filters.status));
      }
      
      if (filters.academicYear) {
        conditions.push(eq(sanctions.academicYear, filters.academicYear));
      }
      
      if (filters.severity) {
        conditions.push(eq(sanctions.severity, filters.severity));
      }
      
      const classSanctions = await db.select().from(sanctions)
        .where(and(...conditions))
        .orderBy(desc(sanctions.createdAt));
      
      console.log('[SANCTIONS_STORAGE] ✅ Trouvé', classSanctions.length, 'sanctions pour la classe');
      return classSanctions;
    } catch (error) {
      console.error('[SANCTIONS_STORAGE] ❌ Erreur récupération sanctions classe:', error);
      return [];
    }
  }

  async getSchoolSanctions(schoolId: number, filters: any = {}): Promise<SelectSanction[]> {
    try {
      console.log('[SANCTIONS_STORAGE] 🏢 Récupération sanctions école:', schoolId);
      
      let conditions = [eq(sanctions.schoolId, schoolId)];
      
      if (filters.sanctionType) {
        conditions.push(eq(sanctions.sanctionType, filters.sanctionType));
      }
      
      if (filters.status) {
        conditions.push(eq(sanctions.status, filters.status));
      }
      
      if (filters.classId) {
        conditions.push(eq(sanctions.classId, filters.classId));
      }
      
      if (filters.dateFrom) {
        conditions.push(gte(sanctions.date, filters.dateFrom));
      }
      
      if (filters.dateTo) {
        conditions.push(lte(sanctions.date, filters.dateTo));
      }
      
      const schoolSanctions = await db.select().from(sanctions)
        .where(and(...conditions))
        .orderBy(desc(sanctions.createdAt));
      
      console.log('[SANCTIONS_STORAGE] ✅ Trouvé', schoolSanctions.length, 'sanctions pour l\'école');
      return schoolSanctions;
    } catch (error) {
      console.error('[SANCTIONS_STORAGE] ❌ Erreur récupération sanctions école:', error);
      return [];
    }
  }

  async getSanctionsByType(schoolId: number, sanctionType: string): Promise<SelectSanction[]> {
    try {
      console.log('[SANCTIONS_STORAGE] 📊 Récupération sanctions par type:', sanctionType, 'école:', schoolId);
      
      const sanctionsByType = await db.select().from(sanctions)
        .where(and(
          eq(sanctions.schoolId, schoolId),
          eq(sanctions.sanctionType, sanctionType)
        ))
        .orderBy(desc(sanctions.createdAt));
      
      console.log('[SANCTIONS_STORAGE] ✅ Trouvé', sanctionsByType.length, 'sanctions de type', sanctionType);
      return sanctionsByType;
    } catch (error) {
      console.error('[SANCTIONS_STORAGE] ❌ Erreur récupération sanctions par type:', error);
      return [];
    }
  }

  async revokeSanction(id: number, revokedBy: number, reason: string): Promise<SelectSanction> {
    try {
      console.log('[SANCTIONS_STORAGE] 🚫 Révocation sanction ID:', id, 'par:', revokedBy);
      
      const [revokedSanction] = await db.update(sanctions)
        .set({
          status: 'revoked',
          revokedBy,
          revokedReason: reason,
          revokedDate: new Date(),
          updatedAt: new Date()
        })
        .where(eq(sanctions.id, id))
        .returning();
      
      if (!revokedSanction) {
        throw new Error(`Sanction with ID ${id} not found`);
      }
      
      console.log('[SANCTIONS_STORAGE] ✅ Sanction révoquée');
      return revokedSanction;
    } catch (error) {
      console.error('[SANCTIONS_STORAGE] ❌ Erreur révocation sanction:', error);
      throw new Error(`Failed to revoke sanction: ${error}`);
    }
  }

  async appealSanction(id: number, appealReason: string): Promise<SelectSanction> {
    try {
      console.log('[SANCTIONS_STORAGE] 📋 Appel sanction ID:', id);
      
      const [appealedSanction] = await db.update(sanctions)
        .set({
          status: 'appealed',
          appealReason,
          appealDate: new Date(),
          updatedAt: new Date()
        })
        .where(eq(sanctions.id, id))
        .returning();
      
      if (!appealedSanction) {
        throw new Error(`Sanction with ID ${id} not found`);
      }
      
      console.log('[SANCTIONS_STORAGE] ✅ Sanction mise en appel');
      return appealedSanction;
    } catch (error) {
      console.error('[SANCTIONS_STORAGE] ❌ Erreur appel sanction:', error);
      throw new Error(`Failed to appeal sanction: ${error}`);
    }
  }

  async expireSanctions(): Promise<void> {
    try {
      console.log('[SANCTIONS_STORAGE] ⏰ Traitement sanctions expirées');
      
      // Expire temporary exclusions that have ended
      const today = new Date().toISOString().split('T')[0];
      
      const expiredSanctions = await db.update(sanctions)
        .set({
          status: 'expired',
          updatedAt: new Date()
        })
        .where(and(
          eq(sanctions.sanctionType, 'exclusion_temporary'),
          eq(sanctions.status, 'active'),
          lte(sanctions.endDate, today)
        ))
        .returning();
      
      console.log('[SANCTIONS_STORAGE] ✅ Expiré', expiredSanctions.length, 'sanctions');
    } catch (error) {
      console.error('[SANCTIONS_STORAGE] ❌ Erreur expiration sanctions:', error);
      throw new Error(`Failed to expire sanctions: ${error}`);
    }
  }
}
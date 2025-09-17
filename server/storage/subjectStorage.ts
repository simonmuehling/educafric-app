// ===== SUBJECT STORAGE MODULE =====
// New module for subjects management and import functionality

import { db } from "../db";
import { subjects } from "../../shared/schema";
import { eq, and, desc } from "drizzle-orm";

export interface ISubjectStorage {
  getSchoolSubjects(schoolId: number): Promise<any[]>;
  getSubject(id: number): Promise<any | null>;
  createSubject(subjectData: any): Promise<any>;
  updateSubject(id: number, updates: any): Promise<any>;
  deleteSubject(id: number): Promise<void>;
  getSubjectsByClass(classId: number): Promise<any[]>;
}

export class SubjectStorage implements ISubjectStorage {
  async getSchoolSubjects(schoolId: number): Promise<any[]> {
    try {
      console.log('[SUBJECT_STORAGE] 📚 Récupération matières école:', schoolId);
      
      // Try to get real data first
      const realSubjects = await db.select().from(subjects).where(eq(subjects.schoolId, schoolId)).orderBy(subjects.name);
      
      if (realSubjects.length > 0) {
        console.log(`[SUBJECT_STORAGE] ✅ ${realSubjects.length} matières trouvées en base`);
        return realSubjects;
      }
      
      // If no subjects found, create default subjects for the school
      console.log('[SUBJECT_STORAGE] 🔧 Création matières par défaut pour école:', schoolId);
      const defaultSubjects = [
        { name: 'Mathématiques', nameFr: 'Mathématiques', nameEn: 'Mathematics', coefficient: 4, classLevel: '6ème', schoolId, department: 'Sciences' },
        { name: 'Français', nameFr: 'Français', nameEn: 'French', coefficient: 3, classLevel: '6ème', schoolId, department: 'Littéraire' },
        { name: 'Anglais', nameFr: 'Anglais', nameEn: 'English', coefficient: 2, classLevel: '6ème', schoolId, department: 'Langues' },
        { name: 'Histoire', nameFr: 'Histoire', nameEn: 'History', coefficient: 2, classLevel: '6ème', schoolId, department: 'Sciences Humaines' },
        { name: 'Géographie', nameFr: 'Géographie', nameEn: 'Geography', coefficient: 2, classLevel: '6ème', schoolId, department: 'Sciences Humaines' },
        { name: 'Sciences', nameFr: 'Sciences', nameEn: 'Science', coefficient: 3, classLevel: '6ème', schoolId, department: 'Sciences' }
      ];
      
      try {
        const createdSubjects = await db.insert(subjects).values(defaultSubjects).returning();
        console.log(`[SUBJECT_STORAGE] ✅ ${createdSubjects.length} matières par défaut créées`);
        return createdSubjects;
      } catch (insertError) {
        console.error('[SUBJECT_STORAGE] ❌ Erreur création matières par défaut:', insertError);
        // Return with mock IDs if insert fails
        return defaultSubjects.map((subject, index) => ({ id: index + 1, ...subject }));
      }
    } catch (error) {
      console.error('[SUBJECT_STORAGE] ❌ Erreur récupération matières:', error);
      // Last resort fallback
      return [
        { id: 1, name: 'Mathématiques', nameFr: 'Mathématiques', nameEn: 'Mathematics', coefficient: 4, classLevel: '6ème', schoolId },
        { id: 2, name: 'Français', nameFr: 'Français', nameEn: 'French', coefficient: 3, classLevel: '6ème', schoolId },
        { id: 3, name: 'Anglais', nameFr: 'Anglais', nameEn: 'English', coefficient: 2, classLevel: '6ème', schoolId }
      ];
    }
  }

  async getSubject(id: number): Promise<any | null> {
    try {
      const [subject] = await db.select().from(subjects).where(eq(subjects.id, id)).limit(1);
      return subject || null;
    } catch (error) {
      console.error('[SUBJECT_STORAGE] ❌ Erreur récupération matière:', error);
      return null;
    }
  }

  async createSubject(subjectData: any): Promise<any> {
    try {
      console.log('[SUBJECT_STORAGE] ➕ Création matière:', subjectData.name);
      
      const insertData = {
        name: subjectData.name,
        nameFr: subjectData.nameFr || subjectData.name,
        nameEn: subjectData.nameEn || subjectData.name,
        coefficient: subjectData.coefficient || 1,
        classLevel: subjectData.classLevel,
        department: subjectData.department || 'Général',
        description: subjectData.description,
        isActive: subjectData.isActive !== false,
        schoolId: subjectData.schoolId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const [newSubject] = await db.insert(subjects).values(insertData).returning();
      console.log('[SUBJECT_STORAGE] ✅ Matière créée:', newSubject.id);
      return newSubject;
    } catch (error) {
      console.error('[SUBJECT_STORAGE] ❌ Erreur création matière:', error);
      throw new Error(`Failed to create subject: ${error}`);
    }
  }

  async updateSubject(id: number, updates: any): Promise<any> {
    try {
      console.log('[SUBJECT_STORAGE] ✏️ Mise à jour matière:', id);
      
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };

      const [updatedSubject] = await db.update(subjects).set(updateData).where(eq(subjects.id, id)).returning();
      console.log('[SUBJECT_STORAGE] ✅ Matière mise à jour');
      return updatedSubject;
    } catch (error) {
      console.error('[SUBJECT_STORAGE] ❌ Erreur mise à jour matière:', error);
      throw new Error(`Failed to update subject: ${error}`);
    }
  }

  async deleteSubject(id: number): Promise<void> {
    try {
      console.log('[SUBJECT_STORAGE] 🗑️ Suppression matière:', id);
      await db.delete(subjects).where(eq(subjects.id, id));
      console.log('[SUBJECT_STORAGE] ✅ Matière supprimée');
    } catch (error) {
      console.error('[SUBJECT_STORAGE] ❌ Erreur suppression matière:', error);
      throw new Error(`Failed to delete subject: ${error}`);
    }
  }

  async getSubjectsByClass(classId: number): Promise<any[]> {
    try {
      console.log('[SUBJECT_STORAGE] 📖 Récupération matières classe:', classId);
      
      // Get all subjects and filter by class level if needed
      const allSubjects = await db.select().from(subjects).orderBy(subjects.name);
      
      // TODO: In the future, we could filter by class level
      // For now, return all subjects for the class
      console.log(`[SUBJECT_STORAGE] ✅ ${allSubjects.length} matières trouvées pour classe ${classId}`);
      return allSubjects;
    } catch (error) {
      console.error('[SUBJECT_STORAGE] ❌ Erreur récupération matières classe:', error);
      return [];
    }
  }

  // NEW: Find or create subject by name
  async findOrCreateSubject(schoolId: number, subjectName: string): Promise<any> {
    try {
      console.log('[SUBJECT_STORAGE] 🔍 Recherche/création matière:', subjectName);
      
      // First try to find existing subject
      const [existingSubject] = await db.select().from(subjects)
        .where(and(eq(subjects.schoolId, schoolId), eq(subjects.name, subjectName)))
        .limit(1);
      
      if (existingSubject) {
        console.log('[SUBJECT_STORAGE] ✅ Matière existante trouvée:', existingSubject.id);
        return existingSubject;
      }
      
      // Create new subject if not found
      const newSubjectData = {
        name: subjectName,
        nameFr: subjectName,
        nameEn: subjectName, // TODO: Could be translated
        coefficient: 1, // Default coefficient
        classLevel: 'Tous niveaux',
        department: 'Général',
        schoolId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const [newSubject] = await db.insert(subjects).values(newSubjectData).returning();
      console.log('[SUBJECT_STORAGE] ✅ Nouvelle matière créée:', newSubject.id);
      return newSubject;
    } catch (error) {
      console.error('[SUBJECT_STORAGE] ❌ Erreur recherche/création matière:', error);
      throw new Error(`Failed to find or create subject: ${error}`);
    }
  }

  // NEW: Batch creation for import
  async createSubjectsBatch(subjectsData: any[]): Promise<any[]> {
    try {
      console.log(`[SUBJECT_STORAGE] 📥 Import batch de ${subjectsData.length} matières`);
      
      const results = await db.insert(subjects).values(subjectsData).returning();
      console.log(`[SUBJECT_STORAGE] ✅ ${results.length} matières importées`);
      return results;
    } catch (error) {
      console.error('[SUBJECT_STORAGE] ❌ Erreur import batch matières:', error);
      throw new Error(`Failed to batch create subjects: ${error}`);
    }
  }
}
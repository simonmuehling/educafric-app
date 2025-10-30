/**
 * COMPETENCY MANAGEMENT SERVICE
 * Handles CRUD operations for CBA (Competency-Based Approach) competencies
 * Supports Cameroon Ministry of Secondary Education bulletin requirements
 */

import { db } from "../db";
import { 
  competencies, 
  subjectCompetencyAssignments,
  subjects,
  type Competency,
  type NewCompetency,
  type SubjectCompetencyAssignment,
  type NewSubjectCompetencyAssignment
} from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export class CompetencyService {
  
  /**
   * Create a new competency
   */
  static async createCompetency(data: NewCompetency): Promise<Competency> {
    console.log('[COMPETENCY_SERVICE] Creating competency:', data);
    
    const [competency] = await db
      .insert(competencies)
      .values(data)
      .returning();
    
    console.log('[COMPETENCY_SERVICE] ✅ Competency created:', competency.id);
    return competency;
  }
  
  /**
   * Bulk create competencies for a subject
   */
  static async bulkCreateCompetencies(
    schoolId: number,
    subjectId: number,
    subjectName: string,
    formLevel: string,
    competencyData: Array<{
      competencyTextFr: string;
      competencyTextEn?: string;
      category?: "general" | "professional" | "optional";
      displayOrder?: number;
    }>,
    createdBy?: number
  ): Promise<Competency[]> {
    console.log(`[COMPETENCY_SERVICE] Bulk creating ${competencyData.length} competencies for subject ${subjectName}`);
    
    const competenciesToInsert = competencyData.map((comp, index) => ({
      schoolId,
      subjectId,
      subjectName,
      formLevel,
      competencyTextFr: comp.competencyTextFr,
      competencyTextEn: comp.competencyTextEn,
      category: comp.category || 'general' as const,
      displayOrder: comp.displayOrder || index + 1,
      createdBy
    }));
    
    const created = await db
      .insert(competencies)
      .values(competenciesToInsert)
      .returning();
    
    console.log(`[COMPETENCY_SERVICE] ✅ Created ${created.length} competencies`);
    return created;
  }
  
  /**
   * Get all competencies for a school
   */
  static async getCompetenciesBySchool(schoolId: number): Promise<Competency[]> {
    return await db
      .select()
      .from(competencies)
      .where(and(
        eq(competencies.schoolId, schoolId),
        eq(competencies.isActive, true)
      ))
      .orderBy(competencies.subjectName, competencies.displayOrder);
  }
  
  /**
   * Get competencies for a specific subject
   */
  static async getCompetenciesBySubject(
    schoolId: number,
    subjectId: number,
    formLevel?: string
  ): Promise<Competency[]> {
    const conditions = [
      eq(competencies.schoolId, schoolId),
      eq(competencies.subjectId, subjectId),
      eq(competencies.isActive, true)
    ];
    
    if (formLevel) {
      conditions.push(eq(competencies.formLevel, formLevel));
    }
    
    return await db
      .select()
      .from(competencies)
      .where(and(...conditions))
      .orderBy(competencies.displayOrder);
  }
  
  /**
   * Get competencies by form level
   */
  static async getCompetenciesByFormLevel(
    schoolId: number,
    formLevel: string
  ): Promise<Competency[]> {
    return await db
      .select()
      .from(competencies)
      .where(and(
        eq(competencies.schoolId, schoolId),
        eq(competencies.formLevel, formLevel),
        eq(competencies.isActive, true)
      ))
      .orderBy(competencies.subjectName, competencies.displayOrder);
  }
  
  /**
   * Update a competency
   * SECURITY: Scoped to schoolId to prevent IDOR attacks
   */
  static async updateCompetency(
    id: number,
    schoolId: number,
    data: Partial<NewCompetency>
  ): Promise<Competency> {
    console.log('[COMPETENCY_SERVICE] Updating competency:', id, 'for school:', schoolId);
    
    // Verify ownership before update
    const [existing] = await db
      .select()
      .from(competencies)
      .where(and(
        eq(competencies.id, id),
        eq(competencies.schoolId, schoolId)
      ));
    
    if (!existing) {
      throw new Error('Competency not found or access denied');
    }
    
    const [updated] = await db
      .update(competencies)
      .set(data)
      .where(and(
        eq(competencies.id, id),
        eq(competencies.schoolId, schoolId)
      ))
      .returning();
    
    console.log('[COMPETENCY_SERVICE] ✅ Competency updated');
    return updated;
  }
  
  /**
   * Soft delete a competency (set isActive = false)
   * SECURITY: Scoped to schoolId to prevent IDOR attacks
   */
  static async deleteCompetency(id: number, schoolId: number): Promise<void> {
    console.log('[COMPETENCY_SERVICE] Soft deleting competency:', id, 'for school:', schoolId);
    
    // Verify ownership before delete
    const [existing] = await db
      .select()
      .from(competencies)
      .where(and(
        eq(competencies.id, id),
        eq(competencies.schoolId, schoolId)
      ));
    
    if (!existing) {
      throw new Error('Competency not found or access denied');
    }
    
    await db
      .update(competencies)
      .set({ isActive: false })
      .where(and(
        eq(competencies.id, id),
        eq(competencies.schoolId, schoolId)
      ));
    
    console.log('[COMPETENCY_SERVICE] ✅ Competency deleted');
  }
  
  /**
   * Assign a competency to a subject for specific form level
   * SECURITY: Verifies both subject and competency belong to the same school
   */
  static async assignCompetencyToSubject(
    data: NewSubjectCompetencyAssignment
  ): Promise<SubjectCompetencyAssignment> {
    console.log('[COMPETENCY_SERVICE] Assigning competency to subject:', data);
    
    // 🔒 SECURITY: Verify competency belongs to the school
    const [competency] = await db
      .select()
      .from(competencies)
      .where(and(
        eq(competencies.id, data.competencyId),
        eq(competencies.schoolId, data.schoolId)
      ));
    
    if (!competency) {
      throw new Error('Competency not found or access denied');
    }
    
    // 🔒 SECURITY: Verify subject belongs to the school
    const [subject] = await db
      .select()
      .from(subjects)
      .where(and(
        eq(subjects.id, data.subjectId),
        eq(subjects.schoolId, data.schoolId)
      ));
    
    if (!subject) {
      throw new Error('Subject not found or access denied');
    }
    
    const [assignment] = await db
      .insert(subjectCompetencyAssignments)
      .values(data)
      .returning();
    
    console.log('[COMPETENCY_SERVICE] ✅ Competency assigned');
    return assignment;
  }
  
  /**
   * Get all competency assignments for a subject
   * SECURITY: Scoped to schoolId for multi-tenant isolation
   */
  static async getSubjectCompetencyAssignments(
    schoolId: number,
    subjectId: number,
    formLevel?: string
  ): Promise<Array<SubjectCompetencyAssignment & { competency: Competency }>> {
    const conditions = [
      eq(subjectCompetencyAssignments.schoolId, schoolId),
      eq(subjectCompetencyAssignments.subjectId, subjectId)
    ];
    
    if (formLevel) {
      conditions.push(eq(subjectCompetencyAssignments.formLevel, formLevel));
    }
    
    const assignments = await db
      .select()
      .from(subjectCompetencyAssignments)
      .where(and(...conditions))
      .orderBy(subjectCompetencyAssignments.displayOrder);
    
    // Fetch competency details for each assignment
    const enriched = await Promise.all(
      assignments.map(async (assignment) => {
        const [competency] = await db
          .select()
          .from(competencies)
          .where(and(
            eq(competencies.id, assignment.competencyId),
            eq(competencies.schoolId, schoolId)
          ));
        
        return {
          ...assignment,
          competency
        };
      })
    );
    
    return enriched;
  }
  
  /**
   * Remove competency assignment from subject
   * SECURITY: Verifies school ownership before deletion
   */
  static async removeCompetencyAssignment(id: number, schoolId: number): Promise<void> {
    console.log('[COMPETENCY_SERVICE] Removing competency assignment:', id, 'for school:', schoolId);
    
    // 🔒 SECURITY: Verify ownership before delete
    const [existing] = await db
      .select()
      .from(subjectCompetencyAssignments)
      .where(and(
        eq(subjectCompetencyAssignments.id, id),
        eq(subjectCompetencyAssignments.schoolId, schoolId)
      ));
    
    if (!existing) {
      throw new Error('Assignment not found or access denied');
    }
    
    await db
      .delete(subjectCompetencyAssignments)
      .where(and(
        eq(subjectCompetencyAssignments.id, id),
        eq(subjectCompetencyAssignments.schoolId, schoolId)
      ));
    
    console.log('[COMPETENCY_SERVICE] ✅ Assignment removed');
  }
  
  /**
   * Get competencies with their assignments for bulletin generation
   * Returns competencies grouped by subject for a specific form level
   */
  static async getCompetenciesForBulletin(
    schoolId: number,
    subjectIds: number[],
    formLevel: string
  ): Promise<Map<number, Competency[]>> {
    console.log(`[COMPETENCY_SERVICE] Fetching competencies for ${subjectIds.length} subjects, form level: ${formLevel}`);
    
    const competenciesMap = new Map<number, Competency[]>();
    
    for (const subjectId of subjectIds) {
      const subjectCompetencies = await this.getCompetenciesBySubject(
        schoolId,
        subjectId,
        formLevel
      );
      
      if (subjectCompetencies.length > 0) {
        competenciesMap.set(subjectId, subjectCompetencies);
      }
    }
    
    console.log(`[COMPETENCY_SERVICE] ✅ Found competencies for ${competenciesMap.size} subjects`);
    return competenciesMap;
  }
  
  /**
   * Initialize default competencies for a subject
   * Useful for seeding common subjects like Math, English, etc.
   */
  static async initializeDefaultCompetencies(
    schoolId: number,
    subjectId: number,
    subjectName: string,
    formLevel: string,
    createdBy?: number
  ): Promise<Competency[]> {
    console.log(`[COMPETENCY_SERVICE] Initializing default competencies for ${subjectName} (${formLevel})`);
    
    // Check if competencies already exist
    const existing = await this.getCompetenciesBySubject(schoolId, subjectId, formLevel);
    if (existing.length > 0) {
      console.log('[COMPETENCY_SERVICE] ⚠️ Competencies already exist, skipping initialization');
      return existing;
    }
    
    // Default generic competencies (can be customized later)
    const defaultCompetencies = [
      {
        competencyTextFr: `Maîtriser les concepts fondamentaux de ${subjectName}`,
        competencyTextEn: `Master fundamental concepts of ${subjectName}`,
        category: 'general' as const,
        displayOrder: 1
      },
      {
        competencyTextFr: `Appliquer les connaissances de ${subjectName} dans des situations concrètes`,
        competencyTextEn: `Apply ${subjectName} knowledge in practical situations`,
        category: 'general' as const,
        displayOrder: 2
      }
    ];
    
    return await this.bulkCreateCompetencies(
      schoolId,
      subjectId,
      subjectName,
      formLevel,
      defaultCompetencies,
      createdBy
    );
  }
}

export default CompetencyService;

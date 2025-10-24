// ===== EDUCAFRIC NUMBER STORAGE =====
// Manages EDUCAFRIC number generation and assignment

import { db } from "../db";
import { educafricNumbers, educafricNumberCounters } from "../../shared/schema";
import { eq, and } from "drizzle-orm";

export class EducafricNumberStorage {
  
  // Generate next EDUCAFRIC number for a given type
  async generateNumber(type: 'school' | 'commercial', notes?: string): Promise<any> {
    try {
      // Map frontend types to database types
      const dbType = type === 'school' ? 'SC' : 'CO';
      const entityType = type === 'school' ? 'school' : 'user';

      // Get or create counter
      let counter = await db
        .select()
        .from(educafricNumberCounters)
        .where(eq(educafricNumberCounters.type, dbType))
        .limit(1);

      if (!counter || counter.length === 0) {
        // Initialize counter if it doesn't exist
        await db.insert(educafricNumberCounters).values({
          type: dbType
        } as any);
        counter = [{ id: 1, type: dbType, currentCounter: 0, lastGenerated: null, updatedAt: new Date() }];
      }

      // Increment counter
      const nextCounter = (counter[0].currentCounter || 0) + 1;
      const educafricNumber = `EDU-CM-${dbType}-${String(nextCounter).padStart(4, '0')}`;

      // Update counter
      await db
        .update(educafricNumberCounters)
        .set({
          currentCounter: nextCounter,
          lastGenerated: educafricNumber
        } as any)
        .where(eq(educafricNumberCounters.type, dbType));

      // Create number record
      const newNumber = await db
        .insert(educafricNumbers)
        .values({
          educafricNumber,
          type: dbType,
          entityType,
          notes: notes || null
        } as any)
        .returning();

      return newNumber[0];
    } catch (error) {
      console.error('[EDUCAFRIC_NUMBER_STORAGE] Error generating number:', error);
      throw error;
    }
  }

  // Get all numbers by type
  async getNumbersByType(type: 'school' | 'commercial'): Promise<any[]> {
    try {
      const dbType = type === 'school' ? 'SC' : 'CO';
      
      const numbers = await db
        .select({
          id: educafricNumbers.id,
          educafricNumber: educafricNumbers.educafricNumber,
          status: educafricNumbers.status,
          entityId: educafricNumbers.entityId,
          notes: educafricNumbers.notes,
          createdAt: educafricNumbers.createdAt
        })
        .from(educafricNumbers)
        .where(eq(educafricNumbers.type, dbType));

      // For school numbers, we could join with schools table to get school info
      // For commercial numbers, we could join with users table to get commercial info
      // For now, return basic info
      return numbers.map(num => ({
        ...num,
        schoolName: null, // TODO: Join with schools table when entityId is set
        schoolEmail: null,
        userName: null, // TODO: Join with users table when entityId is set
        userLastName: null,
        userEmail: null
      }));
    } catch (error) {
      console.error('[EDUCAFRIC_NUMBER_STORAGE] Error fetching numbers:', error);
      throw error;
    }
  }

  // Get counter statistics
  async getCounterStats(): Promise<any[]> {
    try {
      const counters = await db
        .select()
        .from(educafricNumberCounters);

      return counters.map(counter => {
        const typeLabel = counter.type === 'SC' ? 'Schools' : 
                          counter.type === 'CO' ? 'Commercials' : 
                          counter.type === 'TE' ? 'Teachers' : 
                          counter.type === 'ST' ? 'Students' : 
                          counter.type;

        const nextNumber = `EDU-CM-${counter.type}-${String((counter.currentCounter || 0) + 1).padStart(4, '0')}`;

        return {
          type: counter.type,
          label: typeLabel,
          currentCounter: counter.currentCounter || 0,
          lastGenerated: counter.lastGenerated,
          nextNumber
        };
      });
    } catch (error) {
      console.error('[EDUCAFRIC_NUMBER_STORAGE] Error fetching counter stats:', error);
      throw error;
    }
  }

  // Update number status and notes
  async updateNumber(id: number, updates: { status?: string; notes?: string }): Promise<any> {
    try {
      const updated = await db
        .update(educafricNumbers)
        .set({
          ...updates
        } as any)
        .where(eq(educafricNumbers.id, id))
        .returning();

      return updated[0];
    } catch (error) {
      console.error('[EDUCAFRIC_NUMBER_STORAGE] Error updating number:', error);
      throw error;
    }
  }

  // Delete number (only if not assigned to an entity)
  async deleteNumber(id: number): Promise<void> {
    try {
      // Check if number is assigned
      const number = await db
        .select()
        .from(educafricNumbers)
        .where(eq(educafricNumbers.id, id))
        .limit(1);

      if (number && number.length > 0 && number[0].entityId) {
        throw new Error('Cannot delete an assigned EDUCAFRIC number');
      }

      await db
        .delete(educafricNumbers)
        .where(eq(educafricNumbers.id, id));
    } catch (error) {
      console.error('[EDUCAFRIC_NUMBER_STORAGE] Error deleting number:', error);
      throw error;
    }
  }

  // Assign number to entity (school or user)
  async assignNumber(educafricNumber: string, entityId: number): Promise<any> {
    try {
      const updated = await db
        .update(educafricNumbers)
        .set({
          entityId
        } as any)
        .where(eq(educafricNumbers.educafricNumber, educafricNumber))
        .returning();

      return updated[0];
    } catch (error) {
      console.error('[EDUCAFRIC_NUMBER_STORAGE] Error assigning number:', error);
      throw error;
    }
  }
}

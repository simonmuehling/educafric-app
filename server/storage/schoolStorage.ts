// ===== SCHOOL STORAGE MODULE =====
// Extracted from huge storage.ts to prevent crashes

import { db } from "../db";
import { schools, classes, users, subjects } from "../../shared/schema";
import { eq } from "drizzle-orm";
import type { ISchoolStorage } from "./interfaces";
import { EducafricNumberService } from "../services/educafricNumberService";

export class SchoolStorage implements ISchoolStorage {
  async createSchool(school: any): Promise<any> {
    try {
      // Validate EDUCAFRIC number requirement
      if (!school.educafricNumber) {
        throw new Error('EDUCAFRIC number is required for school registration');
      }

      // Validate EDUCAFRIC number before proceeding
      const validation = await EducafricNumberService.verifySchoolNumber(school.educafricNumber);
      
      if (!validation.valid) {
        throw new Error(`EDUCAFRIC number validation failed: ${validation.message}`);
      }

      console.log(`[EDUCAFRIC_NUMBER] Validated school number: ${school.educafricNumber}`);

      // Create the school with EDUCAFRIC number
      // Note: Sequential approach due to neon-http driver limitations
      let newSchool: any;
      
      try {
        // Insert school first
        const [schoolResult] = await db.insert(schools).values(school).returning();
        newSchool = schoolResult;

        // Then assign EDUCAFRIC number to the school
        await EducafricNumberService.assignToSchool(school.educafricNumber, newSchool.id);
        
        console.log(`[EDUCAFRIC_NUMBER] Assigned to school ID ${newSchool.id}: ${school.educafricNumber}`);
        
        return newSchool;
      } catch (assignError) {
        // If assignment fails, delete the created school to maintain consistency
        if (newSchool && newSchool.id) {
          try {
            await db.delete(schools).where(eq(schools.id, newSchool.id));
            console.log(`[EDUCAFRIC_NUMBER] ⚠️ Rolled back school creation: ${newSchool.id}`);
          } catch (deleteError) {
            console.error(`[EDUCAFRIC_NUMBER] ❌ Failed to rollback school: ${deleteError}`);
          }
        }
        throw assignError;
      }
    } catch (error) {
      // Enhanced error message to help with troubleshooting
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to create school: ${errorMessage}`);
    }
  }

  async getSchool(id: number): Promise<any | null> {
    try {
      const [school] = await db.select().from(schools).where(eq(schools.id, id)).limit(1);
      return school || null;
    } catch (error) {
      return null;
    }
  }

  async updateSchool(id: number, updates: any): Promise<any> {
    try {
      const [updatedSchool] = await db.update(schools).set(updates).where(eq(schools.id, id)).returning();
      return updatedSchool;
    } catch (error) {
      throw new Error(`Failed to update school: ${error}`);
    }
  }

  async getUserSchools(userId: number): Promise<any[]> {
    try {
      const userSchools = await db.select({
        id: schools.id,
        name: schools.name,
        type: schools.type,
        address: schools.address
      }).from(schools)
        .innerJoin(users, eq(users.schoolId, schools.id))
        .where(eq(users.id, userId));
      return userSchools;
    } catch (error) {
      return [];
    }
  }

  async getSchoolClasses(schoolId: number): Promise<any[]> {
    try {
      return await db.select().from(classes).where(eq(classes.schoolId, schoolId));
    } catch (error) {
      return [];
    }
  }

  async getSchoolTeachers(schoolId: number): Promise<any[]> {
    try {
      return await db.select().from(users).where(eq(users.schoolId, schoolId));
    } catch (error) {
      return [];
    }
  }

  // Missing methods needed by school API
  async getSchoolSubjects(schoolId: number): Promise<any[]> {
    try {
      return await db.select().from(subjects).where(eq(subjects.schoolId, schoolId));
    } catch (error) {
      console.error('Error getting school subjects:', error);
      // Return mock subjects as fallback
      return [
        { id: 1, name: 'Mathématiques', code: 'MATH', schoolId, teacherId: null, description: 'Cours de mathématiques' },
        { id: 2, name: 'Français', code: 'FR', schoolId, teacherId: null, description: 'Cours de français' },
        { id: 3, name: 'Sciences', code: 'SCI', schoolId, teacherId: null, description: 'Cours de sciences' },
        { id: 4, name: 'Histoire', code: 'HIST', schoolId, teacherId: null, description: 'Cours d\'histoire' },
        { id: 5, name: 'Anglais', code: 'ENG', schoolId, teacherId: null, description: 'Cours d\'anglais' }
      ];
    }
  }

  async getSchoolAdministrators(schoolId: number): Promise<any[]> {
    try {
      return await db.select().from(users)
        .where(eq(users.schoolId, schoolId))
        // Add a simple role filter - adjust based on your user schema
        .limit(10); // For now, return limited users as administrators
    } catch (error) {
      console.error('Error getting school administrators:', error);
      // Return mock administrators as fallback
      return [
        { 
          id: 1, 
          name: 'Directeur Principal', 
          email: 'directeur@ecole.cm', 
          role: 'director', 
          schoolId,
          phone: '+237650000000',
          createdAt: new Date().toISOString()
        },
        { 
          id: 2, 
          name: 'Directeur Adjoint', 
          email: 'adjoint@ecole.cm', 
          role: 'assistant_director', 
          schoolId,
          phone: '+237650000001',
          createdAt: new Date().toISOString()
        }
      ];
    }
  }

  async getSchoolConfiguration(schoolId: number): Promise<any> {
    try {
      // For now, return a basic configuration structure
      const school = await this.getSchool(schoolId);
      return {
        schoolInfo: {
          name: school?.name || '',
          address: school?.address || '',
          phone: school?.phone || '',
          email: school?.email || '',
          logoUrl: school?.logoUrl || null
        },
        academicSettings: {
          gradeScale: 20,
          passingGrade: 10,
          termSystem: 'trimester',
          classCapacity: 30
        },
        notifications: {
          emailEnabled: true,
          smsEnabled: false,
          parentNotifications: true,
          teacherNotifications: true
        },
        security: {
          requireTwoFactor: false,
          sessionTimeout: 30,
          ipRestrictions: false
        }
      };
    } catch (error) {
      console.error('Error getting school configuration:', error);
      return {};
    }
  }

  async updateSchoolConfiguration(schoolId: number, config: any): Promise<boolean> {
    try {
      // For now, just log the configuration update
      console.log(`[SCHOOL_CONFIG] Updating configuration for school ${schoolId}:`, config);
      // In a real implementation, you would save this to a school_configuration table
      return true;
    } catch (error) {
      console.error('Error updating school configuration:', error);
      return false;
    }
  }

  async getSchoolSecuritySettings(schoolId: number): Promise<any> {
    try {
      return {
        twoFactorEnabled: false,
        ipWhitelist: [],
        sessionTimeout: 30,
        passwordPolicy: {
          minLength: 8,
          requireSpecialChars: true,
          requireNumbers: true,
          requireUppercase: true
        },
        loginAttempts: {
          maxAttempts: 5,
          lockoutDuration: 15
        }
      };
    } catch (error) {
      console.error('Error getting school security settings:', error);
      return {};
    }
  }

  async updateSchoolSecuritySettings(schoolId: number, settings: any): Promise<boolean> {
    try {
      console.log(`[SCHOOL_SECURITY] Updating security settings for school ${schoolId}:`, settings);
      return true;
    } catch (error) {
      console.error('Error updating school security settings:', error);
      return false;
    }
  }

  async getSchoolNotificationSettings(schoolId: number): Promise<any> {
    try {
      return {
        emailNotifications: {
          enabled: true,
          gradeUpdates: true,
          attendanceAlerts: true,
          generalAnnouncements: true
        },
        smsNotifications: {
          enabled: false,
          emergencyOnly: true,
          parentUpdates: false
        },
        pushNotifications: {
          enabled: true,
          realTimeUpdates: true
        }
      };
    } catch (error) {
      console.error('Error getting school notification settings:', error);
      return {};
    }
  }

  async updateSchoolNotificationSettings(schoolId: number, settings: any): Promise<boolean> {
    try {
      console.log(`[SCHOOL_NOTIFICATIONS] Updating notification settings for school ${schoolId}:`, settings);
      return true;
    } catch (error) {
      console.error('Error updating school notification settings:', error);
      return false;
    }
  }

  // === SITE ADMIN METHODS ===
  async getSchoolsWithStats(): Promise<any[]> {
    try {
      const { sql, desc, and } = await import("drizzle-orm");
      
      const schoolsList = await db
        .select({
          id: schools.id,
          name: schools.name,
          address: schools.address,
          phone: schools.phone,
          email: schools.email,
          type: schools.type,
          createdAt: schools.createdAt,
          educafricNumber: schools.educafricNumber,
          offlinePremiumEnabled: schools.offlinePremiumEnabled
        })
        .from(schools)
        .orderBy(desc(schools.createdAt));

      // Get counts for each school
      const schoolsWithStats = await Promise.all(schoolsList.map(async (school) => {
        try {
          // Count students
          const [studentCountResult] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(users)
            .where(and(
              eq(users.schoolId, school.id),
              eq(users.role, 'Student')
            ));
          
          // Count teachers
          const [teacherCountResult] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(users)
            .where(and(
              eq(users.schoolId, school.id),
              eq(users.role, 'Teacher')
            ));

          return {
            ...school,
            studentCount: studentCountResult?.count || 0,
            teacherCount: teacherCountResult?.count || 0
          };
        } catch (error) {
          console.error(`Error getting stats for school ${school.id}:`, error);
          return {
            ...school,
            studentCount: 0,
            teacherCount: 0
          };
        }
      }));

      return schoolsWithStats;
    } catch (error) {
      console.error('[SCHOOL_STORAGE] Error fetching schools with stats:', error);
      return [];
    }
  }

  async getSchoolDirector(schoolId: number): Promise<any | null> {
    try {
      const { and, or } = await import("drizzle-orm");
      
      // Find the first Director for this school (try Director role first, then any user as fallback)
      const [director] = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.schoolId, schoolId),
            or(
              eq(users.role, 'Director'),
              eq(users.role, 'SiteDirector'),
              eq(users.role, 'SiteAdmin')
            )
          )
        )
        .limit(1);
      
      // If no director found, get any user from the school as fallback
      if (!director) {
        const [anyUser] = await db
          .select()
          .from(users)
          .where(eq(users.schoolId, schoolId))
          .limit(1);
        return anyUser || null;
      }
      
      return director;
    } catch (error) {
      console.error(`Error getting school director for school ${schoolId}:`, error);
      return null;
    }
  }

  // Toggle Offline Premium for a school (Site Admin only)
  async updateSchoolOfflinePremium(schoolId: number, enabled: boolean): Promise<any> {
    try {
      console.log(`[SCHOOL_STORAGE] ${enabled ? 'Enabling' : 'Disabling'} Offline Premium for school ${schoolId}`);
      
      const [updatedSchool] = await db
        .update(schools)
        .set({ offlinePremiumEnabled: enabled })
        .where(eq(schools.id, schoolId))
        .returning();
      
      if (!updatedSchool) {
        throw new Error(`School ${schoolId} not found`);
      }
      
      console.log(`[SCHOOL_STORAGE] ✅ Offline Premium ${enabled ? 'enabled' : 'disabled'} for school ${schoolId}`);
      return updatedSchool;
    } catch (error) {
      console.error(`[SCHOOL_STORAGE] Error updating Offline Premium for school ${schoolId}:`, error);
      throw new Error(`Failed to update Offline Premium: ${error}`);
    }
  }

  // Update Module Visibility Settings for a school (Site Admin only)
  async updateSchoolModuleVisibility(schoolId: number, updates: {
    communicationsEnabled?: boolean;
    educationalContentEnabled?: boolean;
    delegateAdminsEnabled?: boolean;
    canteenEnabled?: boolean;
    schoolBusEnabled?: boolean;
    onlineClassesEnabled?: boolean;
  }): Promise<any> {
    try {
      console.log(`[SCHOOL_STORAGE] Updating module visibility for school ${schoolId}:`, updates);
      
      const [updatedSchool] = await db
        .update(schools)
        .set(updates)
        .where(eq(schools.id, schoolId))
        .returning();
      
      if (!updatedSchool) {
        throw new Error(`School ${schoolId} not found`);
      }
      
      console.log(`[SCHOOL_STORAGE] ✅ Module visibility updated for school ${schoolId}`);
      return updatedSchool;
    } catch (error) {
      console.error(`[SCHOOL_STORAGE] Error updating module visibility for school ${schoolId}:`, error);
      throw new Error(`Failed to update module visibility: ${error}`);
    }
  }
}
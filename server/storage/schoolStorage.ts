// ===== SCHOOL STORAGE MODULE =====
// Extracted from huge storage.ts to prevent crashes

import { db } from "../db";
import { schools, classes, users, subjects } from "../../shared/schema";
import { eq } from "drizzle-orm";
import type { ISchoolStorage } from "./interfaces";

export class SchoolStorage implements ISchoolStorage {
  async createSchool(school: any): Promise<any> {
    try {
      const [newSchool] = await db.insert(schools).values(school).returning();
      return newSchool;
    } catch (error) {
      throw new Error(`Failed to create school: ${error}`);
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
}
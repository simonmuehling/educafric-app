import { storage } from "../storage";
import { User } from "@shared/schema";
import { eq, or, and } from "drizzle-orm";

export interface RoleAffiliation {
  type: 'school' | 'teacher' | 'parent' | 'student';
  id: number;
  name: string;
  role: string;
  details: {
    schoolName?: string;
    teacherName?: string;
    studentName?: string;
    className?: string;
    position?: string;
  };
}

export interface MultiRoleSuggestion {
  canJoin: boolean;
  existingRoles: string[];
  suggestedRoles: {
    role: string;
    reason: string;
    affiliationId: number;
    affiliationName: string;
  }[];
  conflictingRoles: string[];
}

export class MultiRoleDetectionService {
  static async detectPotentialRoles(phoneNumber: string, email: string): Promise<MultiRoleSuggestion> {
    const affiliations = await this.findAffiliationsByPhone(phoneNumber);
    const existingUser = await storage.getUserByPhone(phoneNumber);
    
    const existingRoles = existingUser ? [existingUser.role] : [];
    const suggestedRoles: MultiRoleSuggestion['suggestedRoles'] = [];
    const conflictingRoles: string[] = [];

    // Analyze each affiliation to suggest appropriate roles
    for (const affiliation of affiliations) {
      const suggestions = this.analyzePotentialRoles(affiliation, existingRoles);
      suggestedRoles.push(...suggestions.suggested);
      conflictingRoles.push(...suggestions.conflicting);
    }

    return {
      canJoin: suggestedRoles.length > 0,
      existingRoles,
      suggestedRoles: this.deduplicateRoles(suggestedRoles),
      conflictingRoles: Array.from(new Set(conflictingRoles))
    };
  }

  private static async findAffiliationsByPhone(phoneNumber: string): Promise<RoleAffiliation[]> {
    const affiliations: RoleAffiliation[] = [];

    try {
      // Check if phone exists in schools (as admin/director contact)
      const schools = await storage.getSchoolsByContact(phoneNumber);
      for (const school of schools) {
        affiliations.push({
          type: 'school',
          id: school.id,
          name: school.name,
          role: school.adminPhone === phoneNumber ? 'Director' : 'Admin',
          details: {
            schoolName: school.name,
            position: school.adminPhone === phoneNumber ? 'Directeur' : 'Administrateur'
          }
        });
      }

      // Check if phone exists as teacher contact
      const teachers = await storage.getTeachersByPhone(phoneNumber);
      for (const teacher of teachers) {
        affiliations.push({
          type: 'teacher',
          id: teacher.id,
          name: teacher.name,
          role: 'Teacher',
          details: {
            teacherName: teacher.name,
            schoolName: teacher.schoolName,
            position: teacher.position || 'Enseignant'
          }
        });
      }

      // Check if phone exists as parent contact
      const parentContacts = await storage.getParentContactsByPhone(phoneNumber);
      for (const contact of parentContacts) {
        affiliations.push({
          type: 'parent',
          id: contact.parentId,
          name: contact.parentName,
          role: 'Parent',
          details: {
            studentName: contact.studentName,
            className: contact.className,
            schoolName: contact.schoolName
          }
        });
      }

      // Check if phone exists as student emergency contact
      const studentContacts = await storage.getStudentsByEmergencyPhone(phoneNumber);
      for (const student of studentContacts) {
        affiliations.push({
          type: 'student',
          id: student.id,
          name: student.name,
          role: 'Student',
          details: {
            studentName: student.name,
            className: student.className,
            schoolName: student.schoolName
          }
        });
      }

    } catch (error) {
      console.error('[MULTI_ROLE] Error finding affiliations:', error);
    }

    return affiliations;
  }

  private static analyzePotentialRoles(
    affiliation: RoleAffiliation, 
    existingRoles: string[]
  ): { suggested: MultiRoleSuggestion['suggestedRoles'], conflicting: string[] } {
    const suggested: MultiRoleSuggestion['suggestedRoles'] = [];
    const conflicting: string[] = [];

    const roleMapping = {
      'school': ['Director', 'Admin'],
      'teacher': ['Teacher', 'Freelancer'],
      'parent': ['Parent'],
      'student': ['Student']
    };

    const potentialRoles = roleMapping[affiliation.type] || [];

    for (const role of potentialRoles) {
      if (existingRoles.includes(role)) {
        // User already has this role, check for multi-school scenarios
        if (role === 'Teacher' && affiliation.type === 'teacher') {
          suggested.push({
            role: 'Teacher',
            reason: `Ajouter l'école ${affiliation.details.schoolName} à votre profil enseignant`,
            affiliationId: affiliation.id,
            affiliationName: affiliation.details.schoolName || affiliation.name
          });
        }
        continue;
      }

      // Check for role conflicts
      const hasConflict = this.checkRoleConflict(role, existingRoles);
      if (hasConflict) {
        conflicting.push(role);
        continue;
      }

      // Generate suggestion based on affiliation type
      let reason = '';
      switch (affiliation.type) {
        case 'school':
          reason = `Rejoindre l'école ${affiliation.details.schoolName} en tant que ${role === 'Director' ? 'Directeur' : 'Administrateur'}`;
          break;
        case 'teacher':
          reason = `Activer votre profil enseignant à ${affiliation.details.schoolName}`;
          break;
        case 'parent':
          reason = `Rejoindre en tant que parent de ${affiliation.details.studentName} (${affiliation.details.className})`;
          break;
        case 'student':
          reason = `Créer votre profil étudiant à ${affiliation.details.schoolName}`;
          break;
      }

      suggested.push({
        role,
        reason,
        affiliationId: affiliation.id,
        affiliationName: affiliation.details.schoolName || affiliation.name
      });
    }

    return { suggested, conflicting };
  }

  private static checkRoleConflict(newRole: string, existingRoles: string[]): boolean {
    const conflictMatrix: { [key: string]: string[] } = {
      'Student': ['Teacher', 'Director', 'Admin'], // Students can't be staff
      'SiteAdmin': ['Student'], // Site admins can't be students
    };

    return existingRoles.some(existing => 
      conflictMatrix[newRole]?.includes(existing) || 
      conflictMatrix[existing]?.includes(newRole)
    );
  }

  private static deduplicateRoles(roles: MultiRoleSuggestion['suggestedRoles']): MultiRoleSuggestion['suggestedRoles'] {
    const seen = new Set<string>();
    return roles.filter(role => {
      const key = `${role.role}_${role.affiliationId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  static async createMultiRoleUser(
    userData: any, 
    selectedRoles: { role: string; affiliationId: number; affiliationName: string }[]
  ): Promise<any> {
    // Create primary user account
    const primaryRole = selectedRoles[0];
    const user = await storage.createUser({
      ...userData,
      role: primaryRole.role,
      schoolId: primaryRole.role.includes('Teacher') || primaryRole.role.includes('Director') || primaryRole.role.includes('Admin') 
        ? primaryRole.affiliationId : undefined
    });

    // Create additional role entries for multi-role scenarios
    for (let i = 1; i < selectedRoles.length; i++) {
      const additionalRole = selectedRoles[i];
      await this.addSecondaryRole(user.id, additionalRole);
    }

    return user;
  }

  private static async addSecondaryRole(
    userId: number, 
    roleData: { role: string; affiliationId: number; affiliationName: string }
  ): Promise<void> {
    // Add to user_roles table for multi-role management
    await storage.addUserRole(userId, {
      role: roleData.role,
      schoolId: roleData.role.includes('Teacher') || roleData.role.includes('Director') || roleData.role.includes('Admin') 
        ? roleData.affiliationId : undefined,
      isActive: true,
      createdAt: new Date()
    });
  }

  static async getMultiRoleOptions(userId: number): Promise<{
    primaryRole: string;
    secondaryRoles: { role: string; schoolName: string; isActive: boolean }[];
    availableSchools: { id: number; name: string; canJoinAs: string[] }[];
  }> {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const secondaryRoles = await storage.getUserRoles(userId);
    const availableSchools = await storage.getSchoolsUserCanJoin(user.phone);

    return {
      primaryRole: user.role,
      secondaryRoles,
      availableSchools
    };
  }
}
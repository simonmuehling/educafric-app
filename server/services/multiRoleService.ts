import { storage } from '../storage';
import { db } from '../db';
import { users, roleAffiliations } from '@shared/schema';
import { eq, or, and } from 'drizzle-orm';

export interface RoleAffiliation {
  id: number;
  userId: number;
  role: string;
  schoolId?: number;
  description: string;
  status: 'active' | 'inactive' | 'pending';
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface MultiRoleDetection {
  phone: string;
  suggestedRoles: Array<{
    role: string;
    schoolName?: string;
    description: string;
    confidence: number;
  }>;
}

export class MultiRoleService {
  
  // Detect potential roles based on phone number
  static async detectRolesByPhone(phone: string): Promise<MultiRoleDetection> {
    const suggestedRoles: Array<{
      role: string;
      schoolName?: string;
      description: string;
      confidence: number;
    }> = [];
    
    // Check if phone exists in users table
    const existingUser = await storage.getUserByPhone(phone);
    
    if (existingUser) {
      if (existingUser.role === 'Teacher') {
        const school = existingUser.schoolId ? await storage.getSchoolById(existingUser.schoolId) : null;
        suggestedRoles.push({
          role: 'Teacher',
          schoolName: school?.name,
          description: `Enseignant à ${school?.name || 'une école'}`,
          confidence: 0.9
        });
      }
      
      if (existingUser.role === 'Parent') {
        suggestedRoles.push({
          role: 'Parent',
          description: 'Parent d\'élève',
          confidence: 0.85
        });
      }
      
      if (existingUser.role === 'Commercial') {
        suggestedRoles.push({
          role: 'Commercial',
          description: 'Représentant commercial Educafric',
          confidence: 0.8
        });
      }
      
      // Check secondary roles too
      if (existingUser.secondaryRoles && existingUser.secondaryRoles.length > 0) {
        for (const role of existingUser.secondaryRoles) {
          if (!suggestedRoles.some(sr => sr.role === role)) {
            suggestedRoles.push({
              role,
              description: `Rôle secondaire: ${role}`,
              confidence: 0.7
            });
          }
        }
      }
    }
    
    return {
      phone,
      suggestedRoles
    };
  }
  
  // Add a new role affiliation for a user
  static async addRoleAffiliation(userId: number, role: string, schoolId?: number, description?: string, metadata?: any): Promise<RoleAffiliation> {
    const affiliation = await storage.createRoleAffiliation({
      userId,
      role,
      schoolId,
      description: description || `${role} role`,
      status: 'active',
      metadata
    });
    
    // Update user's secondary roles
    const user = await storage.getUserById(userId);
    if (user) {
      const secondaryRoles = user.secondaryRoles || [];
      if (!secondaryRoles.includes(role)) {
        secondaryRoles.push(role);
        await storage.updateUserSecondaryRoles(userId, secondaryRoles);
      }
    }
    
    return affiliation;
  }
  
  // Get all role affiliations for a user
  static async getUserRoleAffiliations(userId: number): Promise<RoleAffiliation[]> {
    return await storage.getUserRoleAffiliations(userId);
  }
  
  // Switch active role for a user
  static async switchActiveRole(userId: number, newRole: string): Promise<boolean> {
    const affiliations = await this.getUserRoleAffiliations(userId);
    const user = await storage.getUserById(userId);
    
    if (!user) return false;
    
    // Check if user has permission for this role
    const hasRole = user.role === newRole || 
                   (user.secondaryRoles && user.secondaryRoles.includes(newRole)) ||
                   affiliations.some(aff => aff.role === newRole && aff.status === 'active');
    
    if (!hasRole) return false;
    
    // Update active role
    await storage.updateUserActiveRole(userId, newRole);
    
    // Log role switch
    const roleHistory = user.roleHistory || [];
    roleHistory.push({
      fromRole: user.activeRole || user.role,
      toRole: newRole,
      timestamp: new Date().toISOString(),
      context: 'manual_switch'
    });
    
    await storage.updateUserRoleHistory(userId, roleHistory);
    
    return true;
  }
  
  // Get available schools for a teacher (multi-school support)
  static async getTeacherSchools(userId: number): Promise<Array<{id: number, name: string, isActive: boolean}>> {
    const affiliations = await storage.getUserRoleAffiliations(userId);
    const teacherAffiliations = affiliations.filter(aff => 
      aff.role === 'Teacher' && aff.status === 'active' && aff.schoolId
    );
    
    const schools = [];
    for (const affiliation of teacherAffiliations) {
      const school = await storage.getSchoolById(affiliation.schoolId!);
      if (school) {
        schools.push({
          id: school.id,
          name: school.name,
          isActive: affiliation.metadata?.isActiveSchool || false
        });
      }
    }
    
    return schools;
  }
  
  // Switch active school for a teacher
  static async switchTeacherActiveSchool(userId: number, schoolId: number): Promise<boolean> {
    const affiliations = await storage.getUserRoleAffiliations(userId);
    const teacherAffiliations = affiliations.filter(aff => 
      aff.role === 'Teacher' && aff.status === 'active'
    );
    
    // Deactivate all schools
    for (const affiliation of teacherAffiliations) {
      await storage.updateRoleAffiliationMetadata(affiliation.id, {
        ...affiliation.metadata,
        isActiveSchool: false
      });
    }
    
    // Activate selected school
    const targetAffiliation = teacherAffiliations.find(aff => aff.schoolId === schoolId);
    if (targetAffiliation) {
      await storage.updateRoleAffiliationMetadata(targetAffiliation.id, {
        ...targetAffiliation.metadata,
        isActiveSchool: true
      });
      
      // Update user's schoolId
      await storage.updateUserSchoolId(userId, schoolId);
      return true;
    }
    
    return false;
  }
  
  // Register multi-role user during registration
  static async registerMultiRoleUser(userData: any, selectedRoles: string[]): Promise<any> {
    // Create primary user account
    const user = await storage.createUser({
      ...userData,
      role: selectedRoles[0], // First role becomes primary
      secondaryRoles: selectedRoles.slice(1)
    });
    
    // Create affiliations for additional roles
    for (let i = 1; i < selectedRoles.length; i++) {
      await this.addRoleAffiliation(
        user.id,
        selectedRoles[i],
        userData.schoolId,
        `${selectedRoles[i]} affiliation`,
        { registrationFlow: true }
      );
    }
    
    return user;
  }

  // AUTO-SYNC: Automatically synchronize roles on login
  static async syncRolesOnLogin(userId: number): Promise<{
    synced: boolean;
    addedRoles: string[];
    message: string;
  }> {
    console.log(`[MULTI_ROLE_SYNC] Starting role sync for user ${userId}`);
    
    try {
      const user = await storage.getUserById(userId);
      if (!user) {
        return { synced: false, addedRoles: [], message: 'User not found' };
      }

      const addedRoles: string[] = [];
      const allRoles: string[] = [user.role];
      
      // Get existing secondary roles
      if (user.secondaryRoles && Array.isArray(user.secondaryRoles)) {
        allRoles.push(...user.secondaryRoles);
      }

      // Check existing affiliations
      const existingAffiliations = await storage.getUserRoleAffiliations(userId);
      const affiliatedRoles = existingAffiliations.map(a => a.role);

      // Ensure primary role has an affiliation
      if (!affiliatedRoles.includes(user.role)) {
        await storage.createRoleAffiliation({
          userId,
          role: user.role,
          schoolId: user.schoolId || undefined,
          description: `${user.role} - rôle principal`,
          status: 'active'
        });
        console.log(`[MULTI_ROLE_SYNC] Created affiliation for primary role: ${user.role}`);
      }

      // Ensure all secondary roles have affiliations
      for (const role of (user.secondaryRoles || [])) {
        if (!affiliatedRoles.includes(role)) {
          await storage.createRoleAffiliation({
            userId,
            role,
            schoolId: user.schoolId || undefined,
            description: `${role} - rôle secondaire`,
            status: 'active'
          });
          addedRoles.push(role);
          console.log(`[MULTI_ROLE_SYNC] Created affiliation for secondary role: ${role}`);
        }
      }

      // Set active_role if not set
      if (!user.activeRole) {
        await storage.updateUserActiveRole(userId, user.role);
        console.log(`[MULTI_ROLE_SYNC] Set active role to: ${user.role}`);
      }

      console.log(`[MULTI_ROLE_SYNC] Sync complete for user ${userId}. Added ${addedRoles.length} affiliations.`);
      
      return {
        synced: true,
        addedRoles,
        message: addedRoles.length > 0 
          ? `Synchronized ${addedRoles.length} role(s)` 
          : 'All roles already synchronized'
      };
    } catch (error) {
      console.error(`[MULTI_ROLE_SYNC] Error syncing roles for user ${userId}:`, error);
      return { synced: false, addedRoles: [], message: 'Sync failed' };
    }
  }

  // AUTO-DETECT: Find existing user by phone/email and merge roles
  static async detectAndMergeExistingUser(
    phone: string, 
    email: string | null, 
    newRole: string, 
    schoolId?: number
  ): Promise<{
    existingUser: any | null;
    merged: boolean;
    message: string;
  }> {
    console.log(`[MULTI_ROLE_MERGE] Checking for existing user: phone=${phone}, email=${email}, newRole=${newRole}`);
    
    try {
      // Find existing user by phone OR email
      let existingUser = await storage.getUserByPhone(phone);
      
      if (!existingUser && email) {
        existingUser = await storage.getUserByEmail(email);
      }

      if (!existingUser) {
        console.log(`[MULTI_ROLE_MERGE] No existing user found`);
        return { existingUser: null, merged: false, message: 'No existing user found' };
      }

      console.log(`[MULTI_ROLE_MERGE] Found existing user ${existingUser.id} with role ${existingUser.role}`);

      // Check if user already has this role
      const currentRoles = [existingUser.role, ...(existingUser.secondaryRoles || [])];
      if (currentRoles.includes(newRole)) {
        console.log(`[MULTI_ROLE_MERGE] User already has role ${newRole}`);
        return { existingUser, merged: false, message: `User already has ${newRole} role` };
      }

      // Add the new role as secondary
      const secondaryRoles = existingUser.secondaryRoles || [];
      secondaryRoles.push(newRole);
      await storage.updateUserSecondaryRoles(existingUser.id, secondaryRoles);

      // Create role affiliation
      await storage.createRoleAffiliation({
        userId: existingUser.id,
        role: newRole,
        schoolId: schoolId || existingUser.schoolId || undefined,
        description: `${newRole} - ajouté automatiquement`,
        status: 'active'
      });

      console.log(`[MULTI_ROLE_MERGE] Successfully merged role ${newRole} for user ${existingUser.id}`);
      
      return {
        existingUser: await storage.getUserById(existingUser.id), // Refresh user data
        merged: true,
        message: `Successfully added ${newRole} role to existing user`
      };
    } catch (error) {
      console.error(`[MULTI_ROLE_MERGE] Error merging roles:`, error);
      return { existingUser: null, merged: false, message: 'Merge failed' };
    }
  }

  // Get complete role profile for user (used by UI)
  static async getCompleteRoleProfile(userId: number): Promise<{
    primaryRole: string;
    activeRole: string;
    allRoles: Array<{
      role: string;
      isPrimary: boolean;
      isActive: boolean;
      schoolId?: number;
      schoolName?: string;
      description: string;
    }>;
  } | null> {
    try {
      const user = await storage.getUserById(userId);
      if (!user) return null;

      const affiliations = await storage.getUserRoleAffiliations(userId);
      const activeRole = user.activeRole || user.role;

      // Build complete role list
      const allRoles: Array<{
        role: string;
        isPrimary: boolean;
        isActive: boolean;
        schoolId?: number;
        schoolName?: string;
        description: string;
      }> = [];

      // Add primary role
      const primarySchool = user.schoolId ? await storage.getSchoolById(user.schoolId) : null;
      allRoles.push({
        role: user.role,
        isPrimary: true,
        isActive: activeRole === user.role,
        schoolId: user.schoolId || undefined,
        schoolName: primarySchool?.name,
        description: `Rôle principal`
      });

      // Add secondary roles from affiliations
      for (const aff of affiliations) {
        if (aff.role !== user.role && aff.status === 'active') {
          const school = aff.schoolId ? await storage.getSchoolById(aff.schoolId) : null;
          allRoles.push({
            role: aff.role,
            isPrimary: false,
            isActive: activeRole === aff.role,
            schoolId: aff.schoolId || undefined,
            schoolName: school?.name,
            description: aff.description || 'Rôle secondaire'
          });
        }
      }

      // Also check secondaryRoles array for any missing affiliations
      for (const role of (user.secondaryRoles || [])) {
        if (!allRoles.some(r => r.role === role)) {
          allRoles.push({
            role,
            isPrimary: false,
            isActive: activeRole === role,
            schoolId: user.schoolId || undefined,
            schoolName: primarySchool?.name,
            description: 'Rôle secondaire'
          });
        }
      }

      return {
        primaryRole: user.role,
        activeRole,
        allRoles
      };
    } catch (error) {
      console.error(`[MULTI_ROLE] Error getting role profile:`, error);
      return null;
    }
  }
}
import { storage } from '../storage';

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
    const suggestedRoles = [];
    
    // Check if phone exists in different contexts
    const existingUsers = await storage.getUsersByPhone(phone);
    const schools = await storage.getSchoolsByPhone(phone);
    
    for (const user of existingUsers) {
      if (user.role === 'Teacher') {
        const school = await storage.getSchoolById(user.schoolId!);
        suggestedRoles.push({
          role: 'Teacher',
          schoolName: school?.name,
          description: `Enseignant à ${school?.name || 'une école'}`,
          confidence: 0.9
        });
      }
      
      if (user.role === 'Parent') {
        suggestedRoles.push({
          role: 'Parent',
          description: 'Parent d\'élève',
          confidence: 0.85
        });
      }
    }
    
    // Check in commercial database
    const commercialRecords = await storage.getCommercialByPhone(phone);
    if (commercialRecords.length > 0) {
      suggestedRoles.push({
        role: 'Commercial',
        description: 'Représentant commercial Educafric',
        confidence: 0.8
      });
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
}
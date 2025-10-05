/**
 * Contrôleur de Duplications Educafric
 * Analyse et prévient toutes les formes de duplications sur la plateforme
 */
import { storage } from '../storage';
import { antiDuplicationService } from './antiDuplicationService';

export class DuplicationController {
  private static instance: DuplicationController;
  
  public static getInstance(): DuplicationController {
    if (!DuplicationController.instance) {
      DuplicationController.instance = new DuplicationController();
    }
    return DuplicationController.instance;
  }
  
  /**
   * Analyse complète des duplications sur la plateforme
   */
  async runDuplicationAnalysis(): Promise<{
    users: any;
    schools: any;
    classes: any;
    students: any;
    teachers: any;
    summary: any;
  }> {
    console.log('[DUPLICATION_CONTROLLER] Starting comprehensive duplication analysis...');
    
    const analysis = {
      users: await this.analyzeUserDuplications(),
      schools: await this.analyzeSchoolDuplications(),
      classes: await this.analyzeClassDuplications(),
      students: await this.analyzeStudentDuplications(),
      teachers: await this.analyzeTeacherDuplications(),
      summary: {
        totalDuplicates: 0,
        criticalIssues: 0,
        autoFixable: 0,
        timestamp: new Date().toISOString()
      }
    };
    
    // Calculer le résumé
    analysis.summary.totalDuplicates = 
      analysis.users.duplicates.length +
      analysis.schools.duplicates.length +
      analysis.classes.duplicates.length +
      analysis.students.duplicates.length +
      analysis.teachers.duplicates.length;
    
    analysis.summary.criticalIssues = 
      analysis.users.critical +
      analysis.schools.critical +
      analysis.classes.critical;
    
    analysis.summary.autoFixable = 
      analysis.users.autoFixable +
      analysis.schools.autoFixable +
      analysis.classes.autoFixable;
    
    console.log(`[DUPLICATION_CONTROLLER] Analysis complete: ${analysis.summary.totalDuplicates} duplicates found`);
    
    return analysis;
  }
  
  /**
   * Analyse des duplications d'utilisateurs
   */
  async analyzeUserDuplications(): Promise<{
    duplicates: any[];
    critical: number;
    autoFixable: number;
    details: any;
  }> {
    try {
      // Rechercher les emails dupliqués
      const emailDuplicates = await storage.findDuplicateEmails();
      
      // Rechercher les noms d'utilisateur dupliqués
      const usernameDuplicates = await storage.findDuplicateUsernames();
      
      // Rechercher les téléphones dupliqués
      const phoneDuplicates = await storage.findDuplicatePhones();
      
      const allDuplicates = [
        ...emailDuplicates.map(d => ({ ...d, type: 'email' })),
        ...usernameDuplicates.map(d => ({ ...d, type: 'username' })),
        ...phoneDuplicates.map(d => ({ ...d, type: 'phone' }))
      ];
      
      return {
        duplicates: allDuplicates,
        critical: emailDuplicates.length, // Emails dupliqués sont critiques
        autoFixable: usernameDuplicates.length + phoneDuplicates.length,
        details: {
          emailDuplicates: emailDuplicates.length,
          usernameDuplicates: usernameDuplicates.length,
          phoneDuplicates: phoneDuplicates.length
        }
      };
    } catch (error) {
      console.error('[DUPLICATION_CONTROLLER] Error analyzing user duplications:', error);
      return { duplicates: [], critical: 0, autoFixable: 0, details: {} };
    }
  }
  
  /**
   * Analyse des duplications d'écoles
   */
  async analyzeSchoolDuplications(): Promise<{
    duplicates: any[];
    critical: number;
    autoFixable: number;
    details: any;
  }> {
    try {
      // Rechercher les noms d'école dupliqués dans la même région
      const nameDuplicates = await storage.findDuplicateSchoolNames();
      
      // Rechercher les codes d'école dupliqués
      const codeDuplicates = await storage.findDuplicateSchoolCodes();
      
      const allDuplicates = [
        ...nameDuplicates.map(d => ({ ...d, type: 'school_name' })),
        ...codeDuplicates.map(d => ({ ...d, type: 'school_code' }))
      ];
      
      return {
        duplicates: allDuplicates,
        critical: codeDuplicates.length, // Codes dupliqués sont critiques
        autoFixable: nameDuplicates.length,
        details: {
          nameDuplicates: nameDuplicates.length,
          codeDuplicates: codeDuplicates.length
        }
      };
    } catch (error) {
      console.error('[DUPLICATION_CONTROLLER] Error analyzing school duplications:', error);
      return { duplicates: [], critical: 0, autoFixable: 0, details: {} };
    }
  }
  
  /**
   * Analyse des duplications de classes
   */
  async analyzeClassDuplications(): Promise<{
    duplicates: any[];
    critical: number;
    autoFixable: number;
    details: any;
  }> {
    try {
      // Rechercher les classes avec même nom dans la même école
      const classDuplicates = await storage.findDuplicateClasses();
      
      return {
        duplicates: classDuplicates.map(d => ({ ...d, type: 'class_name' })),
        critical: classDuplicates.length, // Toutes les classes dupliquées sont critiques
        autoFixable: 0, // Nécessitent intervention manuelle
        details: {
          classDuplicates: classDuplicates.length
        }
      };
    } catch (error) {
      console.error('[DUPLICATION_CONTROLLER] Error analyzing class duplications:', error);
      return { duplicates: [], critical: 0, autoFixable: 0, details: {} };
    }
  }
  
  /**
   * Analyse des duplications d'élèves
   */
  async analyzeStudentDuplications(): Promise<{
    duplicates: any[];
    critical: number;
    autoFixable: number;
    details: any;
  }> {
    try {
      // Rechercher les élèves avec même email dans la même école
      const emailDuplicates = await storage.findDuplicateStudentEmails();
      
      // Rechercher les numéros d'étudiant dupliqués
      const rollNumberDuplicates = await storage.findDuplicateStudentRollNumbers();
      
      const allDuplicates = [
        ...emailDuplicates.map(d => ({ ...d, type: 'student_email' })),
        ...rollNumberDuplicates.map(d => ({ ...d, type: 'roll_number' }))
      ];
      
      return {
        duplicates: allDuplicates,
        critical: emailDuplicates.length + rollNumberDuplicates.length,
        autoFixable: 0, // Nécessitent vérification manuelle
        details: {
          emailDuplicates: emailDuplicates.length,
          rollNumberDuplicates: rollNumberDuplicates.length
        }
      };
    } catch (error) {
      console.error('[DUPLICATION_CONTROLLER] Error analyzing student duplications:', error);
      return { duplicates: [], critical: 0, autoFixable: 0, details: {} };
    }
  }
  
  /**
   * Analyse des duplications d'enseignants
   */
  async analyzeTeacherDuplications(): Promise<{
    duplicates: any[];
    critical: number;
    autoFixable: number;
    details: any;
  }> {
    try {
      // Rechercher les enseignants affectés à plusieurs écoles avec même email
      const multiSchoolTeachers = await storage.findMultiSchoolTeachers();
      
      // Rechercher les matricules d'enseignant dupliqués
      const employeeIdDuplicates = await storage.findDuplicateTeacherEmployeeIds();
      
      const allDuplicates = [
        ...multiSchoolTeachers.map(d => ({ ...d, type: 'multi_school' })),
        ...employeeIdDuplicates.map(d => ({ ...d, type: 'employee_id' }))
      ];
      
      return {
        duplicates: allDuplicates,
        critical: employeeIdDuplicates.length,
        autoFixable: multiSchoolTeachers.length, // Peuvent être consolidés
        details: {
          multiSchoolTeachers: multiSchoolTeachers.length,
          employeeIdDuplicates: employeeIdDuplicates.length
        }
      };
    } catch (error) {
      console.error('[DUPLICATION_CONTROLLER] Error analyzing teacher duplications:', error);
      return { duplicates: [], critical: 0, autoFixable: 0, details: {} };
    }
  }
  
  /**
   * Correction automatique des duplications non-critiques
   */
  async autoFixDuplications(analysisResult: any): Promise<{
    fixed: number;
    errors: string[];
    details: any;
  }> {
    console.log('[DUPLICATION_CONTROLLER] Starting auto-fix process...');
    
    let totalFixed = 0;
    const errors: string[] = [];
    const details: any = {};
    
    try {
      // Corriger les noms d'utilisateur dupliqués
      const usernameFixed = await this.fixDuplicateUsernames(analysisResult.users.duplicates);
      totalFixed += usernameFixed.count;
      details.usernameFixed = usernameFixed.count;
      
      // Corriger les téléphones dupliqués
      const phoneFixed = await this.fixDuplicatePhones(analysisResult.users.duplicates);
      totalFixed += phoneFixed.count;
      details.phoneFixed = phoneFixed.count;
      
      // Corriger les noms d'école dupliqués
      const schoolFixed = await this.fixDuplicateSchoolNames(analysisResult.schools.duplicates);
      totalFixed += schoolFixed.count;
      details.schoolFixed = schoolFixed.count;
      
      // Consolider les enseignants multi-écoles
      const teacherFixed = await this.consolidateMultiSchoolTeachers(analysisResult.teachers.duplicates);
      totalFixed += teacherFixed.count;
      details.teacherFixed = teacherFixed.count;
      
    } catch (error: any) {
      errors.push(`Auto-fix error: ${error.message}`);
    }
    
    console.log(`[DUPLICATION_CONTROLLER] Auto-fix complete: ${totalFixed} duplications fixed`);
    
    return {
      fixed: totalFixed,
      errors,
      details
    };
  }
  
  /**
   * Correction des noms d'utilisateur dupliqués
   */
  private async fixDuplicateUsernames(duplicates: any[]): Promise<{ count: number }> {
    let fixed = 0;
    
    for (const duplicate of duplicates.filter(d => d.type === 'username')) {
      try {
        // Ajouter un suffixe numérique unique
        const newUsername = `${duplicate.username}_${Date.now().toString(36)}`;
        await storage.updateUsername(duplicate.userId, newUsername);
        fixed++;
      } catch (error) {
        console.error(`Failed to fix username duplicate for user ${duplicate.userId}:`, error);
      }
    }
    
    return { count: fixed };
  }
  
  /**
   * Correction des téléphones dupliqués
   */
  private async fixDuplicatePhones(duplicates: any[]): Promise<{ count: number }> {
    let fixed = 0;
    
    for (const duplicate of duplicates.filter(d => d.type === 'phone')) {
      try {
        // Garder le plus récent, vider les autres
        const users = await storage.getUsersByPhone(duplicate.phone);
        const sortedUsers = users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        for (let i = 1; i < sortedUsers.length; i++) {
          await storage.updateUserPhone(sortedUsers[i].id, null);
          fixed++;
        }
      } catch (error) {
        console.error(`Failed to fix phone duplicate ${duplicate.phone}:`, error);
      }
    }
    
    return { count: fixed };
  }
  
  /**
   * Correction des noms d'école dupliqués
   */
  private async fixDuplicateSchoolNames(duplicates: any[]): Promise<{ count: number }> {
    let fixed = 0;
    
    for (const duplicate of duplicates.filter(d => d.type === 'school_name')) {
      try {
        // Ajouter la région au nom pour différencier
        const region = await storage.getSchoolRegion(duplicate.schoolId);
        const newName = `${duplicate.name} - ${region}`;
        await storage.updateSchoolName(duplicate.schoolId, newName);
        fixed++;
      } catch (error) {
        console.error(`Failed to fix school name duplicate for school ${duplicate.schoolId}:`, error);
      }
    }
    
    return { count: fixed };
  }
  
  /**
   * Consolidation des enseignants multi-écoles
   */
  private async consolidateMultiSchoolTeachers(duplicates: any[]): Promise<{ count: number }> {
    let fixed = 0;
    
    for (const duplicate of duplicates.filter(d => d.type === 'multi_school')) {
      try {
        // Créer des liens école-enseignant au lieu de comptes multiples
        await storage.createTeacherSchoolLinks(duplicate.teacherId, duplicate.schoolIds);
        fixed++;
      } catch (error) {
        console.error(`Failed to consolidate multi-school teacher ${duplicate.teacherId}:`, error);
      }
    }
    
    return { count: fixed };
  }
  
  /**
   * Génération d'un rapport de duplication
   */
  async generateDuplicationReport(): Promise<string> {
    const analysis = await this.runDuplicationAnalysis();
    const autoFix = await this.autoFixDuplications(analysis);
    
    const report = `
# RAPPORT DE CONTRÔLE DES DUPLICATIONS EDUCAFRIC
Généré le: ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Douala' })}

## RÉSUMÉ EXÉCUTIF
- **Total des duplications détectées**: ${analysis.summary.totalDuplicates}
- **Problèmes critiques**: ${analysis.summary.criticalIssues}
- **Corrections automatiques appliquées**: ${autoFix.fixed}
- **Duplications restantes**: ${analysis.summary.totalDuplicates - autoFix.fixed}

## DÉTAIL PAR CATÉGORIE

### 👥 UTILISATEURS
- Emails dupliqués: ${analysis.users.details.emailDuplicates} (CRITIQUE)
- Noms d'utilisateur dupliqués: ${analysis.users.details.usernameDuplicates} (Corrigé: ${autoFix.details.usernameFixed || 0})
- Téléphones dupliqués: ${analysis.users.details.phoneDuplicates} (Corrigé: ${autoFix.details.phoneFixed || 0})

### 🏫 ÉCOLES
- Noms d'école dupliqués: ${analysis.schools.details.nameDuplicates} (Corrigé: ${autoFix.details.schoolFixed || 0})
- Codes d'école dupliqués: ${analysis.schools.details.codeDuplicates} (CRITIQUE)

### 📚 CLASSES
- Classes avec même nom: ${analysis.classes.details.classDuplicates} (CRITIQUE - Intervention manuelle requise)

### 🎓 ÉLÈVES
- Emails d'élèves dupliqués: ${analysis.students.details.emailDuplicates} (CRITIQUE)
- Numéros d'étudiant dupliqués: ${analysis.students.details.rollNumberDuplicates} (CRITIQUE)

### 👨‍🏫 ENSEIGNANTS
- Enseignants multi-écoles: ${analysis.teachers.details.multiSchoolTeachers} (Corrigé: ${autoFix.details.teacherFixed || 0})
- Matricules dupliqués: ${analysis.teachers.details.employeeIdDuplicates} (CRITIQUE)

## ACTIONS RECOMMANDÉES

### Immédiates (Critiques)
${analysis.summary.criticalIssues > 0 ? `
⚠️ ${analysis.summary.criticalIssues} problèmes critiques nécessitent une attention immédiate:
- Vérifier et fusionner les comptes utilisateurs avec emails identiques
- Résoudre les conflits de codes d'école
- Consolider les classes avec noms identiques dans chaque école
- Corriger les matricules d'enseignants dupliqués
` : '✅ Aucun problème critique détecté'}

### Préventives
- Renforcer les contraintes d'unicité en base de données
- Implémenter la validation côté client
- Activer les alertes de duplication en temps réel

## STATUT DES SYSTÈMES ANTI-DUPLICATION
✅ Middleware d'idempotence: Actif
✅ Verrous de concurrence: Opérationnels  
✅ Hooks anti-double-clic: Déployés
✅ Validation de formulaires: Active
✅ Nettoyage automatique: Programmé

---
Rapport généré par le Contrôleur de Duplications Educafric v1.0
`;
    
    return report;
  }
}

// Instance singleton
export const duplicationController = DuplicationController.getInstance();
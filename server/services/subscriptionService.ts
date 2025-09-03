import { type School, type User } from "../../shared/schema";

export interface SubscriptionPlan {
  id: string;
  name: string;
  type: 'school' | 'freelancer';
  price: number;
  currency: string;
  billing: 'annual' | 'monthly';
  features: string[];
  limitations?: {
    maxStudents?: number;
    maxTeachers?: number;
    maxClasses?: number;
  };
  isActive: boolean;
}

export interface SchoolSubscription {
  schoolId: number;
  planId: string;
  status: 'freemium' | 'premium' | 'trial' | 'expired';
  startDate: Date;
  endDate?: Date;
  paymentMethod?: 'stripe' | 'orange_money' | 'bank_transfer';
  lastPaymentDate?: Date;
  autoRenew: boolean;
}

/**
 * Service de gestion des abonnements pour les écoles et freelancers
 * Sépare les données sandbox des données de production
 */
export class SubscriptionService {
  
  /**
   * Vérifier si un utilisateur est exempt des restrictions premium
   * (comptes sandbox et @test.educafric.com)
   */
  private static isSandboxOrTestUser(userEmail: string): boolean {
    if (!userEmail) return false;
    
    const email = userEmail.toLowerCase();
    
    // Exemptions permanentes pour comptes sandbox et test
    const exemptPatterns = [
      '@test.educafric.com',
      'sandbox@',
      'demo@',
      'test@',
      '.sandbox@',
      '.demo@',
      '.test@'
    ];
    
    return exemptPatterns.some(pattern => email.includes(pattern));
  }
  
  /**
   * Plans d'abonnement disponibles
   */
  static readonly SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
    // Plans pour écoles - NOUVEAU MODÈLE: EDUCAFRIC PAIE LES ÉCOLES
    'ecole_500_plus': {
      id: 'ecole_500_plus',
      name: 'École 500+ élèves',
      type: 'school',
      price: -150000, // Négatif car EDUCAFRIC paie l'école
      currency: 'XAF',
      billing: 'annual',
      features: [
        'EDUCAFRIC verse 150.000 CFA/an à l\'école',
        'Paiement trimestriel: 50.000 CFA',
        'Gestion académique complète',
        'Bulletins personnalisés',
        'Communication parents-enseignants',
        'Géolocalisation des élèves',
        'Notifications SMS/Email',
        'Support prioritaire',
        'Formation équipe gratuite'
      ],
      isActive: true
    },
    'ecole_500_moins': {
      id: 'ecole_500_moins',
      name: 'École moins de 500 élèves',
      type: 'school',
      price: -200000, // Négatif car EDUCAFRIC paie l'école
      currency: 'XAF',
      billing: 'annual',
      features: [
        'EDUCAFRIC verse 200.000 CFA/an à l\'école',
        'Paiement trimestriel: 66.670 CFA',
        'Gestion académique complète',
        'Bulletins personnalisés',
        'Communication parents-enseignants',
        'Géolocalisation des élèves',
        'Notifications SMS/Email',
        'Support prioritaire',
        'Formation équipe gratuite',
        'Bonus école petite taille'
      ],
      isActive: true
    },
    // Plans pour répétiteurs/freelancers - Prix actualisés
    'repetiteur_professionnel_semestriel': {
      id: 'repetiteur_professionnel_semestriel',
      name: 'Répétiteur Professionnel (Semestriel)',
      type: 'freelancer',
      price: 12500,
      currency: 'XAF',
      billing: 'annual', // Semestriel (6 mois)
      features: [
        'Gestion élèves illimitée',
        'Planning personnalisé',
        'Suivi des progrès',
        'Communication parents',
        'Facturation simplifiée',
        'Géolocalisation et zones d\'enseignement',
        'Outils de performance et analytics',
        'Marketing digital',
        'Formation continue',
        'Certification professionnelle',
        'Support téléphonique'
      ],
      limitations: {
        maxStudents: 50,
        maxClasses: 10
      },
      isActive: true
    },
    'repetiteur_professionnel_annual': {
      id: 'repetiteur_professionnel_annual',
      name: 'Répétiteur Professionnel (Annuel)',
      type: 'freelancer',
      price: 25000,
      currency: 'XAF',
      billing: 'annual',
      features: [
        'Toutes les fonctionnalités semestrielles',
        'Économie annuelle',
        'Support prioritaire',
        'Formation avancée',
        'Outils marketing premium',
        'Certification avancée'
      ],
      limitations: {
        maxStudents: 50,
        maxClasses: 10
      },
      isActive: true
    }
  };

  /**
   * Fonctionnalités freemium pour les écoles
   */
  static readonly FREEMIUM_FEATURES = {
    maxStudents: 30,
    maxTeachers: 5,
    maxClasses: 5,
    maxParents: 30,
    maxAttendanceRecords: 100,
    maxGrades: 50,
    maxHomework: 20,
    features: [
      'Gestion de base élèves/enseignants',
      'Présences limitées',
      'Notes basiques',
      'Communication simple',
      'Support email uniquement'
    ],
    restrictions: [
      'Pas de géolocalisation',
      'Pas de notifications SMS',
      'Pas de bulletins personnalisés',
      'Pas de rapports avancés',
      'Pas de support téléphonique'
    ]
  };

  /**
   * Vérifier si une école peut accéder à une fonctionnalité
   */
  static async canAccessFeature(schoolId: number, feature: string, userEmail?: string): Promise<boolean> {
    // ✅ EXEMPTION PERMANENTE: Comptes sandbox et @test.educafric.com
    if (userEmail && this.isSandboxOrTestUser(userEmail)) {
      console.log(`[SUBSCRIPTION_SERVICE] User ${userEmail} is exempt from feature restrictions - access granted`);
      return true;
    }
    const subscription = await this.getSchoolSubscription(schoolId);
    
    // Mode sandbox : accès complet
    if (this.isSandboxSchool(schoolId)) {
      return true;
    }

    // Pas d'abonnement = freemium
    if (!subscription || subscription.status === 'freemium') {
      return this.isFreemiumFeature(feature);
    }

    // Abonnement premium actif
    if (subscription.status === 'premium') {
      return true;
    }

    return false;
  }

  /**
   * Vérifier si une école est en mode sandbox
   */
  static isSandboxSchool(schoolId: number): boolean {
    // École ID 1 = sandbox par défaut
    return schoolId === 1;
  }

  /**
   * Vérifier si une fonctionnalité est disponible en freemium
   */
  static isFreemiumFeature(feature: string): boolean {
    const freemiumFeatures = [
      // École freemium
      'basic_student_management',
      'basic_teacher_management',
      'basic_attendance',
      'basic_grades',
      'basic_communication',
      'basic_homework',
      // Parent freemium
      'basic_child_profile',
      'basic_grade_access',
      'basic_attendance_view',
      'basic_school_communication',
      // Freelancer freemium
      'basic_freelancer_schedule',
      'basic_student_notes',
      'basic_parent_messaging'
    ];
    
    // Premium features that require subscription
    const premiumFeatures = [
      // École premium
      'advanced_teacher_management',
      'advanced_student_management', 
      'advanced_class_management',
      'geolocation_tracking',
      'advanced_communications',
      // Parent premium
      'parent_premium',
      'gps_child_tracking',
      'advanced_notifications',
      'multiple_children',
      'emergency_alerts',
      // Freelancer premium
      'freelancer_premium',
      'unlimited_students',
      'advanced_scheduling',
      'payment_tracking',
      'freelancer_analytics'
    ];
    
    return freemiumFeatures.includes(feature);
  }

  /**
   * Obtenir l'abonnement d'une école
   */
  static async getSchoolSubscription(schoolId: number): Promise<SchoolSubscription | null> {
    // En production, ceci viendrait de la base de données
    // Pour l'instant, on simule
    
    if (this.isSandboxSchool(schoolId)) {
      return {
        schoolId,
        planId: 'sandbox_unlimited',
        status: 'premium',
        startDate: new Date(),
        autoRenew: true
      };
    }

    // Par défaut, les nouvelles écoles sont en freemium
    return {
      schoolId,
      planId: 'freemium',
      status: 'freemium',
      startDate: new Date(),
      autoRenew: false
    };
  }

  /**
   * Vérifier les limites freemium
   */
  static async checkFreemiumLimits(schoolId: number, resourceType: string, currentCount: number, userEmail?: string): Promise<{
    canAdd: boolean;
    limit: number;
    remaining: number;
    message?: string;
  }> {
    // ✅ EXEMPTION PERMANENTE: Comptes sandbox et @test.educafric.com
    if (userEmail && this.isSandboxOrTestUser(userEmail)) {
      console.log(`[SUBSCRIPTION_SERVICE] User ${userEmail} is exempt from freemium limits`);
      return { canAdd: true, limit: 999999, remaining: 999999, message: 'Unlimited (Sandbox)' };
    }
    const subscription = await this.getSchoolSubscription(schoolId);
    
    // Mode sandbox ou premium : pas de limites
    if (this.isSandboxSchool(schoolId) || subscription?.status === 'premium') {
      return {
        canAdd: true,
        limit: -1, // Illimité
        remaining: -1
      };
    }

    // Limites freemium
    const limits: Record<string, number> = {
      students: this.FREEMIUM_FEATURES.maxStudents,
      teachers: this.FREEMIUM_FEATURES.maxTeachers,
      classes: this.FREEMIUM_FEATURES.maxClasses,
      parents: this.FREEMIUM_FEATURES.maxParents,
      attendance: this.FREEMIUM_FEATURES.maxAttendanceRecords,
      grades: this.FREEMIUM_FEATURES.maxGrades,
      homework: this.FREEMIUM_FEATURES.maxHomework
    };

    const limit = limits[resourceType] || 0;
    const remaining = Math.max(0, limit - currentCount);
    const canAdd = remaining > 0;

    return {
      canAdd,
      limit,
      remaining,
      message: canAdd ? undefined : `Limite freemium atteinte (${limit} ${resourceType} max). Passez en premium pour plus.`
    };
  }

  /**
   * Obtenir les fonctionnalités disponibles pour une école
   */
  static async getAvailableFeatures(schoolId: number, userEmail?: string): Promise<{
    features: string[];
    restrictions: string[];
    planName: string;
    isFreemium: boolean;
  }> {
    const subscription = await this.getSchoolSubscription(schoolId);
    
    // Mode sandbox : toutes les fonctionnalités
    if (this.isSandboxSchool(schoolId)) {
      return {
        features: ['Toutes les fonctionnalités disponibles (Mode Sandbox)'],
        restrictions: [],
        planName: 'Sandbox Illimité',
        isFreemium: false
      };
    }

    // Freemium ou pas d'abonnement
    if (!subscription || subscription.status === 'freemium') {
      return {
        features: this.FREEMIUM_FEATURES.features,
        restrictions: this.FREEMIUM_FEATURES.restrictions,
        planName: 'Freemium',
        isFreemium: true
      };
    }

    // Premium - obtenir les fonctionnalités du plan
    const plan = this.SUBSCRIPTION_PLANS[subscription.planId];
    return {
      features: plan?.features || [],
      restrictions: [],
      planName: plan?.name || 'Premium',
      isFreemium: false
    };
  }

  /**
   * Créer une session de paiement Stripe pour upgrade
   */
  static async createUpgradeSession(schoolId: number, planId: string): Promise<{
    sessionId: string;
    url: string;
  }> {
    const plan = this.SUBSCRIPTION_PLANS[planId];
    if (!plan) {
      throw new Error('Plan d\'abonnement introuvable');
    }

    // En production, créer une session Stripe réelle
    // Pour l'instant, on simule
    return {
      sessionId: `cs_${Date.now()}`,
      url: `/upgrade-success?plan=${planId}&school=${schoolId}`
    };
  }

  /**
   * Vérifier si un parent peut accéder à une fonctionnalité premium
   * RÈGLE PASSERELLE: École premium + Parent premium = Communication bidirectionnelle active
   */
  static async canAccessParentFeature(userId: number, feature: string, userEmail?: string, childId?: number): Promise<boolean> {
    // ✅ EXEMPTION PERMANENTE: Comptes sandbox et @test.educafric.com
    if (userEmail && this.isSandboxOrTestUser(userEmail)) {
      console.log(`[PARENT_SUBSCRIPTION] User ${userEmail} is exempt from parent feature restrictions`);
      return true;
    }
    
    // Vérifier l'abonnement parent (en production, vérifier dans la DB)
    // Pour l'instant, simulation : parents test ont accès premium
    if (userEmail && userEmail.includes('@test.educafric.com')) {
      return true;
    }
    
    // RÈGLE PASSERELLE SPÉCIALE pour communication école-parent
    if (feature === 'parent_school_communication' && childId) {
      return await this.canAccessParentSchoolGateway(userId, childId, userEmail);
    }
    
    // Par défaut, les parents sont en freemium
    return this.isFreemiumFeature(feature);
  }

  /**
   * RÈGLE PASSERELLE: Vérifier si parent peut communiquer avec école via un enfant spécifique
   * - École premium + Parent sans plan = PASSERELLE INACTIVE
   * - École premium + Parent premium pour cet enfant = PASSERELLE ACTIVE
   */
  static async canAccessParentSchoolGateway(parentId: number, childId: number, userEmail?: string): Promise<boolean> {
    // ✅ EXEMPTION: Comptes test
    if (userEmail && this.isSandboxOrTestUser(userEmail)) {
      return true;
    }
    
    try {
      // En production, récupérer depuis la DB :
      // 1. L'école de l'enfant
      // 2. Le plan de l'école
      // 3. Le plan parent pour cet enfant spécifique
      
      // SIMULATION pour démonstration :
      const childSchoolId = await this.getChildSchoolId(childId);
      const schoolSubscription = await this.getSchoolSubscription(childSchoolId);
      const parentSubscriptionForChild = await this.getParentSubscriptionForChild(parentId, childId);
      
      // Si l'école n'a pas de plan premium, communication de base autorisée
      if (!schoolSubscription || schoolSubscription.status !== 'premium') {
        console.log(`[GATEWAY] École ${childSchoolId} en freemium - communication basique autorisée`);
        return true;
      }
      
      // Si l'école est premium, le parent DOIT AUSSI avoir un plan pour cet enfant
      if (schoolSubscription.status === 'premium') {
        const hasParentPlan = parentSubscriptionForChild && parentSubscriptionForChild.status === 'active';
        
        console.log(`[GATEWAY] École ${childSchoolId} premium - Parent plan pour enfant ${childId}: ${hasParentPlan ? 'ACTIF' : 'INACTIF'}`);
        return hasParentPlan;
      }
      
      return false;
    } catch (error) {
      console.error('[GATEWAY] Erreur vérification passerelle:', error);
      return false;
    }
  }

  /**
   * Récupérer l'ID de l'école d'un enfant
   */
  static async getChildSchoolId(childId: number): Promise<number> {
    // En production, requête DB : SELECT schoolId FROM students WHERE id = childId
    // Simulation : tous les enfants test sont dans l'école 1
    return 1;
  }

  /**
   * Récupérer l'abonnement parent pour un enfant spécifique
   */
  static async getParentSubscriptionForChild(parentId: number, childId: number): Promise<{status: string} | null> {
    // En production, requête DB : 
    // SELECT * FROM parent_child_subscriptions WHERE parentId = ? AND childId = ?
    
    // SIMULATION : Parents test ont un plan actif pour leurs enfants
    // En réalité, vérifier dans la table des abonnements parent-enfant
    return {
      status: 'active' // Simulation - en production, vérifier la vraie DB
    };
  }

  /**
   * Vérifier si un freelancer peut accéder à une fonctionnalité premium
   */
  static async canAccessFreelancerFeature(userId: number, feature: string, userEmail?: string): Promise<boolean> {
    // ✅ EXEMPTION PERMANENTE: Comptes sandbox et @test.educafric.com
    if (userEmail && this.isSandboxOrTestUser(userEmail)) {
      console.log(`[FREELANCER_SUBSCRIPTION] User ${userEmail} is exempt from freelancer feature restrictions`);
      return true;
    }
    
    // Vérifier l'abonnement freelancer (en production, vérifier dans la DB)
    // Pour l'instant, simulation : freelancers test ont accès premium
    if (userEmail && userEmail.includes('@test.educafric.com')) {
      return true;
    }
    
    // Par défaut, les freelancers sont en freemium
    return this.isFreemiumFeature(feature);
  }

  /**
   * Vérifier l'état de la passerelle pour tous les enfants d'un parent
   */
  static async getParentChildrenGatewayStatus(parentId: number, userEmail?: string): Promise<{
    [childId: number]: {
      childName: string;
      schoolName: string;
      schoolPremium: boolean;
      parentPlanActive: boolean;
      gatewayActive: boolean;
      needsUpgrade: boolean;
    }
  }> {
    // ✅ EXEMPTION: Comptes test - toutes passerelles actives
    if (userEmail && this.isSandboxOrTestUser(userEmail)) {
      return {
        1: {
          childName: 'Enfant Test',
          schoolName: 'École Test',
          schoolPremium: true,
          parentPlanActive: true,
          gatewayActive: true,
          needsUpgrade: false
        }
      };
    }
    
    // En production, récupérer tous les enfants du parent depuis la DB
    const children = await this.getParentChildren(parentId);
    const gatewayStatus: any = {};
    
    for (const child of children) {
      const schoolId = await this.getChildSchoolId(child.id);
      const schoolSub = await this.getSchoolSubscription(schoolId);
      const parentSub = await this.getParentSubscriptionForChild(parentId, child.id);
      
      const schoolPremium = schoolSub?.status === 'premium';
      const parentPlanActive = parentSub?.status === 'active';
      const gatewayActive = !schoolPremium || (schoolPremium && parentPlanActive);
      
      gatewayStatus[child.id] = {
        childName: child.name,
        schoolName: child.schoolName,
        schoolPremium,
        parentPlanActive,
        gatewayActive,
        needsUpgrade: schoolPremium && !parentPlanActive
      };
    }
    
    return gatewayStatus;
  }

  /**
   * Récupérer la liste des enfants d'un parent
   */
  static async getParentChildren(parentId: number): Promise<Array<{id: number, name: string, schoolName: string}>> {
    // En production, requête DB : 
    // SELECT s.id, s.firstName, s.lastName, sc.name as schoolName 
    // FROM students s 
    // JOIN parent_child_connections pc ON s.id = pc.childId 
    // JOIN schools sc ON s.schoolId = sc.id 
    // WHERE pc.parentId = ?
    
    // SIMULATION
    return [
      { id: 1, name: 'Jean Kamga', schoolName: 'Collège Saint-Joseph' },
      { id: 2, name: 'Marie Kamga', schoolName: 'École Primaire Bilingue' }
    ];
  }

  /**
   * Obtenir les détails d'abonnement pour une école spécifique
   */
  static async getSchoolSubscriptionDetails(schoolId: number, schoolEmail: string) {
    try {
      // Vérifier si compte exempt
      if (this.isSandboxOrTestUser(schoolEmail)) {
        console.log(`[PREMIUM_EXEMPT] School ${schoolEmail} is exempt from premium restrictions`);
        return {
          isFreemium: false,
          planName: 'École Test Premium',
          features: ['Toutes fonctionnalités', 'Support illimité', 'Test environnement'],
          hasPremiumAccess: true,
          exemptReason: 'test_account'
        };
      }

      // Logique d'abonnement école réelle
      return {
        isFreemium: true,
        planName: 'École Freemium',
        features: ['30 élèves max', '5 enseignants max', '5 classes max'],
        hasPremiumAccess: false
      };
    } catch (error) {
      console.error('[SCHOOL_SUBSCRIPTION] Error:', error);
      return {
        isFreemium: true,
        planName: 'École Freemium',
        features: ['30 élèves max', '5 enseignants max', '5 classes max'],
        hasPremiumAccess: false
      };
    }
  }

  /**
   * Obtenir les détails d'abonnement pour un freelancer spécifique
   */
  static async getFreelancerSubscriptionDetails(freelancerId: number, freelancerEmail: string) {
    try {
      // Vérifier si compte exempt
      if (this.isSandboxOrTestUser(freelancerEmail)) {
        console.log(`[PREMIUM_EXEMPT] Freelancer ${freelancerEmail} is exempt from premium restrictions`);
        return {
          isFreemium: false,
          planName: 'Freelancer Test Premium',
          features: ['Élèves illimités', 'Sessions illimitées', 'Toutes fonctionnalités'],
          hasPremiumAccess: true,
          exemptReason: 'test_account'
        };
      }

      // Logique d'abonnement freelancer réelle
      return {
        isFreemium: true,
        planName: 'Freelancer Freemium',
        features: ['10 élèves max', '20 sessions/mois', 'Fonctionnalités de base'],
        hasPremiumAccess: false
      };
    } catch (error) {
      console.error('[FREELANCER_SUBSCRIPTION] Error:', error);
      return {
        isFreemium: true,
        planName: 'Freelancer Freemium',
        features: ['10 élèves max', '20 sessions/mois', 'Fonctionnalités de base'],
        hasPremiumAccess: false
      };
    }
  }

  /**
   * Obtenir les détails d'abonnement pour un parent
   */
  static async getParentSubscriptionDetails(userId: number, userEmail?: string): Promise<{
    features: string[];
    restrictions: string[];
    planName: string;
    isFreemium: boolean;
    gatewayStatus?: any;
  }> {
    // ✅ EXEMPTION PERMANENTE: Comptes sandbox et @test.educafric.com
    if (userEmail && this.isSandboxOrTestUser(userEmail)) {
      return {
        features: ['Toutes les fonctionnalités parent disponibles (Compte Test)'],
        restrictions: [],
        planName: 'Test Premium',
        isFreemium: false
      };
    }
    
    // Récupérer l'état des passerelles pour tous les enfants
    const gatewayStatus = await this.getParentChildrenGatewayStatus(userId, userEmail);
    
    // Freemium par défaut pour les parents
    return {
      features: [
        'Profil enfant basique',
        'Accès aux notes de base',
        'Notifications email simples',
        'Calendrier scolaire'
      ],
      restrictions: [
        'Pas de géolocalisation GPS',
        'Pas de notifications SMS/WhatsApp',
        'Pas d\'analyses avancées',
        'Communication école limitée selon plans actifs'
      ],
      planName: 'Parent Freemium',
      isFreemium: true,
      gatewayStatus
    };
  }

  /**
   * Obtenir les détails d'abonnement pour un freelancer (version étendue)
   */
  static async getFreelancerSubscriptionDetailsExtended(userId: number, userEmail?: string): Promise<{
    features: string[];
    restrictions: string[];
    planName: string;
    isFreemium: boolean;
  }> {
    // ✅ EXEMPTION PERMANENTE: Comptes sandbox et @test.educafric.com
    if (userEmail && this.isSandboxOrTestUser(userEmail)) {
      return {
        features: ['Toutes les fonctionnalités freelancer disponibles (Compte Test)'],
        restrictions: [],
        planName: 'Test Premium',
        isFreemium: false
      };
    }
    
    // Freemium par défaut pour les freelancers
    return {
      features: [
        'Gestion de 10 étudiants max',
        'Planning simple',
        'Notes basiques',
        'Communication parent basique'
      ],
      restrictions: [
        'Limité à 10 étudiants',
        'Pas de géolocalisation GPS',
        'Pas de gestion paiements',
        'Pas d\'analyses avancées',
        'Pas de notifications SMS/WhatsApp'
      ],
      planName: 'Freelancer Freemium',
      isFreemium: true
    };
  }

  /**
   * Filtrer les données selon le mode (sandbox vs production)
   */
  static filterDataByMode(data: any[], schoolId: number): any[] {
    const isSandbox = this.isSandboxSchool(schoolId);
    
    return data.filter(item => {
      // En mode sandbox, on garde tout (y compris les données fictives)
      if (isSandbox) {
        return true;
      }
      
      // En mode production, on exclut les données fictives
      // Les données fictives sont identifiées par :
      // - emails contenant "test@", "demo@", "sandbox@"
      // - noms contenant "Test", "Demo", "Fictif"
      // - IDs spécifiques de test
      
      const isFictitious = 
        (item.email && /^(test|demo|sandbox|fictif)@/.test(item.email)) ||
        (item.firstName && /^(test|demo|fictif)/i.test(item.firstName)) ||
        (item.lastName && /^(test|demo|fictif)/i.test(item.lastName)) ||
        (item.name && /^(test|demo|fictif)/i.test(item.name)) ||
        (item.id && item.id <= 100); // IDs de test <= 100
        
      return !isFictitious;
    });
  }
}
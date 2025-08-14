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
   * Plans d'abonnement disponibles
   */
  static readonly SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
    // Plans pour écoles (annuels uniquement)
    'ecole_publique': {
      id: 'ecole_publique',
      name: 'École Publique',
      type: 'school',
      price: 250000,
      currency: 'XAF',
      billing: 'annual',
      features: [
        'Gestion académique complète',
        'Bulletins personnalisés',
        'Communication parents-enseignants',
        'Géolocalisation des élèves',
        'Notifications SMS/Email',
        'Support prioritaire',
        'Formation équipe',
        'Sauvegarde automatique'
      ],
      isActive: true
    },
    'ecole_privee': {
      id: 'ecole_privee',
      name: 'École Privée',
      type: 'school',
      price: 750000,
      currency: 'XAF',
      billing: 'annual',
      features: [
        'Toutes les fonctionnalités École Publique',
        'Module commercial avancé',
        'Gestion de la facturation',
        'Rapports financiers détaillés',
        'API personnalisée',
        'Branding personnalisé',
        'Support premium 24/7',
        'Formation avancée équipe',
        'Intégration systèmes tiers'
      ],
      isActive: true
    },
    'ecole_entreprise': {
      id: 'ecole_entreprise',
      name: 'École Entreprise',
      type: 'school',
      price: 150000,
      currency: 'XAF',
      billing: 'annual',
      features: [
        'Interface bilingue français/anglais',
        'Gestion formations professionnelles',
        'Certificats numériques',
        'Module e-learning',
        'Suivi compétences',
        'Rapports de formation',
        'Support technique',
        'Formation utilisateurs'
      ],
      isActive: true
    },
    // Plan pour répétiteurs/freelancers
    'repetiteur_professionnel': {
      id: 'repetiteur_professionnel',
      name: 'Répétiteur Professionnel',
      type: 'freelancer',
      price: 12000,
      currency: 'XAF',
      billing: 'monthly',
      features: [
        'Gestion élèves illimitée',
        'Planning personnalisé',
        'Suivi des progrès',
        'Communication parents',
        'Facturation simplifiée',
        'Documents pédagogiques',
        'Support standard'
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
      price: 120000,
      currency: 'XAF',
      billing: 'annual',
      features: [
        'Toutes les fonctionnalités mensuelles',
        '2 mois gratuits',
        'Support prioritaire',
        'Formation avancée',
        'Outils marketing'
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
  static async canAccessFeature(schoolId: number, feature: string): Promise<boolean> {
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
      'basic_student_management',
      'basic_teacher_management',
      'basic_attendance',
      'basic_grades',
      'basic_communication',
      'basic_homework'
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
  static async checkFreemiumLimits(schoolId: number, resourceType: string, currentCount: number): Promise<{
    canAdd: boolean;
    limit: number;
    remaining: number;
    message?: string;
  }> {
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
  static async getAvailableFeatures(schoolId: number): Promise<{
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
// ===== AUTOMATIC TUTORIAL GENERATOR =====
// Génère automatiquement les tutoriels basés sur les modules actuels de chaque rôle

export interface TutorialStep {
  title: { fr: string; en: string };
  content: { fr: string; en: string };
  icon: any;
  color: string;
}

// Fonction pour extraire et générer les tutoriels automatiquement
export function generateTutorialSteps(role: string, modules: any[]): TutorialStep[] {
  const moduleCount = modules.length;
  
  // Étape de bienvenue personnalisée par rôle
  const welcomeSteps: Record<string, TutorialStep> = {
    'Director': {
      title: { 
        fr: '🏫 Bienvenue, Directeur !', 
        en: '🏫 Welcome, Director!' 
      },
      content: { 
        fr: `EDUCAFRIC 2025 Direction : Gérez votre établissement avec ${moduleCount} modules professionnels - Profil Directeur, Gestion des Classes, Enseignants, Élèves, Emploi du temps, Présences, Communications, Absences Profs, Demandes Parents, Bulletins, Notifications, Administrateurs, Rapports, Paramètres et Classes en ligne.`,
        en: `EDUCAFRIC 2025 Director: Manage your institution with ${moduleCount} professional modules - Director Profile, Class Management, Teachers, Students, Schedule, Attendance, Communications, Teacher Absences, Parent Requests, Report Cards, Notifications, Administrators, Reports, Settings and Online Classes.`
      },
      icon: require('lucide-react').Building2,
      color: 'bg-blue-600'
    },
    'Teacher': {
      title: { 
        fr: '👨‍🏫 Bienvenue, Enseignant !', 
        en: '👨‍🏫 Welcome, Teacher!' 
      },
      content: { 
        fr: `Accédez à ${moduleCount} modules EDUCAFRIC 2025 pour gérer vos classes, présences, notes, devoirs, bulletins et communications avec facilité et efficacité.`,
        en: `Access ${moduleCount} EDUCAFRIC 2025 modules to manage your classes, attendance, grades, homework, report cards and communications with ease and efficiency.`
      },
      icon: require('lucide-react').Users,
      color: 'bg-blue-500'
    },
    'Student': {
      title: { 
        fr: '🎓 Bienvenue, Étudiant !', 
        en: '🎓 Welcome, Student!' 
      },
      content: { 
        fr: `Découvrez EDUCAFRIC 2025 : ${moduleCount} modules pour suivre vos cours, notes, devoirs et communiquer avec vos enseignants.`,
        en: `Discover EDUCAFRIC 2025: ${moduleCount} modules to track your classes, grades, homework and communicate with your teachers.`
      },
      icon: require('lucide-react').User,
      color: 'bg-green-500'
    },
    'Parent': {
      title: { 
        fr: '👨‍👩‍👧‍👦 Bienvenue, Parent !', 
        en: '👨‍👩‍👧‍👦 Welcome, Parent!' 
      },
      content: { 
        fr: `EDUCAFRIC 2025 Parents : Suivez la scolarité de vos enfants avec ${moduleCount} modules - Géolocalisation temps réel, suivi académique, communications et paiements.`,
        en: `EDUCAFRIC 2025 Parents: Track your children's education with ${moduleCount} modules - Real-time geolocation, academic monitoring, communications and payments.`
      },
      icon: require('lucide-react').Users,
      color: 'bg-pink-500'
    },
    'Commercial': {
      title: { 
        fr: '💼 Bienvenue, Commercial !', 
        en: '💼 Welcome, Sales Rep!' 
      },
      content: { 
        fr: `EDUCAFRIC 2025 Commercial : ${moduleCount} modules CRM avancés pour gérer vos écoles partenaires, paiements, documents et statistiques.`,
        en: `EDUCAFRIC 2025 Commercial: ${moduleCount} advanced CRM modules to manage your partner schools, payments, documents and statistics.`
      },
      icon: require('lucide-react').Building2,
      color: 'bg-blue-600'
    }
  };

  // Générer les étapes depuis les modules
  const steps: TutorialStep[] = [welcomeSteps[role] || welcomeSteps['Student']];
  
  // Grouper les modules par catégorie (tous les 3-4 modules)
  const chunkSize = Math.ceil(modules.length / 3);
  const moduleChunks: any[][] = [];
  
  for (let i = 0; i < modules.length; i += chunkSize) {
    moduleChunks.push(modules.slice(i, i + chunkSize));
  }
  
  // Créer une étape pour chaque groupe de modules
  moduleChunks.forEach((chunk, index) => {
    const moduleNames = chunk.map(m => m.label).join(', ');
    const firstModule = chunk[0];
    
    steps.push({
      title: {
        fr: `📚 Modules ${index + 1}`,
        en: `📚 Modules ${index + 1}`
      },
      content: {
        fr: `Découvrez : ${moduleNames}. Ces modules vous permettent de gérer efficacement votre travail quotidien.`,
        en: `Discover: ${moduleNames}. These modules allow you to efficiently manage your daily work.`
      },
      icon: firstModule.icon?.type || require('lucide-react').BookOpen,
      color: firstModule.color || 'bg-blue-500'
    });
  });
  
  // Étape finale avec résumé
  steps.push({
    title: {
      fr: '🚀 Commencez !',
      en: '🚀 Get Started!'
    },
    content: {
      fr: `Vous avez maintenant accès à tous les ${moduleCount} modules. Cliquez sur n'importe quel module pour commencer à l'utiliser. Bon travail !`,
      en: `You now have access to all ${moduleCount} modules. Click on any module to start using it. Happy working!`
    },
    icon: require('lucide-react').CheckCircle,
    color: 'bg-green-500'
  });
  
  return steps;
}

// Fonction pour obtenir le compte de modules par rôle
export function getModuleStats(role: string): { total: number; free: number; premium: number } {
  // Ces stats seront mises à jour automatiquement si les dashboards changent
  const stats: Record<string, { total: number; free: number; premium: number }> = {
    'Director': { total: 17, free: 17, premium: 0 }, // Tous les modules director sont inclus
    'Teacher': { total: 8, free: 4, premium: 4 },
    'Student': { total: 13, free: 5, premium: 8 },
    'Parent': { total: 11, free: 4, premium: 7 },
    'Commercial': { total: 6, free: 6, premium: 0 }
  };
  
  return stats[role] || { total: 0, free: 0, premium: 0 };
}

/**
 * BIBLIOTHÈQUE D'ÉLÉMENTS POUR CRÉATEUR DE MODÈLES DE BULLETINS
 * 
 * Configuration complète de l'interface utilisateur pour la création de templates de bulletins.
 * Organisée par catégories logiques avec icônes, descriptions et propriétés par défaut.
 * 
 * Ordre logique de création d'un bulletin :
 * 1. Identification → 2. Académique → 3. Comportement → 4. Évaluations → 5. Validation
 */

import { 
  User, BookOpen, Clock, AlertTriangle, FileSignature, 
  Image, Layout, Type, Calculator, BarChart3, Users,
  School, Calendar, Trophy, Target, CheckCircle2,
  UserCheck, PenTool, Stamp, Flag, Star, 
  FileText, Divide, Settings, Grid, Crown
} from 'lucide-react';
import { ELEMENT_CATEGORIES, ELEMENT_TYPES, type ElementProperties } from './bulletinTemplateSchema';
import { BULLETIN_ELEMENT_MAPPINGS } from './bulletinElementMapping';

// Interface pour la configuration UI d'un élément
export interface ElementUIConfig {
  id: string;
  name: string;
  description: string;
  icon: any; // Composant icône Lucide React
  category: string;
  defaultProperties: ElementProperties;
  maxInstances: number; // -1 pour illimité
  isRequired: boolean; // Élément essentiel pour un bulletin complet
  tags: string[]; // Tags pour la recherche/filtrage
  previewText: string; // Texte d'aperçu dans l'interface
  africaSpecific: boolean; // Spécifique aux bulletins africains
  cameroonSpecific: boolean; // Spécifique au système camerounais
  multilingual: boolean; // Support multilingue
}

// Interface pour la configuration d'une catégorie
export interface CategoryUIConfig {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string; // Couleur pour l'interface
  sortOrder: number;
  elements: ElementUIConfig[];
}

// Configuration complète de la bibliothèque d'éléments
export const BULLETIN_ELEMENT_LIBRARY: Record<string, CategoryUIConfig> = {

  // === 1. IDENTIFICATION ET EN-TÊTE ===
  header: {
    id: "header",
    name: "En-tête et Identification", 
    description: "Titre du bulletin, nom de l'école et informations d'identification",
    icon: School,
    color: "#1f2937", // Bleu foncé
    sortOrder: 1,
    elements: [
      {
        id: ELEMENT_TYPES.BULLETIN_TITLE,
        name: "Titre du Bulletin",
        description: "Titre principal avec trimestre et année scolaire",
        icon: FileText,
        category: ELEMENT_CATEGORIES.HEADER,
        defaultProperties: {
          fontSize: 20,
          fontWeight: "bold",
          textAlign: "center",
          color: "#1f2937",
          padding: 10,
          label: "BULLETIN SCOLAIRE"
        },
        maxInstances: 1,
        isRequired: true,
        tags: ["titre", "header", "identification"],
        previewText: "BULLETIN SCOLAIRE - PREMIER TRIMESTRE 2024-2025",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.SCHOOL_NAME,
        name: "Nom de l'École",
        description: "Nom complet de l'établissement scolaire", 
        icon: School,
        category: ELEMENT_CATEGORIES.HEADER,
        defaultProperties: {
          fontSize: 16,
          fontWeight: "bold",
          textAlign: "center",
          color: "#374151"
        },
        maxInstances: 1,
        isRequired: true,
        tags: ["école", "établissement", "nom"],
        previewText: "ÉCOLE PRIMAIRE BILINGUE EXCELLENCE",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: false
      },
      {
        id: ELEMENT_TYPES.SCHOOL_ADDRESS,
        name: "Adresse de l'École",
        description: "Adresse complète avec ville et pays",
        icon: Target,
        category: ELEMENT_CATEGORIES.HEADER,
        defaultProperties: {
          fontSize: 12,
          textAlign: "center",
          color: "#6b7280"
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["adresse", "localisation", "contact"],
        previewText: "B.P. 1234 Yaoundé, Cameroun",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: false
      },
      {
        id: ELEMENT_TYPES.SCHOOL_PHONE,
        name: "Téléphone École",
        description: "Numéro de téléphone de l'établissement",
        icon: FileText,
        category: ELEMENT_CATEGORIES.HEADER,
        defaultProperties: {
          fontSize: 12,
          textAlign: "center", 
          color: "#6b7280",
          format: "Tél: {value}"
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["téléphone", "contact"],
        previewText: "Tél: +237 222 123 456",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: false
      },
      {
        id: ELEMENT_TYPES.PERFORMANCE_LEVELS_TEXT,
        name: "Explication Niveaux de Performance",
        description: "Texte explicatif des niveaux de rendement (bilingue)",
        icon: BookOpen,
        category: ELEMENT_CATEGORIES.HEADER,
        defaultProperties: {
          fontSize: 8,
          textAlign: "justify",
          color: "#374151",
          showBorder: true,
          padding: 8,
          language: "both"
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["niveaux", "performance", "explication", "bilingue"],
        previewText: "NIVEAU DE RENDEMENT: DESCRIPTION DES NIVEAUX...",
        africaSpecific: true,
        cameroonSpecific: true,
        multilingual: true
      }
    ]
  },

  // === 2. INFORMATIONS ÉLÈVE ===
  student_info: {
    id: "student_info",
    name: "Informations Élève",
    description: "Données personnelles et identification de l'élève",
    icon: User,
    color: "#059669", // Vert
    sortOrder: 2,
    elements: [
      {
        id: ELEMENT_TYPES.STUDENT_NAME,
        name: "Nom de l'Élève",
        description: "Nom complet (Nom Prénom)",
        icon: User,
        category: ELEMENT_CATEGORIES.STUDENT_INFO,
        defaultProperties: {
          fontSize: 14,
          fontWeight: "bold",
          color: "#1f2937",
          textTransform: "uppercase"
        },
        maxInstances: 1,
        isRequired: true,
        tags: ["nom", "élève", "identification"],
        previewText: "KAMGA Jean Marie",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: false
      },
      {
        id: ELEMENT_TYPES.STUDENT_MATRICULE,
        name: "Matricule",
        description: "Numéro matricule unique de l'élève",
        icon: Target,
        category: ELEMENT_CATEGORIES.STUDENT_INFO,
        defaultProperties: {
          fontSize: 12,
          fontWeight: "bold",
          color: "#374151",
          format: "Matricule: {value}"
        },
        maxInstances: 1,
        isRequired: true,
        tags: ["matricule", "numéro", "identification"],
        previewText: "Matricule: 2024-001",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: false
      },
      {
        id: ELEMENT_TYPES.STUDENT_CLASS,
        name: "Classe",
        description: "Classe de l'élève",
        icon: Users,
        category: ELEMENT_CATEGORIES.STUDENT_INFO,
        defaultProperties: {
          fontSize: 12,
          fontWeight: "bold",
          color: "#374151",
          format: "Classe: {value}"
        },
        maxInstances: 1,
        isRequired: true,
        tags: ["classe", "niveau"],
        previewText: "Classe: CM2 A",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: false
      },
      {
        id: ELEMENT_TYPES.STUDENT_PHOTO,
        name: "Photo Élève",
        description: "Photo d'identité de l'élève",
        icon: Image,
        category: ELEMENT_CATEGORIES.STUDENT_INFO,
        defaultProperties: {
          imageWidth: 80,
          imageHeight: 100,
          imageBorder: true,
          borderWidth: 1,
          borderColor: "#374151",
          imageScale: "fill"
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["photo", "image", "identité"],
        previewText: "Photo 4x3",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: false
      },
      {
        id: ELEMENT_TYPES.STUDENT_BIRTH_DATE,
        name: "Date de Naissance",
        description: "Date de naissance de l'élève",
        icon: Calendar,
        category: ELEMENT_CATEGORIES.STUDENT_INFO,
        defaultProperties: {
          fontSize: 12,
          color: "#374151",
          dateFormat: "DD/MM/YYYY",
          format: "Né(e) le: {value}"
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["naissance", "âge", "date"],
        previewText: "Né(e) le: 15/03/2012",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.STUDENT_GENDER,
        name: "Sexe",
        description: "Genre de l'élève",
        icon: Users,
        category: ELEMENT_CATEGORIES.STUDENT_INFO,
        defaultProperties: {
          fontSize: 12,
          color: "#374151",
          format: "Sexe: {value}"
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["sexe", "genre"],
        previewText: "Sexe: M",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.STUDENT_AGE,
        name: "Âge",
        description: "Âge calculé de l'élève",
        icon: Calendar,
        category: ELEMENT_CATEGORIES.STUDENT_INFO,
        defaultProperties: {
          fontSize: 12,
          color: "#374151",
          format: "{value} ans"
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["âge", "années"],
        previewText: "12 ans",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      }
    ]
  },

  // === 3. INFORMATIONS ACADÉMIQUES ===
  academic_info: {
    id: "academic_info", 
    name: "Informations Académiques",
    description: "Année scolaire, trimestre, classe et effectifs",
    icon: BookOpen,
    color: "#2563eb", // Bleu
    sortOrder: 3,
    elements: [
      {
        id: ELEMENT_TYPES.ACADEMIC_YEAR,
        name: "Année Scolaire",
        description: "Année scolaire en cours",
        icon: Calendar,
        category: ELEMENT_CATEGORIES.ACADEMIC_INFO,
        defaultProperties: {
          fontSize: 12,
          fontWeight: "bold", 
          color: "#1f2937",
          format: "Année Scolaire: {value}"
        },
        maxInstances: 1,
        isRequired: true,
        tags: ["année", "scolaire", "période"],
        previewText: "Année Scolaire: 2024-2025",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.TERM_SEMESTER,
        name: "Trimestre/Semestre",
        description: "Période d'évaluation",
        icon: Calendar,
        category: ELEMENT_CATEGORIES.ACADEMIC_INFO,
        defaultProperties: {
          fontSize: 12,
          fontWeight: "bold",
          color: "#1f2937"
        },
        maxInstances: 1,
        isRequired: true,
        tags: ["trimestre", "semestre", "période"],
        previewText: "PREMIER TRIMESTRE",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.CLASS_LEVEL,
        name: "Niveau de Classe",
        description: "Niveau scolaire (CP, CE1, 6ème, etc.)",
        icon: Trophy,
        category: ELEMENT_CATEGORIES.ACADEMIC_INFO,
        defaultProperties: {
          fontSize: 12,
          color: "#374151"
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["niveau", "classe"],
        previewText: "Cours Moyen 2ème année",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.TOTAL_STUDENTS,
        name: "Effectif de la Classe",
        description: "Nombre total d'élèves dans la classe",
        icon: Users,
        category: ELEMENT_CATEGORIES.ACADEMIC_INFO,
        defaultProperties: {
          fontSize: 12,
          color: "#374151",
          format: "Effectif: {value} élèves"
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["effectif", "nombre", "élèves"],
        previewText: "Effectif: 35 élèves",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      }
    ]
  },

  // === 4. NOTES ET ÉVALUATIONS ===
  grades: {
    id: "grades",
    name: "Notes et Évaluations",
    description: "Tableaux de notes, moyennes par matière et évaluations détaillées",
    icon: BookOpen,
    color: "#dc2626", // Rouge
    sortOrder: 4,
    elements: [
      {
        id: ELEMENT_TYPES.SUBJECT_GRADES,
        name: "Tableau des Notes",
        description: "Tableau complet des notes par matière",
        icon: Grid,
        category: ELEMENT_CATEGORIES.GRADES,
        defaultProperties: {
          showBorder: true,
          showHeader: true,
          fontSize: 10,
          columns: [
            { field: "subjectName", label: "MATIÈRES", width: 30, align: "left" },
            { field: "firstEvaluation", label: "1ère ÉVAL", width: 15, align: "center", format: "{value}/20" },
            { field: "secondEvaluation", label: "2ème ÉVAL", width: 15, align: "center", format: "{value}/20" },
            { field: "thirdEvaluation", label: "3ème ÉVAL", width: 15, align: "center", format: "{value}/20" },
            { field: "termAverage", label: "MOY", width: 15, align: "center", format: "{value}/20" },
            { field: "coefficient", label: "COEF", width: 10, align: "center" }
          ],
          alternateRowColors: true
        },
        maxInstances: 1,
        isRequired: true,
        tags: ["notes", "tableau", "matières", "évaluations"],
        previewText: "Tableau Notes par Matière",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.SUBJECT_GRADES_DETAILED,
        name: "Notes Détaillées",
        description: "Notes avec détail des évaluations séquentielles",
        icon: BarChart3,
        category: ELEMENT_CATEGORIES.GRADES,
        defaultProperties: {
          showBorder: true,
          fontSize: 9,
          gradeFormat: "decimal",
          decimalPlaces: 2
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["notes", "détail", "séquences"],
        previewText: "Notes avec 1ère, 2ème, 3ème éval",
        africaSpecific: true,
        cameroonSpecific: true,
        multilingual: false
      },
      {
        id: ELEMENT_TYPES.INDIVIDUAL_SUBJECT_GRADE,
        name: "Note Matière Individuelle",
        description: "Note d'une matière spécifique",
        icon: Target,
        category: ELEMENT_CATEGORIES.GRADES,
        defaultProperties: {
          fontSize: 12,
          fontWeight: "bold",
          gradeFormat: "decimal",
          gradeScale: "0-20",
          format: "{value}/20"
        },
        maxInstances: -1,
        isRequired: false,
        tags: ["note", "matière", "individuelle"],
        previewText: "15.5/20",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: false
      },
      {
        id: ELEMENT_TYPES.SUBJECT_COMMENT,
        name: "Commentaire Matière",
        description: "Commentaire du professeur par matière",
        icon: PenTool,
        category: ELEMENT_CATEGORIES.GRADES,
        defaultProperties: {
          fontSize: 10,
          textAlign: "justify",
          maxLength: 200
        },
        maxInstances: -1,
        isRequired: false,
        tags: ["commentaire", "appréciation", "matière"],
        previewText: "Bon travail, continuez vos efforts",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      }
    ]
  },

  // === 5. COEFFICIENTS ET CODES ACADÉMIQUES ===
  coefficients: {
    id: "coefficients",
    name: "Coefficients et Codes",
    description: "Codes CTBA/CBA/CA/CMA, cotes et valeurs Min-Max spécifiques au système camerounais",
    icon: Calculator,
    color: "#7c3aed", // Violet
    sortOrder: 5,
    elements: [
      {
        id: ELEMENT_TYPES.CTBA_VALUE,
        name: "CTBA",
        description: "Contrôle Total des Bases Acquises (/20)",
        icon: CheckCircle2,
        category: ELEMENT_CATEGORIES.COEFFICIENTS,
        defaultProperties: {
          fontSize: 10,
          fontWeight: "bold",
          gradeFormat: "decimal",
          gradeScale: "0-20",
          format: "{value}/20",
          decimalPlaces: 1
        },
        maxInstances: -1,
        isRequired: false,
        tags: ["CTBA", "contrôle", "bases", "acquises"],
        previewText: "16.5/20",
        africaSpecific: true,
        cameroonSpecific: true,
        multilingual: false
      },
      {
        id: ELEMENT_TYPES.CBA_VALUE,
        name: "CBA", 
        description: "Contrôle des Bases Acquises (/20)",
        icon: CheckCircle2,
        category: ELEMENT_CATEGORIES.COEFFICIENTS,
        defaultProperties: {
          fontSize: 10,
          fontWeight: "bold",
          gradeFormat: "decimal",
          gradeScale: "0-20",
          format: "{value}/20",
          decimalPlaces: 1
        },
        maxInstances: -1,
        isRequired: false,
        tags: ["CBA", "contrôle", "bases"],
        previewText: "14.0/20",
        africaSpecific: true,
        cameroonSpecific: true,
        multilingual: false
      },
      {
        id: ELEMENT_TYPES.CA_VALUE,
        name: "CA",
        description: "Contrôle d'Approfondissement (/20)",
        icon: Trophy,
        category: ELEMENT_CATEGORIES.COEFFICIENTS,
        defaultProperties: {
          fontSize: 10,
          fontWeight: "bold",
          gradeFormat: "decimal",
          gradeScale: "0-20",
          format: "{value}/20",
          decimalPlaces: 1
        },
        maxInstances: -1,
        isRequired: false,
        tags: ["CA", "approfondissement"],
        previewText: "18.0/20",
        africaSpecific: true,
        cameroonSpecific: true,
        multilingual: false
      },
      {
        id: ELEMENT_TYPES.CMA_VALUE,
        name: "CMA",
        description: "Contrôle de Maîtrise Approfondie (/20)",
        icon: Crown,
        category: ELEMENT_CATEGORIES.COEFFICIENTS,
        defaultProperties: {
          fontSize: 10,
          fontWeight: "bold",
          gradeFormat: "decimal",
          gradeScale: "0-20",
          format: "{value}/20",
          decimalPlaces: 1
        },
        maxInstances: -1,
        isRequired: false,
        tags: ["CMA", "maîtrise", "approfondie"],
        previewText: "17.5/20",
        africaSpecific: true,
        cameroonSpecific: true,
        multilingual: false
      },
      {
        id: ELEMENT_TYPES.COTE_VALUE,
        name: "Cote",
        description: "Cote alphabétique (A, B, C, D, E, F)",
        icon: Star,
        category: ELEMENT_CATEGORIES.COEFFICIENTS,
        defaultProperties: {
          fontSize: 12,
          fontWeight: "bold",
          textAlign: "center"
        },
        maxInstances: -1,
        isRequired: false,
        tags: ["cote", "lettre", "évaluation"],
        previewText: "B",
        africaSpecific: true,
        cameroonSpecific: true,
        multilingual: false
      },
      {
        id: ELEMENT_TYPES.CNA_VALUE,
        name: "CNA",
        description: "Indicateur Compétence Non Acquise",
        icon: AlertTriangle,
        category: ELEMENT_CATEGORIES.COEFFICIENTS,
        defaultProperties: {
          fontSize: 10,
          color: "#dc2626",
          fontWeight: "bold"
        },
        maxInstances: -1,
        isRequired: false,
        tags: ["CNA", "compétence", "non acquise"],
        previewText: "CNA",
        africaSpecific: true,
        cameroonSpecific: true,
        multilingual: false
      },
      {
        id: ELEMENT_TYPES.MIN_MAX_GRADES,
        name: "Min-Max",
        description: "Valeurs minimum et maximum par matière [Min-Max]",
        icon: BarChart3,
        category: ELEMENT_CATEGORIES.COEFFICIENTS,
        defaultProperties: {
          fontSize: 9,
          format: "[{minGrade}-{maxGrade}]",
          textAlign: "center"
        },
        maxInstances: -1,
        isRequired: false,
        tags: ["min", "max", "étendue", "valeurs"],
        previewText: "[12.5-18.0]",
        africaSpecific: true,
        cameroonSpecific: true,
        multilingual: false
      },
      {
        id: ELEMENT_TYPES.COEFFICIENT_TABLE,
        name: "Tableau Coefficients",
        description: "Tableau complet des coefficients par matière",
        icon: Grid,
        category: ELEMENT_CATEGORIES.COEFFICIENTS,
        defaultProperties: {
          showBorder: true,
          showHeader: true,
          fontSize: 9,
          columns: [
            { field: "subjectName", label: "MATIÈRE", width: 40, align: "left" },
            { field: "CTBA", label: "CTBA", width: 12, align: "center" },
            { field: "CBA", label: "CBA", width: 12, align: "center" },
            { field: "CA", label: "CA", width: 12, align: "center" },
            { field: "CMA", label: "CMA", width: 12, align: "center" },
            { field: "COTE", label: "COTE", width: 12, align: "center" }
          ]
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["tableau", "coefficients", "CTBA", "CBA", "CA", "CMA"],
        previewText: "Tableau Coefficients Complet",
        africaSpecific: true,
        cameroonSpecific: true,
        multilingual: false
      }
    ]
  },

  // === 6. MOYENNES ET TOTAUX ===
  averages: {
    id: "averages",
    name: "Moyennes et Totaux",
    description: "Moyennes générales, totaux et moyennes par matière",
    icon: Calculator,
    color: "#ea580c", // Orange
    sortOrder: 6,
    elements: [
      {
        id: ELEMENT_TYPES.GENERAL_AVERAGE,
        name: "Moyenne Générale",
        description: "Moyenne générale de l'élève sur 20",
        icon: Calculator,
        category: ELEMENT_CATEGORIES.AVERAGES,
        defaultProperties: {
          fontSize: 16,
          fontWeight: "bold",
          color: "#dc2626",
          gradeFormat: "decimal",
          gradeScale: "0-20",
          format: "{value}/20",
          decimalPlaces: 2,
          textAlign: "center",
          showBorder: true,
          padding: 8
        },
        maxInstances: 1,
        isRequired: true,
        tags: ["moyenne", "générale", "total"],
        previewText: "15.75/20",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.TRIMESTER_AVERAGE,
        name: "Moyenne Trimestre",
        description: "Moyenne du trimestre",
        icon: Calendar,
        category: ELEMENT_CATEGORIES.AVERAGES,
        defaultProperties: {
          fontSize: 14,
          fontWeight: "bold",
          color: "#1f2937",
          gradeFormat: "decimal",
          format: "{value}/20",
          decimalPlaces: 2
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["moyenne", "trimestre"],
        previewText: "15.75/20",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.SUBJECT_AVERAGE,
        name: "Moyenne par Matière",
        description: "Moyenne d'une matière spécifique",
        icon: BookOpen,
        category: ELEMENT_CATEGORIES.AVERAGES,
        defaultProperties: {
          fontSize: 12,
          gradeFormat: "decimal",
          format: "{value}/20",
          decimalPlaces: 1
        },
        maxInstances: -1,
        isRequired: false,
        tags: ["moyenne", "matière", "individuelle"],
        previewText: "16.5/20",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: false
      },
      {
        id: ELEMENT_TYPES.TOTAL_GENERAL,
        name: "Total Général",
        description: "Total général pondéré",
        icon: Calculator,
        category: ELEMENT_CATEGORIES.AVERAGES,
        defaultProperties: {
          fontSize: 14,
          fontWeight: "bold",
          color: "#1f2937",
          format: "TOTAL: {value}",
          textAlign: "center"
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["total", "général", "pondéré"],
        previewText: "TOTAL: 315.5",
        africaSpecific: true,
        cameroonSpecific: true,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.NUMBER_OF_AVERAGES,
        name: "Nombre de Moyennes",
        description: "Nombre de matières/moyennes calculées",
        icon: BarChart3,
        category: ELEMENT_CATEGORIES.AVERAGES,
        defaultProperties: {
          fontSize: 12,
          format: "{value} matières"
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["nombre", "matières", "moyennes"],
        previewText: "12 matières",
        africaSpecific: true,
        cameroonSpecific: true,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.CLASS_AVERAGE,
        name: "Moyenne de la Classe",
        description: "Moyenne générale de la classe",
        icon: Users,
        category: ELEMENT_CATEGORIES.AVERAGES,
        defaultProperties: {
          fontSize: 12,
          format: "Moy. classe: {value}/20",
          color: "#6b7280"
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["moyenne", "classe", "comparaison"],
        previewText: "Moy. classe: 13.25/20",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      }
    ]
  },

  // === 7. STATISTIQUES ET CLASSEMENTS ===
  statistics: {
    id: "statistics",
    name: "Statistiques et Classements",
    description: "Rang dans la classe, taux de réussite, niveau de performance et profils",
    icon: BarChart3,
    color: "#0891b2", // Cyan
    sortOrder: 7,
    elements: [
      {
        id: ELEMENT_TYPES.CLASS_RANK,
        name: "Rang dans la Classe",
        description: "Position de l'élève dans le classement de la classe",
        icon: Trophy,
        category: ELEMENT_CATEGORIES.STATISTICS,
        defaultProperties: {
          fontSize: 14,
          fontWeight: "bold",
          color: "#dc2626",
          format: "{rank}e/{total}",
          textAlign: "center",
          showBorder: true,
          padding: 6
        },
        maxInstances: 1,
        isRequired: true,
        tags: ["rang", "classement", "position"],
        previewText: "3e/35",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.SUCCESS_RATE,
        name: "Taux de Réussite",
        description: "Pourcentage de réussite de l'élève",
        icon: Target,
        category: ELEMENT_CATEGORIES.STATISTICS,
        defaultProperties: {
          fontSize: 12,
          fontWeight: "bold",
          format: "{value}%",
          color: "#059669"
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["taux", "réussite", "pourcentage"],
        previewText: "87.5%",
        africaSpecific: true,
        cameroonSpecific: true,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.PERFORMANCE_LEVEL,
        name: "Niveau de Performance",
        description: "Niveau de rendement (1, 2, 3, 4)",
        icon: Star,
        category: ELEMENT_CATEGORIES.STATISTICS,
        defaultProperties: {
          fontSize: 12,
          fontWeight: "bold",
          format: "Niveau {level}",
          color: "#1f2937"
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["niveau", "performance", "rendement"],
        previewText: "Niveau 3",
        africaSpecific: true,
        cameroonSpecific: true,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.CLASS_PROFILE,
        name: "Profil de la Classe",
        description: "Statistiques et répartition de la classe",
        icon: BarChart3,
        category: ELEMENT_CATEGORIES.STATISTICS,
        defaultProperties: {
          fontSize: 10,
          showBorder: true,
          padding: 8
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["profil", "classe", "statistiques"],
        previewText: "Profil Statistique Classe",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.GRADE_DISTRIBUTION,
        name: "Répartition des Notes",
        description: "Distribution des notes dans la classe",
        icon: BarChart3,
        category: ELEMENT_CATEGORIES.STATISTICS,
        defaultProperties: {
          fontSize: 9,
          showBorder: true
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["répartition", "distribution", "notes"],
        previewText: "Distribution Notes Classe",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      }
    ]
  },

  // === 8. ABSENCES ET RETARDS ===
  attendance: {
    id: "attendance",
    name: "Assiduité et Retards",
    description: "Absences justifiées/injustifiées, retards et heures de consigne",
    icon: Clock,
    color: "#ca8a04", // Jaune/Or
    sortOrder: 8,
    elements: [
      {
        id: ELEMENT_TYPES.UNJUSTIFIED_ABSENCES,
        name: "Absences Injustifiées",
        description: "Nombre d'heures d'absences non justifiées",
        icon: AlertTriangle,
        category: ELEMENT_CATEGORIES.ATTENDANCE,
        defaultProperties: {
          fontSize: 12,
          color: "#dc2626",
          format: "{value}h",
          decimalPlaces: 1
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["absences", "injustifiées", "heures"],
        previewText: "2.5h",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.JUSTIFIED_ABSENCES,
        name: "Absences Justifiées",
        description: "Nombre d'heures d'absences justifiées",
        icon: CheckCircle2,
        category: ELEMENT_CATEGORIES.ATTENDANCE,
        defaultProperties: {
          fontSize: 12,
          color: "#059669",
          format: "{value}h",
          decimalPlaces: 1
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["absences", "justifiées", "heures"],
        previewText: "4.0h",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.LATENESS_COUNT,
        name: "Nombre de Retards",
        description: "Nombre de fois où l'élève est arrivé en retard",
        icon: Clock,
        category: ELEMENT_CATEGORIES.ATTENDANCE,
        defaultProperties: {
          fontSize: 12,
          color: "#ea580c",
          format: "{value} retards"
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["retards", "nombre", "ponctualité"],
        previewText: "3 retards",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.DETENTION_HOURS,
        name: "Heures de Consigne",
        description: "Nombre d'heures de consigne/retenue",
        icon: Clock,
        category: ELEMENT_CATEGORIES.ATTENDANCE,
        defaultProperties: {
          fontSize: 12,
          color: "#dc2626",
          format: "{value}h",
          decimalPlaces: 1
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["consigne", "retenue", "heures"],
        previewText: "1.0h",
        africaSpecific: true,
        cameroonSpecific: true,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.TOTAL_ABSENCE_HOURS,
        name: "Total Heures d'Absence",
        description: "Total des heures d'absence (justifiées + injustifiées)",
        icon: Clock,
        category: ELEMENT_CATEGORIES.ATTENDANCE,
        defaultProperties: {
          fontSize: 12,
          fontWeight: "bold",
          format: "Total: {value}h"
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["total", "absences", "heures"],
        previewText: "Total: 6.5h",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.ATTENDANCE_RATE,
        name: "Taux d'Assiduité",
        description: "Pourcentage d'assiduité de l'élève",
        icon: Target,
        category: ELEMENT_CATEGORIES.ATTENDANCE,
        defaultProperties: {
          fontSize: 12,
          color: "#059669",
          format: "{value}%"
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["assiduité", "taux", "présence"],
        previewText: "94.2%",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      }
    ]
  },

  // === 9. SANCTIONS DISCIPLINAIRES ===
  sanctions: {
    id: "sanctions",
    name: "Sanctions Disciplinaires",
    description: "Avertissements, blâmes, exclusions et dossier disciplinaire",
    icon: AlertTriangle,
    color: "#dc2626", // Rouge
    sortOrder: 9,
    elements: [
      {
        id: ELEMENT_TYPES.CONDUCT_WARNING,
        name: "Avertissement de Conduite",
        description: "Avertissement disciplinaire (OUI/NON)",
        icon: AlertTriangle,
        category: ELEMENT_CATEGORIES.SANCTIONS,
        defaultProperties: {
          fontSize: 12,
          color: "#ea580c",
          format: "{value ? 'OUI' : 'NON'}"
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["avertissement", "conduite", "discipline"],
        previewText: "NON",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.CONDUCT_BLAME,
        name: "Blâme de Conduite",
        description: "Blâme disciplinaire (OUI/NON)",
        icon: AlertTriangle,
        category: ELEMENT_CATEGORIES.SANCTIONS,
        defaultProperties: {
          fontSize: 12,
          color: "#dc2626",
          format: "{value ? 'OUI' : 'NON'}"
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["blâme", "conduite", "discipline"],
        previewText: "NON",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.EXCLUSION_DAYS,
        name: "Jours d'Exclusion",
        description: "Nombre de jours d'exclusion temporaire",
        icon: Clock,
        category: ELEMENT_CATEGORIES.SANCTIONS,
        defaultProperties: {
          fontSize: 12,
          color: "#dc2626",
          format: "{value} jours"
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["exclusion", "jours", "temporaire"],
        previewText: "0 jours",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.PERMANENT_EXCLUSION,
        name: "Exclusion Définitive",
        description: "Exclusion définitive de l'établissement (OUI/NON)",
        icon: AlertTriangle,
        category: ELEMENT_CATEGORIES.SANCTIONS,
        defaultProperties: {
          fontSize: 12,
          fontWeight: "bold",
          color: "#dc2626",
          format: "{value ? 'OUI' : 'NON'}"
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["exclusion", "définitive", "renvoi"],
        previewText: "NON",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.DISCIPLINARY_RECORD,
        name: "Dossier Disciplinaire",
        description: "Résumé complet du dossier disciplinaire",
        icon: FileText,
        category: ELEMENT_CATEGORIES.SANCTIONS,
        defaultProperties: {
          fontSize: 10,
          showBorder: true,
          padding: 8
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["dossier", "disciplinaire", "résumé"],
        previewText: "Dossier Disciplinaire Complet",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      }
    ]
  },

  // === 10. APPRÉCIATIONS ET COMMENTAIRES ===
  appreciations: {
    id: "appreciations",
    name: "Appréciations et Commentaires",
    description: "Commentaires des enseignants, points forts, points à améliorer",
    icon: PenTool,
    color: "#0891b2", // Cyan  
    sortOrder: 10,
    elements: [
      {
        id: ELEMENT_TYPES.WORK_APPRECIATION,
        name: "Appréciation du Travail",
        description: "Appréciation détaillée du travail de l'élève",
        icon: PenTool,
        category: ELEMENT_CATEGORIES.APPRECIATIONS,
        defaultProperties: {
          fontSize: 11,
          textAlign: "justify",
          showBorder: true,
          padding: 8,
          maxLength: 500
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["appréciation", "travail", "évaluation"],
        previewText: "L'élève fait preuve de sérieux et de régularité dans son travail...",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.GENERAL_COMMENT,
        name: "Commentaire Général",
        description: "Commentaire général du trimestre",
        icon: FileText,
        category: ELEMENT_CATEGORIES.APPRECIATIONS,
        defaultProperties: {
          fontSize: 11,
          textAlign: "justify",
          maxLength: 300
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["commentaire", "général", "trimestre"],
        previewText: "Bon trimestre, continuez vos efforts",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.TEACHER_APPRECIATION,
        name: "Appréciation Professeur",
        description: "Commentaire du professeur principal",
        icon: UserCheck,
        category: ELEMENT_CATEGORIES.APPRECIATIONS,
        defaultProperties: {
          fontSize: 11,
          textAlign: "justify"
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["professeur", "principal", "appréciation"],
        previewText: "Élève sérieux et appliqué, bon niveau général",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.PROGRESS_COMMENT,
        name: "Commentaire Progrès",
        description: "Évaluation des progrès de l'élève",
        icon: BarChart3,
        category: ELEMENT_CATEGORIES.APPRECIATIONS,
        defaultProperties: {
          fontSize: 11,
          color: "#059669"
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["progrès", "évolution", "amélioration"],
        previewText: "Progrès remarquables en mathématiques",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.IMPROVEMENT_AREAS,
        name: "Points à Améliorer",
        description: "Domaines nécessitant des améliorations",
        icon: Target,
        category: ELEMENT_CATEGORIES.APPRECIATIONS,
        defaultProperties: {
          fontSize: 11,
          color: "#ea580c",
          textAlign: "justify"
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["amélioration", "points", "faibles", "efforts"],
        previewText: "Doit améliorer la présentation des copies",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.STRENGTHS,
        name: "Points Forts",
        description: "Domaines d'excellence de l'élève",
        icon: Star,
        category: ELEMENT_CATEGORIES.APPRECIATIONS,
        defaultProperties: {
          fontSize: 11,
          color: "#059669",
          textAlign: "justify"
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["points", "forts", "excellence", "qualités"],
        previewText: "Excellente participation orale, très bonne compréhension",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      }
    ]
  },

  // === 11. CONSEIL DE CLASSE ===
  class_council: {
    id: "class_council",
    name: "Conseil de Classe",
    description: "Décisions, mentions, recommandations et participants du conseil de classe",
    icon: Users,
    color: "#7c3aed", // Violet
    sortOrder: 11,
    elements: [
      {
        id: ELEMENT_TYPES.CLASS_COUNCIL_DECISIONS,
        name: "Décisions du Conseil",
        description: "Décisions prises par le conseil de classe",
        icon: CheckCircle2,
        category: ELEMENT_CATEGORIES.CLASS_COUNCIL,
        defaultProperties: {
          fontSize: 11,
          showBorder: true,
          padding: 8,
          maxLength: 1000
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["conseil", "décisions", "délibérations"],
        previewText: "Le conseil décide du passage en classe supérieure",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.CLASS_COUNCIL_MENTIONS,
        name: "Mentions du Conseil",
        description: "Mentions attribuées par le conseil (Félicitations, Encouragements, etc.)",
        icon: Star,
        category: ELEMENT_CATEGORIES.CLASS_COUNCIL,
        defaultProperties: {
          fontSize: 12,
          fontWeight: "bold",
          color: "#059669",
          textAlign: "center"
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["mentions", "félicitations", "encouragements"],
        previewText: "ENCOURAGEMENTS",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.ORIENTATION_RECOMMENDATIONS,
        name: "Recommandations d'Orientation",
        description: "Conseils d'orientation pour l'élève",
        icon: Target,
        category: ELEMENT_CATEGORIES.CLASS_COUNCIL,
        defaultProperties: {
          fontSize: 11,
          textAlign: "justify",
          maxLength: 1000
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["orientation", "recommandations", "conseils"],
        previewText: "Poursuite d'études conseillée en section scientifique",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.COUNCIL_DATE,
        name: "Date du Conseil",
        description: "Date de tenue du conseil de classe",
        icon: Calendar,
        category: ELEMENT_CATEGORIES.CLASS_COUNCIL,
        defaultProperties: {
          fontSize: 11,
          dateFormat: "DD/MM/YYYY",
          format: "Conseil du: {value}"
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["date", "conseil", "délibération"],
        previewText: "Conseil du: 15/12/2024",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.COUNCIL_PARTICIPANTS,
        name: "Participants du Conseil",
        description: "Liste des participants au conseil de classe",
        icon: Users,
        category: ELEMENT_CATEGORIES.CLASS_COUNCIL,
        defaultProperties: {
          fontSize: 10,
          maxLength: 500
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["participants", "enseignants", "direction"],
        previewText: "Directeur, Professeur principal, Représentants parents",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.COUNCIL_PRESIDENT,
        name: "Président du Conseil",
        description: "Nom du président du conseil de classe",
        icon: Crown,
        category: ELEMENT_CATEGORIES.CLASS_COUNCIL,
        defaultProperties: {
          fontSize: 11,
          fontWeight: "bold",
          format: "Président: {value}"
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["président", "directeur", "principal"],
        previewText: "Président: M. NGONO Paul",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      }
    ]
  },

  // === 12. SIGNATURES ET VISAS ===
  signatures: {
    id: "signatures",
    name: "Signatures et Visas",
    description: "Signatures parents, enseignant, directeur avec dates et visas",
    icon: FileSignature,
    color: "#059669", // Vert
    sortOrder: 12,
    elements: [
      {
        id: ELEMENT_TYPES.PARENT_SIGNATURE,
        name: "Signature Parent",
        description: "Signature et visa du parent/tuteur",
        icon: User,
        category: ELEMENT_CATEGORIES.SIGNATURES,
        defaultProperties: {
          signatureType: "both",
          signatureWidth: 120,
          signatureHeight: 60,
          showSignatureLine: true,
          signaturePlaceholder: "Signature Parent",
          fontSize: 10
        },
        maxInstances: 1,
        isRequired: true,
        tags: ["signature", "parent", "visa"],
        previewText: "Signature et Visa Parent",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.TEACHER_SIGNATURE,
        name: "Signature Enseignant",
        description: "Signature du professeur principal",
        icon: UserCheck,
        category: ELEMENT_CATEGORIES.SIGNATURES,
        defaultProperties: {
          signatureType: "both",
          signatureWidth: 120,
          signatureHeight: 60,
          showSignatureLine: true,
          signaturePlaceholder: "Professeur Principal",
          fontSize: 10
        },
        maxInstances: 1,
        isRequired: true,
        tags: ["signature", "enseignant", "professeur"],
        previewText: "Signature Professeur Principal",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.HEADMASTER_SIGNATURE,
        name: "Signature Directeur",
        description: "Signature et cachet du directeur",
        icon: Crown,
        category: ELEMENT_CATEGORIES.SIGNATURES,
        defaultProperties: {
          signatureType: "both",
          signatureWidth: 120,
          signatureHeight: 60,
          showSignatureLine: true,
          signaturePlaceholder: "Le Directeur",
          fontSize: 10,
          fontWeight: "bold"
        },
        maxInstances: 1,
        isRequired: true,
        tags: ["signature", "directeur", "cachet"],
        previewText: "Signature et Cachet Directeur",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.PARENT_VISA_DATE,
        name: "Date Visa Parent",
        description: "Date du visa du parent",
        icon: Calendar,
        category: ELEMENT_CATEGORIES.SIGNATURES,
        defaultProperties: {
          fontSize: 10,
          dateFormat: "DD/MM/YYYY",
          format: "Lu le: {value}"
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["date", "visa", "parent"],
        previewText: "Lu le: 20/12/2024",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.TEACHER_VISA_DATE,
        name: "Date Visa Enseignant",
        description: "Date du visa de l'enseignant",
        icon: Calendar,
        category: ELEMENT_CATEGORIES.SIGNATURES,
        defaultProperties: {
          fontSize: 10,
          dateFormat: "DD/MM/YYYY",
          format: "Le: {value}"
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["date", "visa", "enseignant"],
        previewText: "Le: 18/12/2024",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.HEADMASTER_VISA_DATE,
        name: "Date Visa Directeur",
        description: "Date du visa du directeur",
        icon: Calendar,
        category: ELEMENT_CATEGORIES.SIGNATURES,
        defaultProperties: {
          fontSize: 10,
          dateFormat: "DD/MM/YYYY",
          format: "Le: {value}"
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["date", "visa", "directeur"],
        previewText: "Le: 19/12/2024",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.SIGNATURE_BLOCK,
        name: "Bloc de Signatures",
        description: "Bloc groupé de toutes les signatures",
        icon: FileSignature,
        category: ELEMENT_CATEGORIES.SIGNATURES,
        defaultProperties: {
          showBorder: true,
          padding: 12,
          fontSize: 10,
          columns: [
            { field: "parentVisa", label: "VISA PARENT", width: 33, align: "center" },
            { field: "teacherVisa", label: "PROFESSEUR PRINCIPAL", width: 33, align: "center" },
            { field: "headmasterVisa", label: "LE DIRECTEUR", width: 34, align: "center" }
          ]
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["bloc", "signatures", "groupées"],
        previewText: "Bloc Signatures Groupées",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      }
    ]
  },

  // === 13. LOGOS ET TAMPONS OFFICIELS ===
  logos_stamps: {
    id: "logos_stamps",
    name: "Logos et Tampons Officiels",
    description: "Logos officiels, tampons et éléments d'authentification",
    icon: Stamp,
    color: "#7c3aed", // Violet
    sortOrder: 13,
    elements: [
      {
        id: ELEMENT_TYPES.SCHOOL_LOGO,
        name: "Logo de l'École",
        description: "Logo officiel de l'établissement",
        icon: School,
        category: ELEMENT_CATEGORIES.LOGOS_STAMPS,
        defaultProperties: {
          imageWidth: 60,
          imageHeight: 60,
          imageScale: "fit"
        },
        maxInstances: 3,
        isRequired: false,
        tags: ["logo", "école", "officiel"],
        previewText: "Logo École",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: false
      },
      {
        id: ELEMENT_TYPES.CAMEROON_REPUBLIC_LOGO,
        name: "Logo République du Cameroun",
        description: "Armoiries officielles du Cameroun",
        icon: Flag,
        category: ELEMENT_CATEGORIES.LOGOS_STAMPS,
        defaultProperties: {
          imageWidth: 50,
          imageHeight: 60,
          imageScale: "fit"
        },
        maxInstances: 2,
        isRequired: false,
        tags: ["cameroun", "république", "armoiries", "officiel"],
        previewText: "Armoiries Cameroun",
        africaSpecific: true,
        cameroonSpecific: true,
        multilingual: false
      },
      {
        id: ELEMENT_TYPES.MINISTERIAL_LOGO,
        name: "Logo Ministère Éducation",
        description: "Logo du Ministère de l'Éducation Nationale",
        icon: BookOpen,
        category: ELEMENT_CATEGORIES.LOGOS_STAMPS,
        defaultProperties: {
          imageWidth: 50,
          imageHeight: 50,
          imageScale: "fit"
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["ministère", "éducation", "officiel"],
        previewText: "Logo MINEDUC",
        africaSpecific: true,
        cameroonSpecific: true,
        multilingual: false
      },
      {
        id: ELEMENT_TYPES.SCHOOL_OFFICIAL_STAMP,
        name: "Tampon Officiel École",
        description: "Tampon rond ou carré de l'établissement",
        icon: Stamp,
        category: ELEMENT_CATEGORIES.LOGOS_STAMPS,
        defaultProperties: {
          imageWidth: 80,
          imageHeight: 80,
          imageScale: "fit",
          imageBorder: true
        },
        maxInstances: 2,
        isRequired: false,
        tags: ["tampon", "officiel", "école", "cachet"],
        previewText: "Tampon École",
        africaSpecific: true,
        cameroonSpecific: true,
        multilingual: false
      },
      {
        id: ELEMENT_TYPES.DIRECTOR_STAMP,
        name: "Tampon du Directeur",
        description: "Tampon personnel du directeur",
        icon: Crown,
        category: ELEMENT_CATEGORIES.LOGOS_STAMPS,
        defaultProperties: {
          imageWidth: 70,
          imageHeight: 40,
          imageScale: "fit"
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["tampon", "directeur", "personnel"],
        previewText: "Tampon Directeur",
        africaSpecific: true,
        cameroonSpecific: true,
        multilingual: false
      }
    ]
  },

  // === 14. TEXTE ET MISE EN PAGE ===
  text: {
    id: "text",
    name: "Texte et Labels",
    description: "Zones de texte libre, étiquettes et éléments textuels",
    icon: Type,
    color: "#374151", // Gris
    sortOrder: 14,
    elements: [
      {
        id: ELEMENT_TYPES.FREE_TEXT,
        name: "Texte Libre",
        description: "Zone de texte personnalisable",
        icon: Type,
        category: ELEMENT_CATEGORIES.TEXT,
        defaultProperties: {
          fontSize: 12,
          editable: true,
          placeholder: "Tapez votre texte ici...",
          maxLength: 1000
        },
        maxInstances: -1,
        isRequired: false,
        tags: ["texte", "libre", "personnalisé"],
        previewText: "Texte personnalisé...",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.TEXT_LABEL,
        name: "Étiquette de Texte",
        description: "Libellé ou titre de section",
        icon: Type,
        category: ELEMENT_CATEGORIES.TEXT,
        defaultProperties: {
          fontSize: 12,
          fontWeight: "bold",
          editable: true
        },
        maxInstances: -1,
        isRequired: false,
        tags: ["étiquette", "label", "titre"],
        previewText: "Étiquette:",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.BULLETIN_HEADER,
        name: "En-tête Bulletin",
        description: "En-tête personnalisé du bulletin",
        icon: Type,
        category: ELEMENT_CATEGORIES.TEXT,
        defaultProperties: {
          fontSize: 18,
          fontWeight: "bold",
          textAlign: "center",
          showBorder: true,
          padding: 10
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["en-tête", "header", "bulletin"],
        previewText: "EN-TÊTE PERSONNALISÉ",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.BULLETIN_FOOTER,
        name: "Pied de Page",
        description: "Pied de page du bulletin",
        icon: Type,
        category: ELEMENT_CATEGORIES.TEXT,
        defaultProperties: {
          fontSize: 10,
          textAlign: "center",
          color: "#6b7280"
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["pied", "footer", "page"],
        previewText: "Pied de page bulletin",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.GRADE_SCALE_LEGEND,
        name: "Légende Échelle Notes",
        description: "Explication de l'échelle de notation",
        icon: BarChart3,
        category: ELEMENT_CATEGORIES.TEXT,
        defaultProperties: {
          fontSize: 9,
          showBorder: true,
          padding: 6
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["légende", "échelle", "notes", "explication"],
        previewText: "Échelle: 0-20 points",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.INSTRUCTIONS_TEXT,
        name: "Texte d'Instructions",
        description: "Instructions ou consignes pour les parents",
        icon: FileText,
        category: ELEMENT_CATEGORIES.TEXT,
        defaultProperties: {
          fontSize: 9,
          color: "#6b7280",
          textAlign: "justify"
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["instructions", "consignes", "parents"],
        previewText: "Instructions pour les parents...",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      }
    ]
  },

  // === 15. IMAGES ET ÉLÉMENTS VISUELS ===
  images: {
    id: "images",
    name: "Images et Visuels",
    description: "Images décoratives, QR codes et éléments visuels",
    icon: Image,
    color: "#059669", // Vert
    sortOrder: 15,
    elements: [
      {
        id: ELEMENT_TYPES.BACKGROUND_IMAGE,
        name: "Image de Fond",
        description: "Image d'arrière-plan du bulletin",
        icon: Image,
        category: ELEMENT_CATEGORIES.IMAGES,
        defaultProperties: {
          imageScale: "stretch",
          zIndex: -1
        },
        maxInstances: 1,
        isRequired: false,
        tags: ["fond", "arrière-plan", "image"],
        previewText: "Image Fond",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: false
      },
      {
        id: ELEMENT_TYPES.DECORATIVE_IMAGE,
        name: "Image Décorative",
        description: "Image décorative ou illustration",
        icon: Image,
        category: ELEMENT_CATEGORIES.IMAGES,
        defaultProperties: {
          imageWidth: 100,
          imageHeight: 100,
          imageScale: "fit"
        },
        maxInstances: -1,
        isRequired: false,
        tags: ["décorative", "illustration", "ornement"],
        previewText: "Image Déco",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: false
      },
      {
        id: ELEMENT_TYPES.QR_CODE,
        name: "QR Code",
        description: "QR Code pour vérification ou lien",
        icon: Grid,
        category: ELEMENT_CATEGORIES.IMAGES,
        defaultProperties: {
          imageWidth: 50,
          imageHeight: 50,
          imageBorder: true
        },
        maxInstances: 3,
        isRequired: false,
        tags: ["qr", "code", "vérification", "lien"],
        previewText: "QR Code",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: false
      },
      {
        id: ELEMENT_TYPES.BARCODE,
        name: "Code-barres",
        description: "Code-barres pour identification",
        icon: BarChart3,
        category: ELEMENT_CATEGORIES.IMAGES,
        defaultProperties: {
          imageWidth: 120,
          imageHeight: 30
        },
        maxInstances: 2,
        isRequired: false,
        tags: ["code-barres", "identification"],
        previewText: "Code-barres",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: false
      }
    ]
  },

  // === 16. MISE EN PAGE ET STRUCTURE ===
  layout: {
    id: "layout",
    name: "Mise en Page",
    description: "Éléments structurants : bordures, séparateurs, espaces et conteneurs",
    icon: Layout,
    color: "#6b7280", // Gris
    sortOrder: 16,
    elements: [
      {
        id: ELEMENT_TYPES.DIVIDER,
        name: "Séparateur",
        description: "Ligne de séparation horizontale ou verticale",
        icon: Divide,
        category: ELEMENT_CATEGORIES.LAYOUT,
        defaultProperties: {
          borderWidth: 1,
          borderColor: "#374151",
          borderStyle: "solid"
        },
        maxInstances: -1,
        isRequired: false,
        tags: ["séparateur", "ligne", "division"],
        previewText: "———————————",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: false
      },
      {
        id: ELEMENT_TYPES.SPACER,
        name: "Espace",
        description: "Espace vide pour la mise en page",
        icon: Layout,
        category: ELEMENT_CATEGORIES.LAYOUT,
        defaultProperties: {
          backgroundColor: "transparent"
        },
        maxInstances: -1,
        isRequired: false,
        tags: ["espace", "vide", "espacement"],
        previewText: "[Espace]",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: false
      },
      {
        id: ELEMENT_TYPES.BORDER,
        name: "Bordure",
        description: "Bordure ou cadre décoratif",
        icon: Grid,
        category: ELEMENT_CATEGORIES.LAYOUT,
        defaultProperties: {
          borderWidth: 2,
          borderColor: "#1f2937",
          borderStyle: "solid",
          backgroundColor: "transparent"
        },
        maxInstances: -1,
        isRequired: false,
        tags: ["bordure", "cadre", "contour"],
        previewText: "┌─ Bordure ─┐",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: false
      },
      {
        id: ELEMENT_TYPES.TABLE_CONTAINER,
        name: "Conteneur Tableau",
        description: "Conteneur pour organiser des éléments en tableau",
        icon: Grid,
        category: ELEMENT_CATEGORIES.LAYOUT,
        defaultProperties: {
          showBorder: true,
          padding: 8
        },
        maxInstances: -1,
        isRequired: false,
        tags: ["conteneur", "tableau", "grille"],
        previewText: "Conteneur Tableau",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: false
      },
      {
        id: ELEMENT_TYPES.SECTION_HEADER,
        name: "En-tête de Section",
        description: "Titre de section avec style",
        icon: Type,
        category: ELEMENT_CATEGORIES.LAYOUT,
        defaultProperties: {
          fontSize: 14,
          fontWeight: "bold",
          textAlign: "center",
          showBorder: true,
          padding: 6,
          backgroundColor: "#f3f4f6"
        },
        maxInstances: -1,
        isRequired: false,
        tags: ["section", "titre", "en-tête"],
        previewText: "TITRE SECTION",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: true
      },
      {
        id: ELEMENT_TYPES.PAGE_BREAK,
        name: "Saut de Page",
        description: "Saut de page pour l'impression",
        icon: FileText,
        category: ELEMENT_CATEGORIES.LAYOUT,
        defaultProperties: {
          visible: false
        },
        maxInstances: -1,
        isRequired: false,
        tags: ["saut", "page", "impression"],
        previewText: "[Saut Page]",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: false
      },
      {
        id: ELEMENT_TYPES.GRID_CONTAINER,
        name: "Container Grille",
        description: "Conteneur en grille pour mise en page avancée",
        icon: Grid,
        category: ELEMENT_CATEGORIES.LAYOUT,
        defaultProperties: {
          showBorder: false,
          padding: 0
        },
        maxInstances: -1,
        isRequired: false,
        tags: ["grille", "container", "mise en page"],
        previewText: "Container Grille",
        africaSpecific: false,
        cameroonSpecific: false,
        multilingual: false
      }
    ]
  }
};

// Fonctions utilitaires pour la bibliothèque
export class BulletinElementLibrary {
  
  /**
   * Obtient toutes les catégories triées par ordre logique
   */
  static getCategories(): CategoryUIConfig[] {
    return Object.values(BULLETIN_ELEMENT_LIBRARY)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  /**
   * Obtient tous les éléments d'une catégorie
   */
  static getElementsByCategory(categoryId: string): ElementUIConfig[] {
    const category = BULLETIN_ELEMENT_LIBRARY[categoryId];
    return category ? category.elements : [];
  }

  /**
   * Recherche des éléments par mots-clés
   */
  static searchElements(query: string): ElementUIConfig[] {
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
    const results: ElementUIConfig[] = [];

    Object.values(BULLETIN_ELEMENT_LIBRARY).forEach(category => {
      category.elements.forEach(element => {
        const searchText = `${element.name} ${element.description} ${element.tags.join(' ')}`.toLowerCase();
        const matches = searchTerms.every(term => searchText.includes(term));
        if (matches) {
          results.push(element);
        }
      });
    });

    return results;
  }

  /**
   * Filtre les éléments selon des critères
   */
  static filterElements(filters: {
    africaSpecific?: boolean;
    cameroonSpecific?: boolean;
    multilingual?: boolean;
    required?: boolean;
    category?: string;
  }): ElementUIConfig[] {
    const results: ElementUIConfig[] = [];

    Object.values(BULLETIN_ELEMENT_LIBRARY).forEach(category => {
      if (filters.category && category.id !== filters.category) return;

      category.elements.forEach(element => {
        let matches = true;

        if (filters.africaSpecific !== undefined && element.africaSpecific !== filters.africaSpecific) {
          matches = false;
        }
        if (filters.cameroonSpecific !== undefined && element.cameroonSpecific !== filters.cameroonSpecific) {
          matches = false;
        }
        if (filters.multilingual !== undefined && element.multilingual !== filters.multilingual) {
          matches = false;
        }
        if (filters.required !== undefined && element.isRequired !== filters.required) {
          matches = false;
        }

        if (matches) {
          results.push(element);
        }
      });
    });

    return results;
  }

  /**
   * Obtient les éléments essentiels pour un bulletin complet
   */
  static getRequiredElements(): ElementUIConfig[] {
    return this.filterElements({ required: true });
  }

  /**
   * Obtient les éléments spécifiques au Cameroun
   */
  static getCameroonSpecificElements(): ElementUIConfig[] {
    return this.filterElements({ cameroonSpecific: true });
  }

  /**
   * Obtient la configuration d'un élément par son ID
   */
  static getElementById(elementId: string): ElementUIConfig | null {
    for (const category of Object.values(BULLETIN_ELEMENT_LIBRARY)) {
      const element = category.elements.find(el => el.id === elementId);
      if (element) return element;
    }
    return null;
  }

  /**
   * Valide qu'un template contient les éléments essentiels
   */
  static validateTemplateCompleteness(elementIds: string[]): {
    isComplete: boolean;
    missingRequired: string[];
    suggestions: string[];
  } {
    const requiredElements = this.getRequiredElements();
    const missingRequired = requiredElements
      .filter(req => !elementIds.includes(req.id))
      .map(req => req.name);

    const suggestions = [];
    if (!elementIds.some(id => id.includes('signature'))) {
      suggestions.push('Ajouter au moins une signature (parent, enseignant, directeur)');
    }
    if (!elementIds.some(id => id.includes('grade'))) {
      suggestions.push('Ajouter un tableau de notes ou des éléments de notation');
    }

    return {
      isComplete: missingRequired.length === 0,
      missingRequired,
      suggestions
    };
  }
}

// Export des constantes et types
export { BULLETIN_ELEMENT_LIBRARY };
export type { ElementUIConfig, CategoryUIConfig };
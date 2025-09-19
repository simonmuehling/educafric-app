/**
 * MAPPING DES ÉLÉMENTS DE TEMPLATE AVEC LES DONNÉES RÉELLES
 * 
 * Ce fichier définit comment chaque type d'élément du template de bulletin
 * se connecte aux champs de données du bulletinComprehensiveSchema et des tables associées.
 * 
 * Chaque mapping inclut :
 * - Le champ de données source
 * - Le format d'affichage par défaut
 * - La gestion des données manquantes
 * - Les validations spécifiques
 */

import { z } from "zod";

// Types pour le mapping des données
export interface ElementDataMapping {
  elementType: string;
  category: string;
  dataSource: "bulletin_comprehensive" | "bulletin_subject_codes" | "student" | "class" | "school" | "grades";
  dataField: string;
  fallbackValue?: any;
  format?: string;
  validation?: z.ZodSchema<any>;
  dependencies?: string[]; // Autres champs requis
  conditional?: {
    field: string;
    value: any;
    operator: "equals" | "not_equals" | "greater_than" | "less_than";
  };
  multilingual?: {
    fr: string;
    en: string;
  };
  description: string;
}

// Mapping complet des éléments vers les données
export const BULLETIN_ELEMENT_MAPPINGS: Record<string, ElementDataMapping> = {

  // === CATEGORY: HEADER (En-tête du bulletin) ===
  bulletin_title: {
    elementType: "bulletin_title",
    category: "header", 
    dataSource: "bulletin_comprehensive",
    dataField: "term",
    fallbackValue: "Bulletin Scolaire",
    format: "BULLETIN SCOLAIRE - {term} {academicYear}",
    description: "Titre principal du bulletin avec trimestre et année"
  },

  school_name: {
    elementType: "school_name",
    category: "header",
    dataSource: "school",
    dataField: "name",
    fallbackValue: "École Non Spécifiée",
    description: "Nom de l'établissement scolaire"
  },

  school_address: {
    elementType: "school_address", 
    category: "header",
    dataSource: "school",
    dataField: "address",
    fallbackValue: "",
    description: "Adresse complète de l'école"
  },

  school_phone: {
    elementType: "school_phone",
    category: "header", 
    dataSource: "school",
    dataField: "phone",
    fallbackValue: "",
    format: "Tél: {value}",
    description: "Numéro de téléphone de l'école"
  },

  performance_levels_text: {
    elementType: "performance_levels_text",
    category: "header",
    dataSource: "bulletin_comprehensive",
    dataField: "static", // Texte statique multilingue
    multilingual: {
      fr: "NIVEAU DE RENDEMENT:\nDESCRIPTION DES NIVEAUX DE RENDEMENT DE L'ÉLÈVE\nLe niveau de rendement est déterminé par les résultats obtenus après l'évaluation des apprentissages...",
      en: "PERFORMANCE LEVELS:\nDESCRIPTION OF STUDENT PERFORMANCE LEVELS\nThe level of performance is determined by the score obtained in the summative assessment..."
    },
    description: "Texte explicatif des niveaux de performance (bilingue)"
  },

  // === CATEGORY: STUDENT_INFO (Informations élève) ===
  student_name: {
    elementType: "student_name",
    category: "student_info",
    dataSource: "student", 
    dataField: "firstName,lastName",
    fallbackValue: "Nom Non Renseigné",
    format: "{lastName} {firstName}",
    description: "Nom complet de l'élève (Nom Prénom)"
  },

  student_matricule: {
    elementType: "student_matricule",
    category: "student_info",
    dataSource: "student",
    dataField: "matricule", 
    fallbackValue: "MAT-XXXX",
    format: "Matricule: {value}",
    description: "Numéro matricule de l'élève"
  },

  student_class: {
    elementType: "student_class",
    category: "student_info",
    dataSource: "class",
    dataField: "name",
    fallbackValue: "Classe Non Définie", 
    format: "Classe: {value}",
    description: "Classe de l'élève"
  },

  student_photo: {
    elementType: "student_photo",
    category: "student_info",
    dataSource: "student",
    dataField: "photo",
    fallbackValue: "/images/default-student.png",
    description: "Photo de l'élève"
  },

  student_birth_date: {
    elementType: "student_birth_date",
    category: "student_info", 
    dataSource: "student",
    dataField: "birthDate",
    fallbackValue: "",
    format: "DD/MM/YYYY",
    description: "Date de naissance de l'élève"
  },

  student_gender: {
    elementType: "student_gender",
    category: "student_info",
    dataSource: "student", 
    dataField: "gender",
    fallbackValue: "",
    multilingual: {
      fr: "Sexe: {value}",
      en: "Gender: {value}"
    },
    description: "Sexe de l'élève"
  },

  student_age: {
    elementType: "student_age",
    category: "student_info",
    dataSource: "student",
    dataField: "birthDate", // Calculé à partir de la date de naissance
    fallbackValue: "",
    format: "{calculated_age} ans",
    description: "Âge de l'élève (calculé)"
  },

  // === CATEGORY: ACADEMIC_INFO (Informations académiques) ===
  academic_year: {
    elementType: "academic_year",
    category: "academic_info",
    dataSource: "bulletin_comprehensive", 
    dataField: "academicYear",
    fallbackValue: "2024-2025",
    format: "Année Scolaire: {value}",
    description: "Année scolaire en cours"
  },

  term_semester: {
    elementType: "term_semester",
    category: "academic_info",
    dataSource: "bulletin_comprehensive",
    dataField: "term",
    fallbackValue: "T1",
    multilingual: {
      fr: "Trimestre: {value}",
      en: "Term: {value}" 
    },
    description: "Trimestre ou semestre"
  },

  class_level: {
    elementType: "class_level", 
    category: "academic_info",
    dataSource: "class",
    dataField: "level",
    fallbackValue: "",
    description: "Niveau de la classe (6ème, CM2, etc.)"
  },

  total_students: {
    elementType: "total_students",
    category: "academic_info",
    dataSource: "class",
    dataField: "studentCount", 
    fallbackValue: 0,
    format: "Effectif: {value} élèves",
    description: "Nombre total d'élèves dans la classe"
  },

  // === CATEGORY: GRADES (Notes et évaluations) ===
  subject_grades: {
    elementType: "subject_grades",
    category: "grades",
    dataSource: "grades",
    dataField: "subjects", // Tableau des matières avec notes
    fallbackValue: [],
    description: "Tableau complet des notes par matière"
  },

  subject_grades_detailed: {
    elementType: "subject_grades_detailed",
    category: "grades", 
    dataSource: "grades",
    dataField: "subjects_detailed", // Avec 1ère, 2ème, 3ème évaluation
    fallbackValue: [],
    description: "Notes détaillées par évaluation"
  },

  individual_subject_grade: {
    elementType: "individual_subject_grade",
    category: "grades",
    dataSource: "grades",
    dataField: "subject_grade",
    fallbackValue: "--",
    format: "{value}/20",
    validation: z.number().min(0).max(20),
    description: "Note d'une matière spécifique"
  },

  subject_comment: {
    elementType: "subject_comment",
    category: "grades",
    dataSource: "grades", 
    dataField: "subjectComments",
    fallbackValue: "",
    description: "Commentaire par matière"
  },

  // === CATEGORY: COEFFICIENTS (Coefficients et codes) ===
  ctba_value: {
    elementType: "ctba_value",
    category: "coefficients",
    dataSource: "bulletin_subject_codes",
    dataField: "CTBA",
    fallbackValue: "--",
    format: "{value}/20",
    validation: z.number().min(0).max(20),
    description: "Contrôle Total des Bases Acquises"
  },

  cba_value: {
    elementType: "cba_value", 
    category: "coefficients",
    dataSource: "bulletin_subject_codes", 
    dataField: "CBA",
    fallbackValue: "--",
    format: "{value}/20",
    validation: z.number().min(0).max(20),
    description: "Contrôle des Bases Acquises"
  },

  ca_value: {
    elementType: "ca_value",
    category: "coefficients",
    dataSource: "bulletin_subject_codes",
    dataField: "CA", 
    fallbackValue: "--",
    format: "{value}/20", 
    validation: z.number().min(0).max(20),
    description: "Contrôle d'Approfondissement"
  },

  cma_value: {
    elementType: "cma_value",
    category: "coefficients",
    dataSource: "bulletin_subject_codes",
    dataField: "CMA",
    fallbackValue: "--",
    format: "{value}/20",
    validation: z.number().min(0).max(20),
    description: "Contrôle de Maîtrise Approfondie"
  },

  cote_value: {
    elementType: "cote_value",
    category: "coefficients", 
    dataSource: "bulletin_subject_codes",
    dataField: "COTE",
    fallbackValue: "--",
    validation: z.enum(["A", "B", "C", "D", "E", "F"]),
    description: "Cote alphabétique (A-F)"
  },

  cna_value: {
    elementType: "cna_value",
    category: "coefficients",
    dataSource: "bulletin_subject_codes", 
    dataField: "CNA",
    fallbackValue: "",
    description: "Indicateur Compétence Non Acquise"
  },

  min_max_grades: {
    elementType: "min_max_grades",
    category: "coefficients",
    dataSource: "bulletin_subject_codes",
    dataField: "minGrade,maxGrade",
    fallbackValue: "--",
    format: "[{minGrade}-{maxGrade}]",
    description: "Valeurs minimum et maximum par matière"
  },

  coefficient_table: {
    elementType: "coefficient_table",
    category: "coefficients",
    dataSource: "bulletin_subject_codes", 
    dataField: "subjects_coefficients", // Tableau des coefficients
    fallbackValue: [],
    description: "Tableau des coefficients par matière"
  },

  // === CATEGORY: AVERAGES (Moyennes et totaux) ===
  general_average: {
    elementType: "general_average",
    category: "averages",
    dataSource: "bulletin_comprehensive",
    dataField: "generalAverage",
    fallbackValue: "--",
    format: "{value}/20",
    validation: z.number().min(0).max(20),
    description: "Moyenne générale de l'élève"
  },

  trimester_average: {
    elementType: "trimester_average",
    category: "averages",
    dataSource: "bulletin_comprehensive", 
    dataField: "trimesterAverage",
    fallbackValue: "--",
    format: "{value}/20",
    validation: z.number().min(0).max(20),
    description: "Moyenne du trimestre"
  },

  subject_average: {
    elementType: "subject_average",
    category: "averages",
    dataSource: "grades",
    dataField: "termAverage", 
    fallbackValue: "--",
    format: "{value}/20",
    validation: z.number().min(0).max(20),
    description: "Moyenne par matière"
  },

  total_general: {
    elementType: "total_general",
    category: "averages",
    dataSource: "bulletin_comprehensive",
    dataField: "totalGeneral",
    fallbackValue: "--",
    format: "{value}",
    description: "Total général pondéré"
  },

  number_of_averages: {
    elementType: "number_of_averages",
    category: "averages", 
    dataSource: "bulletin_comprehensive",
    dataField: "numberOfAverages",
    fallbackValue: 0,
    format: "{value} matières",
    description: "Nombre de moyennes/matières"
  },

  class_average: {
    elementType: "class_average",
    category: "averages",
    dataSource: "class",
    dataField: "classAverage", // Calculé
    fallbackValue: "--",
    format: "{value}/20",
    description: "Moyenne de la classe"
  },

  // === CATEGORY: STATISTICS (Statistiques et classements) ===
  class_rank: {
    elementType: "class_rank",
    category: "statistics",
    dataSource: "bulletin_comprehensive",
    dataField: "classRank", // Calculé
    fallbackValue: "--",
    format: "{rank}e/{total}",
    dependencies: ["totalStudents"],
    description: "Rang de l'élève dans la classe"
  },

  success_rate: {
    elementType: "success_rate",
    category: "statistics",
    dataSource: "bulletin_comprehensive", 
    dataField: "successRate",
    fallbackValue: "--",
    format: "{value}%",
    validation: z.number().min(0).max(100),
    description: "Taux de réussite en pourcentage"
  },

  performance_level: {
    elementType: "performance_level",
    category: "statistics",
    dataSource: "bulletin_comprehensive",
    dataField: "generalAverage", // Calculé à partir de la moyenne
    fallbackValue: "--",
    format: "Niveau {level}",
    description: "Niveau de performance (1-4)"
  },

  class_profile: {
    elementType: "class_profile",
    category: "statistics",
    dataSource: "bulletin_comprehensive", 
    dataField: "classProfile",
    fallbackValue: {},
    description: "Profil statistique de la classe"
  },

  grade_distribution: {
    elementType: "grade_distribution",
    category: "statistics",
    dataSource: "class",
    dataField: "gradeDistribution", // Calculé
    fallbackValue: {},
    description: "Répartition des notes dans la classe"
  },

  // === CATEGORY: ATTENDANCE (Absences et retards) ===
  unjustified_absences: {
    elementType: "unjustified_absences",
    category: "attendance",
    dataSource: "bulletin_comprehensive",
    dataField: "unjustifiedAbsenceHours",
    fallbackValue: "0.00",
    format: "{value}h",
    validation: z.number().min(0),
    description: "Heures d'absences injustifiées"
  },

  justified_absences: {
    elementType: "justified_absences",
    category: "attendance", 
    dataSource: "bulletin_comprehensive",
    dataField: "justifiedAbsenceHours",
    fallbackValue: "0.00",
    format: "{value}h",
    validation: z.number().min(0),
    description: "Heures d'absences justifiées"
  },

  lateness_count: {
    elementType: "lateness_count",
    category: "attendance",
    dataSource: "bulletin_comprehensive",
    dataField: "latenessCount", 
    fallbackValue: 0,
    format: "{value} retards",
    validation: z.number().min(0),
    description: "Nombre de retards"
  },

  detention_hours: {
    elementType: "detention_hours",
    category: "attendance",
    dataSource: "bulletin_comprehensive",
    dataField: "detentionHours",
    fallbackValue: "0.00", 
    format: "{value}h",
    validation: z.number().min(0),
    description: "Heures de consigne"
  },

  total_absence_hours: {
    elementType: "total_absence_hours",
    category: "attendance",
    dataSource: "bulletin_comprehensive",
    dataField: "unjustifiedAbsenceHours,justifiedAbsenceHours", // Calculé
    fallbackValue: "0.00",
    format: "{value}h",
    description: "Total des heures d'absence"
  },

  attendance_rate: {
    elementType: "attendance_rate", 
    category: "attendance",
    dataSource: "bulletin_comprehensive",
    dataField: "calculated", // Calculé à partir des absences
    fallbackValue: "100%",
    format: "{value}%",
    description: "Taux d'assiduité"
  },

  // === CATEGORY: SANCTIONS (Sanctions disciplinaires) ===
  conduct_warning: {
    elementType: "conduct_warning",
    category: "sanctions",
    dataSource: "bulletin_comprehensive",
    dataField: "conductWarning",
    fallbackValue: false,
    format: "{value ? 'OUI' : 'NON'}",
    description: "Avertissement de conduite"
  },

  conduct_blame: {
    elementType: "conduct_blame",
    category: "sanctions", 
    dataSource: "bulletin_comprehensive",
    dataField: "conductBlame",
    fallbackValue: false,
    format: "{value ? 'OUI' : 'NON'}",
    description: "Blâme de conduite"
  },

  exclusion_days: {
    elementType: "exclusion_days",
    category: "sanctions",
    dataSource: "bulletin_comprehensive",
    dataField: "exclusionDays",
    fallbackValue: 0,
    format: "{value} jours",
    validation: z.number().min(0),
    description: "Jours d'exclusion"
  },

  permanent_exclusion: {
    elementType: "permanent_exclusion",
    category: "sanctions",
    dataSource: "bulletin_comprehensive", 
    dataField: "permanentExclusion",
    fallbackValue: false,
    format: "{value ? 'OUI' : 'NON'}",
    description: "Exclusion définitive"
  },

  disciplinary_record: {
    elementType: "disciplinary_record",
    category: "sanctions",
    dataSource: "bulletin_comprehensive",
    dataField: "conductWarning,conductBlame,exclusionDays,permanentExclusion", // Agrégé
    fallbackValue: {},
    description: "Dossier disciplinaire complet"
  },

  // === CATEGORY: APPRECIATIONS (Appréciations et commentaires) ===
  work_appreciation: {
    elementType: "work_appreciation",
    category: "appreciations",
    dataSource: "bulletin_comprehensive", 
    dataField: "workAppreciation",
    fallbackValue: "",
    validation: z.string().max(500),
    description: "Appréciation du travail de l'élève"
  },

  general_comment: {
    elementType: "general_comment",
    category: "appreciations",
    dataSource: "bulletin_comprehensive",
    dataField: "generalComment",
    fallbackValue: "",
    validation: z.string().max(300),
    description: "Commentaire général"
  },

  teacher_appreciation: {
    elementType: "teacher_appreciation",
    category: "appreciations",
    dataSource: "grades",
    dataField: "teacherComment", // Commentaire du professeur principal
    fallbackValue: "",
    description: "Appréciation du professeur principal"
  },

  progress_comment: {
    elementType: "progress_comment",
    category: "appreciations", 
    dataSource: "bulletin_comprehensive",
    dataField: "progressComment", // Champ potentiel à ajouter
    fallbackValue: "",
    description: "Commentaire sur les progrès"
  },

  improvement_areas: {
    elementType: "improvement_areas",
    category: "appreciations",
    dataSource: "bulletin_comprehensive",
    dataField: "improvementAreas", // Champ potentiel à ajouter 
    fallbackValue: "",
    description: "Points à améliorer"
  },

  strengths: {
    elementType: "strengths",
    category: "appreciations",
    dataSource: "bulletin_comprehensive",
    dataField: "strengths", // Champ potentiel à ajouter
    fallbackValue: "",
    description: "Points forts de l'élève"
  },

  // === CATEGORY: CLASS_COUNCIL (Conseil de classe) ===
  class_council_decisions: {
    elementType: "class_council_decisions",
    category: "class_council", 
    dataSource: "bulletin_comprehensive",
    dataField: "classCouncilDecisions",
    fallbackValue: "",
    validation: z.string().max(1000),
    description: "Décisions du conseil de classe"
  },

  class_council_mentions: {
    elementType: "class_council_mentions",
    category: "class_council",
    dataSource: "bulletin_comprehensive",
    dataField: "classCouncilMentions",
    fallbackValue: "",
    validation: z.enum(["Félicitations", "Encouragements", "Satisfaisant", "Mise en garde", "Blâme", ""]),
    description: "Mentions du conseil de classe"
  },

  orientation_recommendations: {
    elementType: "orientation_recommendations",
    category: "class_council",
    dataSource: "bulletin_comprehensive",
    dataField: "orientationRecommendations",
    fallbackValue: "",
    validation: z.string().max(1000),
    description: "Recommandations d'orientation"
  },

  council_date: {
    elementType: "council_date",
    category: "class_council", 
    dataSource: "bulletin_comprehensive",
    dataField: "councilDate",
    fallbackValue: "",
    format: "DD/MM/YYYY",
    description: "Date du conseil de classe"
  },

  council_participants: {
    elementType: "council_participants",
    category: "class_council",
    dataSource: "bulletin_comprehensive",
    dataField: "councilParticipants",
    fallbackValue: "",
    validation: z.string().max(500),
    description: "Participants du conseil de classe"
  },

  council_president: {
    elementType: "council_president",
    category: "class_council",
    dataSource: "school",
    dataField: "principal", // Directeur de l'école
    fallbackValue: "",
    description: "Président du conseil de classe"
  },

  // === CATEGORY: SIGNATURES (Signatures et visas) ===
  parent_signature: {
    elementType: "parent_signature",
    category: "signatures",
    dataSource: "bulletin_comprehensive", 
    dataField: "parentVisa",
    fallbackValue: { name: "", date: "", signatureUrl: "" },
    description: "Signature du parent"
  },

  teacher_signature: {
    elementType: "teacher_signature",
    category: "signatures",
    dataSource: "bulletin_comprehensive",
    dataField: "teacherVisa",
    fallbackValue: { name: "", date: "", signatureUrl: "" },
    description: "Signature de l'enseignant"
  },

  headmaster_signature: {
    elementType: "headmaster_signature",
    category: "signatures",
    dataSource: "bulletin_comprehensive",
    dataField: "headmasterVisa", 
    fallbackValue: { name: "", date: "", signatureUrl: "" },
    description: "Signature du directeur"
  },

  parent_visa_date: {
    elementType: "parent_visa_date",
    category: "signatures",
    dataSource: "bulletin_comprehensive",
    dataField: "parentVisa.date",
    fallbackValue: "",
    format: "DD/MM/YYYY",
    description: "Date du visa parent"
  },

  teacher_visa_date: {
    elementType: "teacher_visa_date",
    category: "signatures",
    dataSource: "bulletin_comprehensive", 
    dataField: "teacherVisa.date",
    fallbackValue: "",
    format: "DD/MM/YYYY",
    description: "Date du visa enseignant"
  },

  headmaster_visa_date: {
    elementType: "headmaster_visa_date",
    category: "signatures",
    dataSource: "bulletin_comprehensive",
    dataField: "headmasterVisa.date",
    fallbackValue: "",
    format: "DD/MM/YYYY",
    description: "Date du visa directeur"
  },

  signature_block: {
    elementType: "signature_block",
    category: "signatures",
    dataSource: "bulletin_comprehensive",
    dataField: "parentVisa,teacherVisa,headmasterVisa", // Bloc groupé
    fallbackValue: {},
    description: "Bloc de signatures groupées"
  }

  // === CATEGORY: LOGOS_STAMPS (Logos et tampons officiels) ===
  // Ces éléments utilisent des images statiques ou configurées par l'école
  // Les mappings seront ajoutés dans la phase suivante

  // === CATEGORY: TEXT, IMAGES, LAYOUT ===
  // Ces éléments sont principalement statiques ou configurables
  // Les mappings seront définis selon les besoins spécifiques
};

// Fonctions utilitaires pour le mapping des données
export class BulletinDataMapper {
  
  /**
   * Résout la valeur d'un élément à partir de ses données sources
   */
  static resolveElementValue(
    elementType: string,
    data: {
      bulletin: any;
      student: any;
      class: any;
      school: any;
      grades: any[];
      subjectCodes: any[];
    }
  ): any {
    const mapping = BULLETIN_ELEMENT_MAPPINGS[elementType];
    if (!mapping) return null;

    const sourceData = this.getSourceData(mapping.dataSource, data);
    const rawValue = this.extractFieldValue(mapping.dataField, sourceData);
    
    return this.formatValue(rawValue, mapping);
  }

  /**
   * Obtient les données source selon le type
   */
  private static getSourceData(source: string, data: any): any {
    switch (source) {
      case "bulletin_comprehensive":
        return data.bulletin;
      case "bulletin_subject_codes":
        return data.subjectCodes;
      case "student":
        return data.student;
      case "class":
        return data.class;
      case "school":
        return data.school;
      case "grades":
        return data.grades;
      default:
        return null;
    }
  }

  /**
   * Extrait la valeur d'un champ (supporte les champs composés)
   */
  private static extractFieldValue(fieldPath: string, sourceData: any): any {
    if (!sourceData) return null;

    // Gestion des champs multiples (ex: "firstName,lastName")
    if (fieldPath.includes(',')) {
      const fields = fieldPath.split(',');
      const values: Record<string, any> = {};
      fields.forEach(field => {
        values[field] = this.getNestedValue(sourceData, field.trim());
      });
      return values;
    }

    // Gestion des champs imbriqués (ex: "parentVisa.date")
    return this.getNestedValue(sourceData, fieldPath);
  }

  /**
   * Obtient une valeur imbriquée d'un objet
   */
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  /**
   * Formate une valeur selon le mapping
   */
  private static formatValue(value: any, mapping: ElementDataMapping): any {
    if (value === null || value === undefined) {
      return mapping.fallbackValue;
    }

    if (mapping.format) {
      return this.applyFormat(value, mapping.format, mapping);
    }

    return value;
  }

  /**
   * Applique un format à une valeur
   */
  private static applyFormat(value: any, format: string, mapping: ElementDataMapping): string {
    if (typeof value === 'object' && value !== null) {
      // Remplace les placeholders dans le format par les valeurs de l'objet
      return format.replace(/\{(\w+)\}/g, (match, key) => {
        return value[key] !== undefined ? value[key] : match;
      });
    }

    return format.replace(/\{value\}/g, String(value));
  }

  /**
   * Valide une valeur selon le mapping
   */
  static validateElementValue(elementType: string, value: any): boolean {
    const mapping = BULLETIN_ELEMENT_MAPPINGS[elementType];
    if (!mapping?.validation) return true;

    try {
      mapping.validation.parse(value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Obtient tous les éléments d'une catégorie
   */
  static getElementsByCategory(category: string): ElementDataMapping[] {
    return Object.values(BULLETIN_ELEMENT_MAPPINGS)
      .filter(mapping => mapping.category === category);
  }

  /**
   * Obtient les dépendances d'un élément
   */
  static getElementDependencies(elementType: string): string[] {
    const mapping = BULLETIN_ELEMENT_MAPPINGS[elementType];
    return mapping?.dependencies || [];
  }
}

// Export des types pour utilisation dans d'autres modules
export type { ElementDataMapping };
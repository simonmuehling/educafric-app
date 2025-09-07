// ===== SUBJECT TEMPLATES BY CLASS LEVEL =====
// Templates de matières avec coefficients pour chaque niveau scolaire

export interface SubjectTemplate {
  name: string;
  coefficient: number;
  category: 'general' | 'professional' | 'arts' | 'sports';
  hoursPerWeek: number;
  isRequired: boolean;
  curriculumCode?: string;
}

export interface LevelTemplate {
  level: string;
  levelName: string;
  subjects: SubjectTemplate[];
}

// Templates conformes au curriculum camerounais
export const CAMEROON_CURRICULUM_TEMPLATES: LevelTemplate[] = [
  {
    level: 'cp',
    levelName: 'Cours Préparatoire',
    subjects: [
      { name: 'Français', coefficient: 5, category: 'general', hoursPerWeek: 8, isRequired: true, curriculumCode: 'FR-CP' },
      { name: 'Mathématiques', coefficient: 4, category: 'general', hoursPerWeek: 6, isRequired: true, curriculumCode: 'MT-CP' },
      { name: 'Éducation Civique', coefficient: 2, category: 'general', hoursPerWeek: 2, isRequired: true, curriculumCode: 'EC-CP' },
      { name: 'Histoire-Géographie', coefficient: 2, category: 'general', hoursPerWeek: 3, isRequired: true, curriculumCode: 'HG-CP' },
      { name: 'Éducation Physique', coefficient: 2, category: 'sports', hoursPerWeek: 3, isRequired: true, curriculumCode: 'EP-CP' },
      { name: 'Arts Plastiques', coefficient: 1, category: 'arts', hoursPerWeek: 2, isRequired: true, curriculumCode: 'AP-CP' },
      { name: 'Langues Nationales', coefficient: 1, category: 'general', hoursPerWeek: 2, isRequired: false, curriculumCode: 'LN-CP' }
    ]
  },
  {
    level: '6eme',
    levelName: 'Sixième',
    subjects: [
      { name: 'Français', coefficient: 5, category: 'general', hoursPerWeek: 6, isRequired: true, curriculumCode: 'FR-6' },
      { name: 'Mathématiques', coefficient: 4, category: 'general', hoursPerWeek: 5, isRequired: true, curriculumCode: 'MT-6' },
      { name: 'Anglais', coefficient: 3, category: 'general', hoursPerWeek: 4, isRequired: true, curriculumCode: 'AN-6' },
      { name: 'Sciences de la Vie et de la Terre', coefficient: 3, category: 'general', hoursPerWeek: 3, isRequired: true, curriculumCode: 'SVT-6' },
      { name: 'Histoire-Géographie', coefficient: 3, category: 'general', hoursPerWeek: 3, isRequired: true, curriculumCode: 'HG-6' },
      { name: 'Éducation Civique', coefficient: 2, category: 'general', hoursPerWeek: 2, isRequired: true, curriculumCode: 'EC-6' },
      { name: 'Éducation Physique', coefficient: 2, category: 'sports', hoursPerWeek: 3, isRequired: true, curriculumCode: 'EP-6' },
      { name: 'Arts Plastiques', coefficient: 1, category: 'arts', hoursPerWeek: 2, isRequired: true, curriculumCode: 'AP-6' },
      { name: 'Informatique', coefficient: 2, category: 'professional', hoursPerWeek: 2, isRequired: false, curriculumCode: 'IF-6' }
    ]
  },
  {
    level: '3eme',
    levelName: 'Troisième',
    subjects: [
      { name: 'Français', coefficient: 5, category: 'general', hoursPerWeek: 5, isRequired: true, curriculumCode: 'FR-3' },
      { name: 'Mathématiques', coefficient: 4, category: 'general', hoursPerWeek: 4, isRequired: true, curriculumCode: 'MT-3' },
      { name: 'Anglais', coefficient: 3, category: 'general', hoursPerWeek: 4, isRequired: true, curriculumCode: 'AN-3' },
      { name: 'Sciences Physiques', coefficient: 3, category: 'general', hoursPerWeek: 3, isRequired: true, curriculumCode: 'SP-3' },
      { name: 'Sciences de la Vie et de la Terre', coefficient: 3, category: 'general', hoursPerWeek: 2, isRequired: true, curriculumCode: 'SVT-3' },
      { name: 'Histoire-Géographie', coefficient: 3, category: 'general', hoursPerWeek: 3, isRequired: true, curriculumCode: 'HG-3' },
      { name: 'Éducation Civique', coefficient: 2, category: 'general', hoursPerWeek: 1, isRequired: true, curriculumCode: 'EC-3' },
      { name: 'Éducation Physique', coefficient: 2, category: 'sports', hoursPerWeek: 3, isRequired: true, curriculumCode: 'EP-3' },
      { name: 'Informatique', coefficient: 2, category: 'professional', hoursPerWeek: 2, isRequired: true, curriculumCode: 'IF-3' },
      { name: 'Allemand', coefficient: 2, category: 'general', hoursPerWeek: 3, isRequired: false, curriculumCode: 'AL-3' },
      { name: 'Espagnol', coefficient: 2, category: 'general', hoursPerWeek: 3, isRequired: false, curriculumCode: 'ES-3' }
    ]
  },
  {
    level: 'terminale-c',
    levelName: 'Terminale C (Scientifique)',
    subjects: [
      { name: 'Mathématiques', coefficient: 6, category: 'general', hoursPerWeek: 8, isRequired: true, curriculumCode: 'MT-TC' },
      { name: 'Sciences Physiques', coefficient: 5, category: 'general', hoursPerWeek: 6, isRequired: true, curriculumCode: 'SP-TC' },
      { name: 'Sciences de la Vie et de la Terre', coefficient: 4, category: 'general', hoursPerWeek: 4, isRequired: true, curriculumCode: 'SVT-TC' },
      { name: 'Français', coefficient: 4, category: 'general', hoursPerWeek: 4, isRequired: true, curriculumCode: 'FR-TC' },
      { name: 'Anglais', coefficient: 3, category: 'general', hoursPerWeek: 3, isRequired: true, curriculumCode: 'AN-TC' },
      { name: 'Histoire-Géographie', coefficient: 2, category: 'general', hoursPerWeek: 2, isRequired: true, curriculumCode: 'HG-TC' },
      { name: 'Éducation Civique', coefficient: 1, category: 'general', hoursPerWeek: 1, isRequired: true, curriculumCode: 'EC-TC' },
      { name: 'Éducation Physique', coefficient: 1, category: 'sports', hoursPerWeek: 2, isRequired: true, curriculumCode: 'EP-TC' },
      { name: 'Philosophie', coefficient: 2, category: 'general', hoursPerWeek: 2, isRequired: true, curriculumCode: 'PH-TC' },
      { name: 'Allemand', coefficient: 2, category: 'general', hoursPerWeek: 3, isRequired: false, curriculumCode: 'AL-TC' },
      { name: 'Espagnol', coefficient: 2, category: 'general', hoursPerWeek: 3, isRequired: false, curriculumCode: 'ES-TC' }
    ]
  },
  {
    level: 'terminale-d',
    levelName: 'Terminale D (Sciences Naturelles)',
    subjects: [
      { name: 'Sciences de la Vie et de la Terre', coefficient: 6, category: 'general', hoursPerWeek: 7, isRequired: true, curriculumCode: 'SVT-TD' },
      { name: 'Mathématiques', coefficient: 5, category: 'general', hoursPerWeek: 6, isRequired: true, curriculumCode: 'MT-TD' },
      { name: 'Sciences Physiques', coefficient: 4, category: 'general', hoursPerWeek: 5, isRequired: true, curriculumCode: 'SP-TD' },
      { name: 'Français', coefficient: 4, category: 'general', hoursPerWeek: 4, isRequired: true, curriculumCode: 'FR-TD' },
      { name: 'Anglais', coefficient: 3, category: 'general', hoursPerWeek: 3, isRequired: true, curriculumCode: 'AN-TD' },
      { name: 'Histoire-Géographie', coefficient: 2, category: 'general', hoursPerWeek: 2, isRequired: true, curriculumCode: 'HG-TD' },
      { name: 'Éducation Civique', coefficient: 1, category: 'general', hoursPerWeek: 1, isRequired: true, curriculumCode: 'EC-TD' },
      { name: 'Éducation Physique', coefficient: 1, category: 'sports', hoursPerWeek: 2, isRequired: true, curriculumCode: 'EP-TD' },
      { name: 'Philosophie', coefficient: 2, category: 'general', hoursPerWeek: 2, isRequired: true, curriculumCode: 'PH-TD' }
    ]
  },
  {
    level: 'terminale-esti',
    levelName: 'Terminale ESTI (Technique Industrielle)',
    subjects: [
      { name: 'Mathématiques', coefficient: 5, category: 'general', hoursPerWeek: 6, isRequired: true, curriculumCode: 'MT-ESTI' },
      { name: 'Sciences Physiques', coefficient: 4, category: 'general', hoursPerWeek: 5, isRequired: true, curriculumCode: 'SP-ESTI' },
      { name: 'Technologie Industrielle', coefficient: 6, category: 'professional', hoursPerWeek: 8, isRequired: true, curriculumCode: 'TI-ESTI' },
      { name: 'Dessin Technique', coefficient: 4, category: 'professional', hoursPerWeek: 4, isRequired: true, curriculumCode: 'DT-ESTI' },
      { name: 'Travaux Pratiques', coefficient: 4, category: 'professional', hoursPerWeek: 6, isRequired: true, curriculumCode: 'TP-ESTI' },
      { name: 'Français', coefficient: 3, category: 'general', hoursPerWeek: 3, isRequired: true, curriculumCode: 'FR-ESTI' },
      { name: 'Anglais', coefficient: 2, category: 'general', hoursPerWeek: 2, isRequired: true, curriculumCode: 'AN-ESTI' },
      { name: 'Éducation Physique', coefficient: 1, category: 'sports', hoursPerWeek: 2, isRequired: true, curriculumCode: 'EP-ESTI' }
    ]
  }
];

// Fonction utilitaire pour obtenir le template d'un niveau
export function getSubjectTemplateByLevel(level: string): LevelTemplate | null {
  return CAMEROON_CURRICULUM_TEMPLATES.find(template => template.level === level) || null;
}

// Fonction pour obtenir toutes les matières disponibles (pour création custom)
export function getAllAvailableSubjects(): string[] {
  const allSubjects = new Set<string>();
  CAMEROON_CURRICULUM_TEMPLATES.forEach(template => {
    template.subjects.forEach(subject => allSubjects.add(subject.name));
  });
  return Array.from(allSubjects).sort();
}
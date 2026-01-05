export type BulletinType = 
  | 'general-fr' 
  | 'general-en' 
  | 'literary-fr' 
  | 'scientific-fr' 
  | 'professional-fr' 
  | 'technical-en'
  | 'primaire-fr'
  | 'primaire-en';

export type BulletinFormat = 'simple' | 'n20-m20' | 'cba';

export type SchoolType = 
  | 'primaire' 
  | 'secondaire-general' 
  | 'secondaire-technique' 
  | 'professionnel';

export type SchoolLanguage = 'fr' | 'en' | 'bilingual';

export interface BulletinColumn {
  key: string;
  labelFr: string;
  labelEn: string;
  width?: string;
}

export interface BulletinConfig {
  bulletinType: BulletinType;
  format: BulletinFormat;
  columns: BulletinColumn[];
  showClassAverage: boolean;
  showMinMax: boolean;
  coefficientMultiplier: boolean;
  labelFr: string;
  labelEn: string;
}

const SIMPLE_COLUMNS: BulletinColumn[] = [
  { key: 'subject', labelFr: 'Matière', labelEn: 'Subject', width: '25%' },
  { key: 'coef', labelFr: 'Coef', labelEn: 'Coef', width: '8%' },
  { key: 'note', labelFr: 'Note/20', labelEn: 'Mark/20', width: '12%' },
  { key: 'total', labelFr: 'Total', labelEn: 'Total', width: '12%' },
  { key: 'appreciation', labelFr: 'Appréciation', labelEn: 'Remark', width: '43%' }
];

const N20_M20_COLUMNS: BulletinColumn[] = [
  { key: 'subject', labelFr: 'Matière', labelEn: 'Subject', width: '20%' },
  { key: 'coef', labelFr: 'Coef', labelEn: 'Coef', width: '7%' },
  { key: 'n20', labelFr: 'N/20', labelEn: 'N/20', width: '10%' },
  { key: 'm20', labelFr: 'M/20', labelEn: 'M/20', width: '10%' },
  { key: 'total', labelFr: 'Total', labelEn: 'Total', width: '10%' },
  { key: 'rank', labelFr: 'Rang', labelEn: 'Rank', width: '8%' },
  { key: 'appreciation', labelFr: 'Appréciation', labelEn: 'Remark', width: '35%' }
];

const CBA_COLUMNS: BulletinColumn[] = [
  { key: 'subject', labelFr: 'Matière', labelEn: 'Subject', width: '18%' },
  { key: 'coef', labelFr: 'Coef', labelEn: 'Coef', width: '6%' },
  { key: 'mk20', labelFr: 'MK/20', labelEn: 'MK/20', width: '10%' },
  { key: 'av20', labelFr: 'AV/20', labelEn: 'AV/20', width: '10%' },
  { key: 'avCoef', labelFr: 'AV×Coef', labelEn: 'AV×Coef', width: '10%' },
  { key: 'min', labelFr: 'Min', labelEn: 'Min', width: '8%' },
  { key: 'max', labelFr: 'Max', labelEn: 'Max', width: '8%' },
  { key: 'appreciation', labelFr: 'Appréciation', labelEn: 'Remark', width: '30%' }
];

const BULLETIN_CONFIGS: Record<BulletinType, BulletinConfig> = {
  'primaire-fr': {
    bulletinType: 'primaire-fr',
    format: 'simple',
    columns: SIMPLE_COLUMNS,
    showClassAverage: false,
    showMinMax: false,
    coefficientMultiplier: true,
    labelFr: 'Bulletin Primaire',
    labelEn: 'Primary Report Card'
  },
  'primaire-en': {
    bulletinType: 'primaire-en',
    format: 'simple',
    columns: SIMPLE_COLUMNS,
    showClassAverage: false,
    showMinMax: false,
    coefficientMultiplier: true,
    labelFr: 'Bulletin Primaire (Anglophone)',
    labelEn: 'Primary Report Card (Anglophone)'
  },
  'general-fr': {
    bulletinType: 'general-fr',
    format: 'n20-m20',
    columns: N20_M20_COLUMNS,
    showClassAverage: true,
    showMinMax: false,
    coefficientMultiplier: true,
    labelFr: 'Bulletin Général Francophone',
    labelEn: 'General Report Card (Francophone)'
  },
  'literary-fr': {
    bulletinType: 'literary-fr',
    format: 'n20-m20',
    columns: N20_M20_COLUMNS,
    showClassAverage: true,
    showMinMax: false,
    coefficientMultiplier: true,
    labelFr: 'Bulletin Série Littéraire (A)',
    labelEn: 'Literary Series Report Card (A)'
  },
  'scientific-fr': {
    bulletinType: 'scientific-fr',
    format: 'n20-m20',
    columns: N20_M20_COLUMNS,
    showClassAverage: true,
    showMinMax: false,
    coefficientMultiplier: true,
    labelFr: 'Bulletin Série Scientifique (C/D)',
    labelEn: 'Scientific Series Report Card (C/D)'
  },
  'professional-fr': {
    bulletinType: 'professional-fr',
    format: 'simple',
    columns: SIMPLE_COLUMNS,
    showClassAverage: false,
    showMinMax: false,
    coefficientMultiplier: true,
    labelFr: 'Bulletin Technique/Professionnel',
    labelEn: 'Technical/Professional Report Card'
  },
  'general-en': {
    bulletinType: 'general-en',
    format: 'cba',
    columns: CBA_COLUMNS,
    showClassAverage: true,
    showMinMax: true,
    coefficientMultiplier: true,
    labelFr: 'Bulletin CBA Anglophone',
    labelEn: 'CBA Anglophone Report Card'
  },
  'technical-en': {
    bulletinType: 'technical-en',
    format: 'cba',
    columns: CBA_COLUMNS,
    showClassAverage: true,
    showMinMax: true,
    coefficientMultiplier: true,
    labelFr: 'Bulletin Technique Anglophone',
    labelEn: 'Technical Anglophone Report Card'
  }
};

export function getBulletinConfig(bulletinType: BulletinType): BulletinConfig {
  return BULLETIN_CONFIGS[bulletinType] || BULLETIN_CONFIGS['general-fr'];
}

export function detectBulletinType(
  schoolType: SchoolType,
  language: SchoolLanguage,
  series?: string
): BulletinType {
  if (schoolType === 'primaire') {
    return language === 'en' ? 'primaire-en' : 'primaire-fr';
  }
  
  if (schoolType === 'secondaire-technique' || schoolType === 'professionnel') {
    return language === 'en' ? 'technical-en' : 'professional-fr';
  }
  
  if (schoolType === 'secondaire-general') {
    if (language === 'en') {
      return 'general-en';
    }
    
    if (series) {
      const seriesUpper = series.toUpperCase();
      if (seriesUpper.includes('A') || seriesUpper.includes('LITT')) {
        return 'literary-fr';
      }
      if (seriesUpper.includes('C') || seriesUpper.includes('D') || seriesUpper.includes('SCIEN')) {
        return 'scientific-fr';
      }
    }
    
    return 'general-fr';
  }
  
  return language === 'en' ? 'general-en' : 'general-fr';
}

export function getAvailableBulletinTypes(
  schoolType: SchoolType,
  language: SchoolLanguage
): BulletinType[] {
  const types: BulletinType[] = [];
  
  if (schoolType === 'primaire') {
    if (language === 'fr' || language === 'bilingual') types.push('primaire-fr');
    if (language === 'en' || language === 'bilingual') types.push('primaire-en');
    return types;
  }
  
  if (schoolType === 'secondaire-technique' || schoolType === 'professionnel') {
    if (language === 'fr' || language === 'bilingual') types.push('professional-fr');
    if (language === 'en' || language === 'bilingual') types.push('technical-en');
    return types;
  }
  
  if (language === 'fr' || language === 'bilingual') {
    types.push('general-fr', 'literary-fr', 'scientific-fr');
  }
  if (language === 'en' || language === 'bilingual') {
    types.push('general-en');
  }
  
  return types;
}

export function getColumnLabel(column: BulletinColumn, language: 'fr' | 'en'): string {
  return language === 'en' ? column.labelEn : column.labelFr;
}

export function calculateSubjectTotal(
  note: number,
  coefficient: number,
  format: BulletinFormat
): number {
  if (format === 'simple' || format === 'n20-m20') {
    return note * coefficient;
  }
  return note * coefficient;
}

export function getFormatDescription(format: BulletinFormat, language: 'fr' | 'en'): string {
  const descriptions = {
    simple: {
      fr: 'Note × Coefficient = Total',
      en: 'Mark × Coefficient = Total'
    },
    'n20-m20': {
      fr: 'N/20 (note élève) + M/20 (moyenne classe) + Rang',
      en: 'N/20 (student mark) + M/20 (class average) + Rank'
    },
    cba: {
      fr: 'MK/20 + AV/20 + AV×Coef + Min/Max (Approche par Compétences)',
      en: 'MK/20 + AV/20 + AV×Coef + Min/Max (Competency-Based Approach)'
    }
  };
  
  return descriptions[format][language];
}

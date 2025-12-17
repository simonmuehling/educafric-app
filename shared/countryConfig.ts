// ===== COUNTRY CONFIGURATION FOR MULTI-COUNTRY SUPPORT =====
// Supports: Cameroon (CM), Côte d'Ivoire (CI), Senegal (SN)

export type CountryCode = 'CM' | 'CI' | 'SN';

export interface CountryConfig {
  code: CountryCode;
  name: { fr: string; en: string };
  flag: string;
  currency: { code: string; symbol: string; name: { fr: string; en: string } };
  phone: { 
    prefix: string; 
    format: string; 
    length: number;
    example: string;
  };
  ministry: {
    country: { fr: string; en: string };
    motto: { fr: string; en: string };
    ministryName: { fr: string; en: string };
    regionalDelegation: { fr: string; en: string };
    divisionalDelegation: { fr: string; en: string };
  };
  educafricPrefix: string;
  timezone: string;
  languages: string[];
}

export const COUNTRY_CONFIGS: Record<CountryCode, CountryConfig> = {
  CM: {
    code: 'CM',
    name: { fr: 'Cameroun', en: 'Cameroon' },
    flag: '🇨🇲',
    currency: { 
      code: 'XAF', 
      symbol: 'FCFA', 
      name: { fr: 'Franc CFA (CEMAC)', en: 'CFA Franc (CEMAC)' }
    },
    phone: { 
      prefix: '+237', 
      format: '6XX XXX XXX', 
      length: 9,
      example: '+237 6XX XXX XXX'
    },
    ministry: {
      country: { fr: 'RÉPUBLIQUE DU CAMEROUN', en: 'REPUBLIC OF CAMEROON' },
      motto: { fr: 'Paix – Travail – Patrie', en: 'Peace – Work – Fatherland' },
      ministryName: { 
        fr: 'MINISTÈRE DES ENSEIGNEMENTS SECONDAIRES', 
        en: 'MINISTRY OF SECONDARY EDUCATION' 
      },
      regionalDelegation: { fr: 'DÉLÉGATION RÉGIONALE', en: 'REGIONAL DELEGATION' },
      divisionalDelegation: { fr: 'DÉLÉGATION DÉPARTEMENTALE', en: 'DIVISIONAL DELEGATION' }
    },
    educafricPrefix: 'EDU-CM',
    timezone: 'Africa/Douala',
    languages: ['fr', 'en']
  },
  CI: {
    code: 'CI',
    name: { fr: 'Côte d\'Ivoire', en: 'Ivory Coast' },
    flag: '🇨🇮',
    currency: { 
      code: 'XOF', 
      symbol: 'FCFA', 
      name: { fr: 'Franc CFA (UEMOA)', en: 'CFA Franc (WAEMU)' }
    },
    phone: { 
      prefix: '+225', 
      format: 'XX XX XX XX XX', 
      length: 10,
      example: '+225 XX XX XX XX XX'
    },
    ministry: {
      country: { fr: 'RÉPUBLIQUE DE CÔTE D\'IVOIRE', en: 'REPUBLIC OF CÔTE D\'IVOIRE' },
      motto: { fr: 'Union – Discipline – Travail', en: 'Union – Discipline – Work' },
      ministryName: { 
        fr: 'MINISTÈRE DE L\'ÉDUCATION NATIONALE ET DE L\'ALPHABÉTISATION', 
        en: 'MINISTRY OF NATIONAL EDUCATION AND LITERACY' 
      },
      regionalDelegation: { fr: 'DIRECTION RÉGIONALE', en: 'REGIONAL DIRECTORATE' },
      divisionalDelegation: { fr: 'INSPECTION DE L\'ENSEIGNEMENT', en: 'EDUCATION INSPECTORATE' }
    },
    educafricPrefix: 'EDU-CI',
    timezone: 'Africa/Abidjan',
    languages: ['fr']
  },
  SN: {
    code: 'SN',
    name: { fr: 'Sénégal', en: 'Senegal' },
    flag: '🇸🇳',
    currency: { 
      code: 'XOF', 
      symbol: 'FCFA', 
      name: { fr: 'Franc CFA (UEMOA)', en: 'CFA Franc (WAEMU)' }
    },
    phone: { 
      prefix: '+221', 
      format: 'XX XXX XX XX', 
      length: 9,
      example: '+221 XX XXX XX XX'
    },
    ministry: {
      country: { fr: 'RÉPUBLIQUE DU SÉNÉGAL', en: 'REPUBLIC OF SENEGAL' },
      motto: { fr: 'Un Peuple – Un But – Une Foi', en: 'One People – One Goal – One Faith' },
      ministryName: { 
        fr: 'MINISTÈRE DE L\'ÉDUCATION NATIONALE', 
        en: 'MINISTRY OF NATIONAL EDUCATION' 
      },
      regionalDelegation: { fr: 'INSPECTION D\'ACADÉMIE', en: 'ACADEMY INSPECTORATE' },
      divisionalDelegation: { fr: 'INSPECTION DE L\'ÉDUCATION ET DE LA FORMATION', en: 'EDUCATION AND TRAINING INSPECTORATE' }
    },
    educafricPrefix: 'EDU-SN',
    timezone: 'Africa/Dakar',
    languages: ['fr']
  }
};

export const DEFAULT_COUNTRY: CountryCode = 'CM';

export function getCountryConfig(code: CountryCode): CountryConfig {
  return COUNTRY_CONFIGS[code] || COUNTRY_CONFIGS[DEFAULT_COUNTRY];
}

export function getCountryList(): Array<{ code: CountryCode; name: string; flag: string }> {
  return Object.values(COUNTRY_CONFIGS).map(config => ({
    code: config.code,
    name: config.name.fr,
    flag: config.flag
  }));
}

export function validatePhoneNumber(phone: string, countryCode: CountryCode): boolean {
  const config = getCountryConfig(countryCode);
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (digitsOnly.startsWith(config.phone.prefix.replace('+', ''))) {
    return digitsOnly.length === config.phone.prefix.replace('+', '').length + config.phone.length;
  }
  
  return digitsOnly.length === config.phone.length;
}

export function formatPhoneNumber(phone: string, countryCode: CountryCode): string {
  const config = getCountryConfig(countryCode);
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (!digitsOnly.startsWith(config.phone.prefix.replace('+', ''))) {
    return `${config.phone.prefix} ${digitsOnly}`;
  }
  
  return `+${digitsOnly}`;
}

export function getEducafricPrefix(countryCode: CountryCode): string {
  return getCountryConfig(countryCode).educafricPrefix;
}

export function parseEducafricNumber(number: string): { countryCode: CountryCode; type: string; counter: string } | null {
  const match = number.match(/^EDU-(CM|CI|SN)-([A-Z]{2})-(\d+)$/);
  if (!match) return null;
  
  return {
    countryCode: match[1] as CountryCode,
    type: match[2],
    counter: match[3]
  };
}

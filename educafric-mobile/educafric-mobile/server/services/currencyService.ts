/**
 * Currency Service - Dynamic Currency Detection Based on User Location
 * Detects user location via IP address and adjusts currency accordingly
 */

interface CountryCurrencyMapping {
  [countryCode: string]: {
    currency: string;
    symbol: string;
    exchangeRate: number; // Rate to CFA (base currency)
    locale: string;
  };
}

interface IPLocationResponse {
  country: string;
  countryCode: string;
  region: string;
  city: string;
  currency: string;
  timezone: string;
}

class CurrencyService {
  private currencyMappings: CountryCurrencyMapping = {
    // Central African Countries (CFA Franc BEAC)
    'CM': { currency: 'XAF', symbol: 'CFA', exchangeRate: 1, locale: 'fr-CM' }, // Cameroon
    'CF': { currency: 'XAF', symbol: 'CFA', exchangeRate: 1, locale: 'fr-CF' }, // Central African Republic
    'TD': { currency: 'XAF', symbol: 'CFA', exchangeRate: 1, locale: 'fr-TD' }, // Chad
    'CG': { currency: 'XAF', symbol: 'CFA', exchangeRate: 1, locale: 'fr-CG' }, // Republic of Congo
    'GQ': { currency: 'XAF', symbol: 'CFA', exchangeRate: 1, locale: 'es-GQ' }, // Equatorial Guinea
    'GA': { currency: 'XAF', symbol: 'CFA', exchangeRate: 1, locale: 'fr-GA' }, // Gabon

    // West African Countries (CFA Franc BCEAO)
    'BF': { currency: 'XOF', symbol: 'CFA', exchangeRate: 1, locale: 'fr-BF' }, // Burkina Faso
    'BJ': { currency: 'XOF', symbol: 'CFA', exchangeRate: 1, locale: 'fr-BJ' }, // Benin
    'CI': { currency: 'XOF', symbol: 'CFA', exchangeRate: 1, locale: 'fr-CI' }, // Côte d'Ivoire
    'GW': { currency: 'XOF', symbol: 'CFA', exchangeRate: 1, locale: 'pt-GW' }, // Guinea-Bissau
    'ML': { currency: 'XOF', symbol: 'CFA', exchangeRate: 1, locale: 'fr-ML' }, // Mali
    'NE': { currency: 'XOF', symbol: 'CFA', exchangeRate: 1, locale: 'fr-NE' }, // Niger
    'SN': { currency: 'XOF', symbol: 'CFA', exchangeRate: 1, locale: 'fr-SN' }, // Senegal
    'TG': { currency: 'XOF', symbol: 'CFA', exchangeRate: 1, locale: 'fr-TG' }, // Togo

    // Other African Countries
    'NG': { currency: 'NGN', symbol: '₦', exchangeRate: 0.75, locale: 'en-NG' }, // Nigeria
    'GH': { currency: 'GHS', symbol: '₵', exchangeRate: 45, locale: 'en-GH' }, // Ghana
    'KE': { currency: 'KES', symbol: 'KSh', exchangeRate: 4.2, locale: 'en-KE' }, // Kenya
    'ZA': { currency: 'ZAR', symbol: 'R', exchangeRate: 32, locale: 'en-ZA' }, // South Africa
    'EG': { currency: 'EGP', symbol: 'E£', exchangeRate: 18, locale: 'ar-EG' }, // Egypt
    'MA': { currency: 'MAD', symbol: 'MAD', exchangeRate: 55, locale: 'ar-MA' }, // Morocco
    'TN': { currency: 'TND', symbol: 'د.ت', exchangeRate: 180, locale: 'ar-TN' }, // Tunisia
    'DZ': { currency: 'DZD', symbol: 'دج', exchangeRate: 4.5, locale: 'ar-DZ' }, // Algeria

    // International
    'US': { currency: 'USD', symbol: '$', exchangeRate: 600, locale: 'en-US' }, // United States
    'CA': { currency: 'CAD', symbol: 'C$', exchangeRate: 450, locale: 'en-CA' }, // Canada
    'GB': { currency: 'GBP', symbol: '£', exchangeRate: 750, locale: 'en-GB' }, // United Kingdom
    'FR': { currency: 'EUR', symbol: '€', exchangeRate: 655, locale: 'fr-FR' }, // France
    'DE': { currency: 'EUR', symbol: '€', exchangeRate: 655, locale: 'de-DE' }, // Germany
    'CN': { currency: 'CNY', symbol: '¥', exchangeRate: 85, locale: 'zh-CN' }, // China
    'IN': { currency: 'INR', symbol: '₹', exchangeRate: 7.2, locale: 'en-IN' }, // India

    // Default fallback
    'DEFAULT': { currency: 'XAF', symbol: 'CFA', exchangeRate: 1, locale: 'fr-CM' }
  };

  async detectLocationFromIP(ipAddress: string): Promise<IPLocationResponse | null> {
    console.log(`[CURRENCY_SERVICE] Detecting location for IP: ${ipAddress}`);

    // Skip localhost and internal IPs
    if (this.isLocalIP(ipAddress)) {
      console.log('[CURRENCY_SERVICE] Local IP detected, using Cameroon default');
      return {
        country: 'Cameroon',
        countryCode: 'CM',
        region: 'Centre',
        city: 'Yaoundé',
        currency: 'XAF',
        timezone: 'Africa/Douala'
      };
    }

    try {
      // Try multiple IP geolocation services for reliability
      const services = [
        `http://ip-api.com/json/${ipAddress}?fields=status,country,countryCode,region,city,timezone,currency`,
        `https://ipapi.co/${ipAddress}/json/`,
        `http://www.geoplugin.net/json.gp?ip=${ipAddress}`
      ];

      for (const serviceUrl of services) {
        try {
          const response = await fetch(serviceUrl, { timeout: 3000 });
          if (response.ok) {
            const data = await response.json();
            
            // Parse response based on service
            if (serviceUrl.includes('ip-api.com')) {
              if (data.status === 'success') {
                return {
                  country: data.country,
                  countryCode: data.countryCode,
                  region: data.region,
                  city: data.city,
                  currency: data.currency || 'XAF',
                  timezone: data.timezone
                };
              }
            } else if (serviceUrl.includes('ipapi.co')) {
              if (!data.error) {
                return {
                  country: data.country_name,
                  countryCode: data.country_code,
                  region: data.region,
                  city: data.city,
                  currency: data.currency || 'XAF',
                  timezone: data.timezone
                };
              }
            } else if (serviceUrl.includes('geoplugin.net')) {
              if (data.geoplugin_status === 200) {
                return {
                  country: data.geoplugin_countryName,
                  countryCode: data.geoplugin_countryCode,
                  region: data.geoplugin_region,
                  city: data.geoplugin_city,
                  currency: data.geoplugin_currencyCode || 'XAF',
                  timezone: data.geoplugin_timezone
                };
              }
            }
          }
        } catch (serviceError) {
          console.log(`[CURRENCY_SERVICE] Service ${serviceUrl} failed:`, serviceError.message);
          continue;
        }
      }
    } catch (error) {
      console.error('[CURRENCY_SERVICE] IP location detection failed:', error);
    }

    return null;
  }

  private isLocalIP(ip: string): boolean {
    const localPatterns = [
      /^127\./,           // localhost
      /^192\.168\./,      // private network
      /^10\./,            // private network
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,  // private network
      /^::1$/,            // IPv6 localhost
      /^fe80:/,           // IPv6 link-local
      /^localhost$/i
    ];

    return localPatterns.some(pattern => pattern.test(ip)) || ip === '::1' || !ip;
  }

  getCurrencyForCountry(countryCode: string): any {
    const normalizedCode = countryCode.toUpperCase();
    return this.currencyMappings[normalizedCode] || this.currencyMappings['DEFAULT'];
  }

  convertPrice(amountInCFA: number, targetCurrency: string): number {
    const currencyInfo = Object.values(this.currencyMappings)
      .find(c => c.currency === targetCurrency);
    
    if (!currencyInfo) {
      return amountInCFA; // Return original if currency not found
    }

    return Math.round(amountInCFA / currencyInfo.exchangeRate);
  }

  formatPrice(amount: number, currencyInfo: any): string {
    try {
      return new Intl.NumberFormat(currencyInfo.locale, {
        style: 'currency',
        currency: currencyInfo.currency,
        minimumFractionDigits: currencyInfo.currency === 'XAF' || currencyInfo.currency === 'XOF' ? 0 : 2
      }).format(amount);
    } catch (error) {
      // Fallback formatting
      return `${currencyInfo.symbol} ${amount.toLocaleString()}`;
    }
  }

  async getUserCurrencyContext(ipAddress: string): Promise<{
    countryCode: string;
    country: string;
    currency: string;
    symbol: string;
    locale: string;
    exchangeRate: number;
  }> {
    const location = await this.detectLocationFromIP(ipAddress);
    const countryCode = location?.countryCode || 'CM';
    const currencyInfo = this.getCurrencyForCountry(countryCode);

    return {
      countryCode,
      country: location?.country || 'Cameroon',
      currency: currencyInfo.currency,
      symbol: currencyInfo.symbol,
      locale: currencyInfo.locale,
      exchangeRate: currencyInfo.exchangeRate
    };
  }

  // Educafric-specific pricing conversion
  convertEducafricPricing(basePrices: { [plan: string]: number }, targetCurrency: string): { [plan: string]: number } {
    const convertedPrices: { [plan: string]: number } = {};
    
    for (const [plan, priceInCFA] of Object.entries(basePrices)) {
      convertedPrices[plan] = this.convertPrice(priceInCFA, targetCurrency);
    }
    
    return convertedPrices;
  }
}

export const currencyService = new CurrencyService();
export default currencyService;
import { useLanguage } from '@/contexts/LanguageContext';

export interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  address?: string;
  city?: string;
  country?: string;
}

export interface GeolocationError {
  code: number;
  message: string;
}

// Geolocation service for African educational context
export class GeolocationService {
  private static instance: GeolocationService;
  
  public static getInstance(): GeolocationService {
    if (!GeolocationService.instance) {
      GeolocationService.instance = new GeolocationService();
    }
    return GeolocationService.instance;
  }

  // Get current position with African-optimized settings
  async getCurrentPosition(): Promise<GeolocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject({
          code: 0,
          message: 'Geolocation is not supported by this browser'
        });
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 15000, // Extended for African network conditions
        maximumAge: 300000 // 5 minutes cache for poor connectivity
      };

      navigator?.geolocation?.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position?.coords?.latitude,
            longitude: position?.coords?.longitude,
            accuracy: position?.coords?.accuracy,
            timestamp: position.timestamp
          });
        },
        (error) => {
          reject({
            code: error.code,
            message: this.getErrorMessage(error.code)
          });
        },
        options
      );
    });
  }

  // Watch position for real-time tracking (school bus, field trips)
  watchPosition(callback: (data: GeolocationData) => void, errorCallback: (error: GeolocationError) => void): number {
    if (!navigator.geolocation) {
      errorCallback({
        code: 0,
        message: 'Geolocation is not supported'
      });
      return -1;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 60000 // 1 minute for real-time tracking
    };

    return navigator?.geolocation?.watchPosition(
      (position) => {
        callback({
          latitude: position?.coords?.latitude,
          longitude: position?.coords?.longitude,
          accuracy: position?.coords?.accuracy,
          timestamp: position.timestamp
        });
      },
      (error) => {
        errorCallback({
          code: error.code,
          message: this.getErrorMessage(error.code)
        });
      },
      options
    );
  }

  // Stop watching position
  clearWatch(watchId: number): void {
    navigator?.geolocation?.clearWatch(watchId);
  }

  // Reverse geocoding for African cities
  async reverseGeocode(latitude: number, longitude: number): Promise<GeolocationData> {
    try {
      // Using OpenStreetMap Nominatim (free, works well in Africa)
      const response = await fetch(
        `https://nominatim?.openstreetmap?.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }

      const data = await response.json();
      
      return {
        latitude,
        longitude,
        accuracy: 100, // Estimated accuracy for reverse geocoding
        timestamp: Date.now(),
        address: data.display_name || '',
        city: data.address?.city || data.address?.town || data.address?.village || '',
        country: data.address?.country || ''
      };
    } catch (error) {
      // Fallback with basic coordinates
      return {
        latitude,
        longitude,
        accuracy: 1000,
        timestamp: Date.now(),
        address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        city: 'Unknown',
        country: 'Unknown'
      };
    }
  }

  // Calculate distance between two points (Haversine formula)
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }

  // Check if location is within school zone (useful for attendance tracking)
  isWithinSchoolZone(
    studentLat: number, 
    studentLon: number, 
    schoolLat: number, 
    schoolLon: number, 
    radiusKm: number = 0.5
  ): boolean {
    const distance = this.calculateDistance(studentLat, studentLon, schoolLat, schoolLon);
    return distance <= radiusKm;
  }

  // Get African major cities for school location selection
  getAfricanCities(): Array<{value: string, labelEn: string, labelFr: string, country: string, coordinates?: [number, number]}> {
    return [
      // Cameroon
      { value: 'yaounde', labelEn: 'Yaoundé', labelFr: 'Yaoundé', country: 'Cameroon', coordinates: [3.8480, 11.5021] },
      { value: 'douala', labelEn: 'Douala', labelFr: 'Douala', country: 'Cameroon', coordinates: [4.0483, 9.7043] },
      { value: 'bamenda', labelEn: 'Bamenda', labelFr: 'Bamenda', country: 'Cameroon', coordinates: [5.9631, 10.1591] },
      { value: 'bafoussam', labelEn: 'Bafoussam', labelFr: 'Bafoussam', country: 'Cameroon', coordinates: [5.4781, 10.4203] },
      
      // Nigeria
      { value: 'lagos', labelEn: 'Lagos', labelFr: 'Lagos', country: 'Nigeria', coordinates: [6.5244, 3.3792] },
      { value: 'abuja', labelEn: 'Abuja', labelFr: 'Abuja', country: 'Nigeria', coordinates: [9.0765, 7.3986] },
      { value: 'kano', labelEn: 'Kano', labelFr: 'Kano', country: 'Nigeria', coordinates: [12.0022, 8.5920] },
      
      // Ghana
      { value: 'accra', labelEn: 'Accra', labelFr: 'Accra', country: 'Ghana', coordinates: [5.6037, -0.1870] },
      { value: 'kumasi', labelEn: 'Kumasi', labelFr: 'Kumasi', country: 'Ghana', coordinates: [6.6885, -1.6244] },
      
      // Ivory Coast
      { value: 'abidjan', labelEn: 'Abidjan', labelFr: 'Abidjan', country: 'Côte d\'Ivoire', coordinates: [5.3600, -4.0083] },
      { value: 'yamoussoukro', labelEn: 'Yamoussoukro', labelFr: 'Yamoussoukro', country: 'Côte d\'Ivoire', coordinates: [6.8276, -5.2893] },
      
      // Senegal
      { value: 'dakar', labelEn: 'Dakar', labelFr: 'Dakar', country: 'Senegal', coordinates: [14.7167, -17.4677] },
      
      // Mali
      { value: 'bamako', labelEn: 'Bamako', labelFr: 'Bamako', country: 'Mali', coordinates: [12.6392, -8.0029] },
      
      // Burkina Faso
      { value: 'ouagadougou', labelEn: 'Ouagadougou', labelFr: 'Ouagadougou', country: 'Burkina Faso', coordinates: [12.3714, -1.5197] },
      
      // Generic options
      { value: 'other', labelEn: 'Other City', labelFr: 'Autre Ville', country: 'Various' }
    ];
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private getErrorMessage(code: number): string {
    switch (code) {
      case 1:
        return 'Permission denied. Please allow location access.';
      case 2:
        return 'Position unavailable. Check your internet connection.';
      case 3:
        return 'Timeout. Location request took too long.';
      default:
        return 'Unknown geolocation error occurred.';
    }
  }
}

// React hook for geolocation with African context
export function useGeolocation() {
  const { t } = useLanguage();
  const geoService = GeolocationService.getInstance();

  const getCurrentLocation = async (): Promise<GeolocationData> => {
    try {
      const position = await geoService.getCurrentPosition();
      return await geoService.reverseGeocode(position.latitude, position.longitude);
    } catch (error) {
      throw new Error(t('geolocation?.error?.general'));
    }
  };

  const getAfricanCities = () => geoService.getAfricanCities();

  const calculateSchoolDistance = (
    studentLat: number,
    studentLon: number,
    schoolLat: number,
    schoolLon: number
  ) => {
    return geoService.calculateDistance(studentLat, studentLon, schoolLat, schoolLon);
  };

  const isNearSchool = (
    studentLat: number,
    studentLon: number,
    schoolLat: number,
    schoolLon: number,
    radiusKm: number = 0.5
  ) => {
    return geoService.isWithinSchoolZone(studentLat, studentLon, schoolLat, schoolLon, radiusKm);
  };

  return {
    getCurrentLocation,
    getAfricanCities,
    calculateSchoolDistance,
    isNearSchool,
    watchPosition: geoService?.watchPosition?.bind(geoService),
    clearWatch: geoService?.clearWatch?.bind(geoService)
  };
}

export default GeolocationService;
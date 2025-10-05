/**
 * Détecteur d'appareil pour optimiser l'expérience PWA
 * Spécialement conçu pour les smartphones africains de basse gamme
 */

interface DeviceCapabilities {
  ram: number; // GB estimé
  isLowEnd: boolean;
  connectionType: string;
  batteryLevel?: number;
  networkSpeed: 'slow' | 'medium' | 'fast';
  supportLevel: 'basic' | 'standard' | 'advanced';
}

interface OptimizationProfile {
  pingInterval: number; // ms
  maxCacheSize: number; // MB
  enableBackgroundSync: boolean;
  enableNotificationQueue: boolean;
  connectionTimeout: number;
  maxRetries: number;
  enableAdvancedFeatures: boolean;
}

class DeviceDetector {
  private static instance: DeviceDetector;
  private capabilities: DeviceCapabilities | null = null;
  private profile: OptimizationProfile | null = null;

  private constructor() {
    this.detectDevice();
  }

  public static getInstance(): DeviceDetector {
    if (!DeviceDetector.instance) {
      DeviceDetector.instance = new DeviceDetector();
    }
    return DeviceDetector.instance;
  }

  private detectDevice(): void {
    // Détection de la RAM et des capacités
    const ram = this.estimateRAM();
    const isLowEnd = this.checkIfLowEnd(ram);
    const connectionType = this.getConnectionType();
    const networkSpeed = this.estimateNetworkSpeed();
    
    this.capabilities = {
      ram,
      isLowEnd,
      connectionType,
      networkSpeed,
      supportLevel: isLowEnd ? 'basic' : ram > 4 ? 'advanced' : 'standard'
    };

    // Générer le profil d'optimisation
    this.profile = this.generateOptimizationProfile();

    console.log('[DEVICE_DETECTOR] 📱 Appareil détecté:', {
      ram: `${ram}GB`,
      type: isLowEnd ? 'Basse gamme' : 'Standard+',
      connection: connectionType,
      speed: networkSpeed,
      profile: this.profile
    });
  }

  private estimateRAM(): number {
    // Utiliser l'API Device Memory si disponible
    if ('deviceMemory' in navigator) {
      return (navigator as any).deviceMemory;
    }

    // Estimation basée sur les performances
    const hardwareConcurrency = navigator.hardwareConcurrency || 1;
    const userAgent = navigator.userAgent.toLowerCase();

    // Détection spécifique pour appareils africains courants
    if (userAgent.includes('android')) {
      // Smartphones Android bas de gamme courants en Afrique
      if (userAgent.includes('samsung') && userAgent.includes('sm-a')) {
        return hardwareConcurrency <= 4 ? 2 : 3; // Galaxy A série
      }
      if (userAgent.includes('tecno') || userAgent.includes('infinix')) {
        return hardwareConcurrency <= 4 ? 1 : 2; // Marques africaines populaires
      }
      if (userAgent.includes('huawei') && userAgent.includes('y')) {
        return hardwareConcurrency <= 4 ? 2 : 3; // Huawei Y série
      }
    }

    // Estimation générale basée sur les cœurs
    if (hardwareConcurrency <= 2) return 1;
    if (hardwareConcurrency <= 4) return 2;
    if (hardwareConcurrency <= 6) return 3;
    return 4;
  }

  private checkIfLowEnd(ram: number): boolean {
    // Considérer comme bas de gamme si:
    // - RAM <= 2GB
    // - Connexion lente détectée
    // - User agent suggère un appareil ancien
    
    if (ram <= 2) return true;

    const userAgent = navigator.userAgent.toLowerCase();
    const isOldAndroid = userAgent.includes('android') && 
                        !userAgent.includes('chrome/1') && // Ancien navigateur
                        (userAgent.includes('android 8') || userAgent.includes('android 9'));

    return isOldAndroid;
  }

  private getConnectionType(): string {
    // Utiliser l'API Network Information si disponible
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return connection.effectiveType || connection.type || 'unknown';
    }
    return 'unknown';
  }

  private estimateNetworkSpeed(): 'slow' | 'medium' | 'fast' {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      const effectiveType = connection.effectiveType;
      
      if (effectiveType === '2g' || effectiveType === 'slow-2g') return 'slow';
      if (effectiveType === '3g') return 'medium';
      if (effectiveType === '4g') return 'fast';
    }

    // Estimation basée sur la géolocalisation (approximative pour l'Afrique)
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone.includes('Africa')) {
      return 'medium'; // Supposer réseau moyen en Afrique
    }

    return 'medium';
  }

  private generateOptimizationProfile(): OptimizationProfile {
    if (!this.capabilities) {
      throw new Error('Device capabilities not detected');
    }

    const { isLowEnd, networkSpeed, supportLevel } = this.capabilities;

    if (isLowEnd) {
      // Profil ultra-économe pour appareils bas de gamme
      return {
        pingInterval: 1800000, // 30 minutes - OPTIMIZED: Reduced server load
        maxCacheSize: 5, // 5MB max
        enableBackgroundSync: false, // Trop lourd
        enableNotificationQueue: true, // Mais queue limitée
        connectionTimeout: 15000, // Plus de temps
        maxRetries: 2, // Moins de tentatives
        enableAdvancedFeatures: false
      };
    }

    if (networkSpeed === 'slow') {
      // Profil pour connexion lente
      return {
        pingInterval: 1200000, // 20 minutes - OPTIMIZED: Reduced server load
        maxCacheSize: 10,
        enableBackgroundSync: true,
        enableNotificationQueue: true,
        connectionTimeout: 12000,
        maxRetries: 3,
        enableAdvancedFeatures: false
      };
    }

    if (supportLevel === 'standard') {
      // Profil standard
      return {
        pingInterval: 900000, // 15 minutes - OPTIMIZED: Reduced server load
        maxCacheSize: 20,
        enableBackgroundSync: true,
        enableNotificationQueue: true,
        connectionTimeout: 8000,
        maxRetries: 3,
        enableAdvancedFeatures: true
      };
    }

    // Profil avancé pour appareils puissants
    return {
      pingInterval: 600000, // 10 minutes - OPTIMIZED: Reduced from 2 minutes to prevent server overload
      maxCacheSize: 50,
      enableBackgroundSync: true,
      enableNotificationQueue: true,
      connectionTimeout: 5000,
      maxRetries: 4,
      enableAdvancedFeatures: true
    };
  }

  // API publique
  public getCapabilities(): DeviceCapabilities | null {
    return this.capabilities;
  }

  public getOptimizationProfile(): OptimizationProfile | null {
    return this.profile;
  }

  public shouldUseLowEndMode(): boolean {
    return this.capabilities?.isLowEnd || false;
  }

  public shouldUseEconomyMode(): boolean {
    if (!this.capabilities) return false;
    
    return this.capabilities.isLowEnd || 
           this.capabilities.networkSpeed === 'slow' ||
           this.capabilities.ram <= 2;
  }

  // Surveillance de la batterie pour adapter le comportement
  public async getBatteryInfo(): Promise<{ level: number; charging: boolean } | null> {
    try {
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery();
        return {
          level: Math.round(battery.level * 100),
          charging: battery.charging
        };
      }
    } catch (error) {
      // Silencieux - API pas toujours disponible
    }
    return null;
  }

  // Adaptation dynamique basée sur l'état de la batterie
  public shouldReduceActivity(batteryLevel?: number): boolean {
    if (!batteryLevel) return false;
    
    // Réduire l'activité si batterie < 20% et pas en charge
    return batteryLevel < 20;
  }
}

// Instance singleton
export const deviceDetector = DeviceDetector.getInstance();
export default DeviceDetector;
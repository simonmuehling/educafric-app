import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, update, push, query, orderByChild, limitToLast, off, get } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "smartwatch-tracker-e061f.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://smartwatch-tracker-e061f-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "smartwatch-tracker-e061f",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const realtimeDb = getDatabase(app);

export interface SmartwatchLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  timestamp: number;
  address?: string;
}

export interface SmartwatchDevice {
  deviceId: string;
  childId: number;
  childName: string;
  parentId: number;
  deviceType: 'smartwatch' | 'gps_tracker' | 'smartphone';
  deviceName: string;
  batteryLevel: number;
  isOnline: boolean;
  lastSeen: number;
  location: SmartwatchLocation;
  safeZones?: SafeZone[];
}

export interface SafeZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  isActive: boolean;
}

export interface LocationAlert {
  id?: string;
  childId: number;
  deviceId: string;
  type: 'left_safe_zone' | 'entered_safe_zone' | 'battery_low' | 'device_offline' | 'sos';
  message: string;
  messageFr: string;
  location: SmartwatchLocation;
  timestamp: number;
  isRead: boolean;
}

export class SmartwatchRealtimeService {
  private activeListeners: Map<string, () => void> = new Map();

  subscribeToDeviceLocation(
    deviceId: string,
    callback: (location: SmartwatchLocation | null) => void
  ): () => void {
    const locationRef = ref(realtimeDb, `devices/${deviceId}/location`);
    
    const unsubscribe = onValue(locationRef, (snapshot) => {
      const data = snapshot.val();
      callback(data as SmartwatchLocation | null);
    }, (error) => {
      console.error('[SMARTWATCH_REALTIME] Location subscription error:', error);
      callback(null);
    });

    const cleanup = () => off(locationRef);
    this.activeListeners.set(`location_${deviceId}`, cleanup);
    
    return cleanup;
  }

  subscribeToChildDevices(
    parentId: number,
    callback: (devices: SmartwatchDevice[]) => void
  ): () => void {
    const devicesRef = ref(realtimeDb, 'devices');
    
    const unsubscribe = onValue(devicesRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        callback([]);
        return;
      }
      
      const devices: SmartwatchDevice[] = [];
      Object.keys(data).forEach((deviceId) => {
        const device = data[deviceId];
        if (device.parentId === parentId) {
          devices.push({ ...device, deviceId });
        }
      });
      
      callback(devices);
    }, (error) => {
      console.error('[SMARTWATCH_REALTIME] Devices subscription error:', error);
      callback([]);
    });

    const cleanup = () => off(devicesRef);
    this.activeListeners.set(`devices_${parentId}`, cleanup);
    
    return cleanup;
  }

  subscribeToAlerts(
    parentId: number,
    callback: (alerts: LocationAlert[]) => void
  ): () => void {
    const alertsRef = query(
      ref(realtimeDb, `alerts/${parentId}`),
      orderByChild('timestamp'),
      limitToLast(50)
    );
    
    const unsubscribe = onValue(alertsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        callback([]);
        return;
      }
      
      const alerts: LocationAlert[] = Object.keys(data).map((key) => ({
        id: key,
        ...data[key]
      }));
      
      alerts.sort((a, b) => b.timestamp - a.timestamp);
      callback(alerts);
    }, (error) => {
      console.error('[SMARTWATCH_REALTIME] Alerts subscription error:', error);
      callback([]);
    });

    const cleanup = () => off(alertsRef);
    this.activeListeners.set(`alerts_${parentId}`, cleanup);
    
    return cleanup;
  }

  async registerDevice(device: Omit<SmartwatchDevice, 'lastSeen'>): Promise<string> {
    try {
      const deviceRef = ref(realtimeDb, `devices/${device.deviceId}`);
      await set(deviceRef, {
        ...device,
        lastSeen: Date.now(),
        isOnline: true
      });
      
      console.log('[SMARTWATCH_REALTIME] Device registered:', device.deviceId);
      return device.deviceId;
    } catch (error) {
      console.error('[SMARTWATCH_REALTIME] Device registration error:', error);
      throw error;
    }
  }

  async updateDeviceLocation(
    deviceId: string,
    location: SmartwatchLocation
  ): Promise<void> {
    try {
      const updates: Record<string, any> = {
        [`devices/${deviceId}/location`]: location,
        [`devices/${deviceId}/lastSeen`]: Date.now(),
        [`devices/${deviceId}/isOnline`]: true
      };
      
      await update(ref(realtimeDb), updates);
      
      const historyRef = ref(realtimeDb, `locationHistory/${deviceId}`);
      await push(historyRef, {
        ...location,
        recordedAt: Date.now()
      });
      
      console.log('[SMARTWATCH_REALTIME] Location updated for device:', deviceId);
    } catch (error) {
      console.error('[SMARTWATCH_REALTIME] Location update error:', error);
      throw error;
    }
  }

  async updateDeviceBattery(deviceId: string, batteryLevel: number): Promise<void> {
    try {
      await update(ref(realtimeDb, `devices/${deviceId}`), {
        batteryLevel,
        lastSeen: Date.now()
      });
      
      if (batteryLevel < 20) {
        await this.createAlert(deviceId, 'battery_low', {
          latitude: 0,
          longitude: 0,
          accuracy: 0,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('[SMARTWATCH_REALTIME] Battery update error:', error);
      throw error;
    }
  }

  async createAlert(
    deviceId: string,
    type: LocationAlert['type'],
    location: SmartwatchLocation
  ): Promise<void> {
    try {
      const deviceRef = ref(realtimeDb, `devices/${deviceId}`);
      const snapshot = await get(deviceRef);
      const deviceData = snapshot.val() as SmartwatchDevice | null;
      
      if (!deviceData) return;
      
      const messages: Record<LocationAlert['type'], { en: string; fr: string }> = {
        'left_safe_zone': {
          en: `${deviceData.childName} has left a safe zone`,
          fr: `${deviceData.childName} a quitté une zone sécurisée`
        },
        'entered_safe_zone': {
          en: `${deviceData.childName} has entered a safe zone`,
          fr: `${deviceData.childName} est entré dans une zone sécurisée`
        },
        'battery_low': {
          en: `${deviceData.childName}'s device battery is low (${deviceData.batteryLevel}%)`,
          fr: `La batterie de l'appareil de ${deviceData.childName} est faible (${deviceData.batteryLevel}%)`
        },
        'device_offline': {
          en: `${deviceData.childName}'s device went offline`,
          fr: `L'appareil de ${deviceData.childName} est hors ligne`
        },
        'sos': {
          en: `SOS! ${deviceData.childName} pressed the emergency button`,
          fr: `SOS ! ${deviceData.childName} a appuyé sur le bouton d'urgence`
        }
      };
      
      const alertData: Omit<LocationAlert, 'id'> = {
        childId: deviceData.childId,
        deviceId,
        type,
        message: messages[type].en,
        messageFr: messages[type].fr,
        location,
        timestamp: Date.now(),
        isRead: false
      };
      
      const alertsRef = ref(realtimeDb, `alerts/${deviceData.parentId}`);
      await push(alertsRef, alertData);
      
      console.log('[SMARTWATCH_REALTIME] Alert created:', type);
    } catch (error) {
      console.error('[SMARTWATCH_REALTIME] Alert creation error:', error);
      throw error;
    }
  }

  async markAlertAsRead(parentId: number, alertId: string): Promise<void> {
    try {
      await update(ref(realtimeDb, `alerts/${parentId}/${alertId}`), {
        isRead: true
      });
    } catch (error) {
      console.error('[SMARTWATCH_REALTIME] Mark alert read error:', error);
      throw error;
    }
  }

  async addSafeZone(deviceId: string, zone: Omit<SafeZone, 'id'>): Promise<string> {
    try {
      const zonesRef = ref(realtimeDb, `devices/${deviceId}/safeZones`);
      const newZoneRef = await push(zonesRef, zone);
      return newZoneRef.key || '';
    } catch (error) {
      console.error('[SMARTWATCH_REALTIME] Add safe zone error:', error);
      throw error;
    }
  }

  async removeSafeZone(deviceId: string, zoneId: string): Promise<void> {
    try {
      await set(ref(realtimeDb, `devices/${deviceId}/safeZones/${zoneId}`), null);
    } catch (error) {
      console.error('[SMARTWATCH_REALTIME] Remove safe zone error:', error);
      throw error;
    }
  }

  cleanupAllListeners(): void {
    this.activeListeners.forEach((cleanup) => cleanup());
    this.activeListeners.clear();
  }
}

export const smartwatchService = new SmartwatchRealtimeService();

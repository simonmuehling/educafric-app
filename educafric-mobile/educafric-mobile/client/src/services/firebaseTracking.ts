import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, query, where, orderBy, doc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Configuration Firebase (déjà configurée)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export interface TrackingDevice {
  id?: string;
  childId: string;
  childName: string;
  deviceType: 'smartphone' | 'smartwatch' | 'gps_tracker';
  deviceId: string;
  isActive: boolean;
  batteryLevel: number;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    timestamp: Date;
  };
  alertRadius: number;
  parentId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrackingConfig {
  id?: string;
  parentId: string;
  childId: string;
  childName: string;
  location: string;
  address: string;
  latitude: number;
  longitude: number;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  days: string[];
  alertRadius: number;
  deviceType: 'smartphone' | 'smartwatch' | 'gps_tracker';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class FirebaseTrackingService {
  // Créer une nouvelle configuration de suivi
  async createTrackingConfig(config: Omit<TrackingConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'trackingConfigs'), {
        ...config,
        startDate: new Date(config.startDate),
        endDate: new Date(config.endDate),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erreur création config tracking:', error);
      throw error;
    }
  }

  // Écouter les configurations de suivi d'un parent
  onTrackingConfigs(parentId: string, callback: (configs: TrackingConfig[]) => void) {
    const q = query(
      collection(db, 'trackingConfigs'),
      where('parentId', '==', parentId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const configs: TrackingConfig[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        configs.push({
          id: doc.id,
          ...data,
          startDate: data.startDate.toDate(),
          endDate: data.endDate.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as TrackingConfig);
      });
      callback(configs);
    });
  }

  // Mettre à jour une configuration
  async updateTrackingConfig(configId: string, updates: Partial<TrackingConfig>): Promise<void> {
    try {
      const configRef = doc(db, 'trackingConfigs', configId);
      await updateDoc(configRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Erreur mise à jour config:', error);
      throw error;
    }
  }

  // Supprimer une configuration
  async deleteTrackingConfig(configId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'trackingConfigs', configId));
    } catch (error) {
      console.error('Erreur suppression config:', error);
      throw error;
    }
  }

  // Ajouter un appareil de suivi
  async addTrackingDevice(device: Omit<TrackingDevice, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'trackingDevices'), {
        ...device,
        location: {
          ...device.location,
          timestamp: new Date(device.location.timestamp)
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erreur ajout appareil:', error);
      throw error;
    }
  }

  // Écouter les appareils de suivi d'un parent
  onTrackingDevices(parentId: string, callback: (devices: TrackingDevice[]) => void) {
    const q = query(
      collection(db, 'trackingDevices'),
      where('parentId', '==', parentId),
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const devices: TrackingDevice[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        devices.push({
          id: doc.id,
          ...data,
          location: {
            ...data.location,
            timestamp: data.location.timestamp.toDate()
          },
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as TrackingDevice);
      });
      callback(devices);
    });
  }

  // Mettre à jour la localisation d'un appareil
  async updateDeviceLocation(
    deviceId: string, 
    location: { latitude: number; longitude: number; address: string }
  ): Promise<void> {
    try {
      const deviceRef = doc(db, 'trackingDevices', deviceId);
      await updateDoc(deviceRef, {
        location: {
          ...location,
          timestamp: new Date()
        },
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Erreur mise à jour localisation:', error);
      throw error;
    }
  }

  // Mettre à jour le niveau de batterie
  async updateDeviceBattery(deviceId: string, batteryLevel: number): Promise<void> {
    try {
      const deviceRef = doc(db, 'trackingDevices', deviceId);
      await updateDoc(deviceRef, {
        batteryLevel,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Erreur mise à jour batterie:', error);
      throw error;
    }
  }

  // Activer/désactiver un appareil
  async toggleDevice(deviceId: string, isActive: boolean): Promise<void> {
    try {
      const deviceRef = doc(db, 'trackingDevices', deviceId);
      await updateDoc(deviceRef, {
        isActive,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Erreur activation/désactivation:', error);
      throw error;
    }
  }

  // Obtenir l'historique des localisations
  async getLocationHistory(childId: string, startDate: Date, endDate: Date): Promise<any[]> {
    try {
      const q = query(
        collection(db, 'locationHistory'),
        where('childId', '==', childId),
        where('timestamp', '>=', startDate),
        where('timestamp', '<=', endDate),
        orderBy('timestamp', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const history: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        history.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp.toDate()
        });
      });
      
      return history;
    } catch (error) {
      console.error('Erreur récupération historique:', error);
      throw error;
    }
  }

  // Enregistrer un point de localisation dans l'historique
  async recordLocationHistory(
    childId: string,
    location: { latitude: number; longitude: number; address: string },
    deviceType: string
  ): Promise<void> {
    try {
      await addDoc(collection(db, 'locationHistory'), {
        childId,
        location,
        deviceType,
        timestamp: new Date(),
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Erreur enregistrement historique:', error);
      throw error;
    }
  }
}

export const trackingService = new FirebaseTrackingService();
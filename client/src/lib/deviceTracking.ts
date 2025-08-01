import { useGeolocation, GeolocationData } from './geolocation';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiRequest } from '@/lib/queryClient';

export interface TrackedDevice {
  id: string;
  studentId: number;
  deviceType: 'tablet' | 'smartwatch' | 'phone';
  deviceName: string;
  macAddress?: string;
  imei?: string;
  batteryLevel?: number;
  isActive: boolean;
  lastSeen: Date;
  currentLocation?: GeolocationData;
  safeZones: SafeZone[];
  emergencyContacts: EmergencyContact[];
  trackingSettings: TrackingSettings;
}

export interface SafeZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  type: 'school' | 'home' | 'family' | 'friend' | 'activity';
  isActive: boolean;
  entryNotification: boolean;
  exitNotification: boolean;
  timeRestrictions?: {
    allowedHours: { start: string; end: string }[];
    allowedDays: number[]; // 0-6 (Sunday-Saturday)
  };
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  priority: number;
  canTrack: boolean;
}

export interface TrackingSettings {
  locationFrequency: number; // minutes between location updates
  batteryAlertLevel: number; // percentage to alert on low battery
  speedAlertThreshold: number; // km/h to alert on high speed
  nightModeStart: string; // HH:MM
  nightModeEnd: string; // HH:MM
  shareLocationWithTeachers: boolean;
  shareLocationWithSchool: boolean;
  emergencyMode: boolean;
  parentalControlsEnabled: boolean;
}

export interface LocationAlert {
  id: string;
  deviceId: string;
  type: 'entry' | 'exit' | 'emergency' | 'speed' | 'battery' | 'offline';
  message: string;
  timestamp: Date;
  location?: GeolocationData;
  isRead: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Device tracking service for African educational context
export class DeviceTrackingService {
  private static instance: DeviceTrackingService;
  private watchIds: Map<string, number> = new Map();
  
  public static getInstance(): DeviceTrackingService {
    if (!DeviceTrackingService.instance) {
      DeviceTrackingService.instance = new DeviceTrackingService();
    }
    return DeviceTrackingService.instance;
  }

  // Register a new device for tracking
  async registerDevice(device: Omit<TrackedDevice, 'id' | 'lastSeen' | 'isActive'>): Promise<TrackedDevice> {
    try {
      const response = await apiRequest('POST', '/api/tracking/devices', device);
      return await response.json();
    } catch (error) {
      console.error('Failed to register device:', error);
      throw new Error('Device registration failed');
    }
  }

  // Start tracking a device
  async startTracking(deviceId: string): Promise<boolean> {
    try {
      const device = await this.getDevice(deviceId);
      if (!device) throw new Error('Device not found');

      // Start location watching
      const { watchPosition } = useGeolocation();
      
      const watchId = watchPosition(
        async (location) => {
          await this.updateDeviceLocation(deviceId, location);
          await this.checkSafeZones(device, location);
          await this.checkSpeedAlerts(device, location);
        },
        (error) => {
          console.error('Location tracking error:', error);
          this.handleTrackingError(deviceId, error);
        }
      );

      this?.watchIds?.set(deviceId, watchId);
      
      // Update device status
      await apiRequest('PATCH', `/api/tracking/devices/${deviceId}`, {
        isActive: true,
        lastSeen: new Date()
      });

      return true;
    } catch (error) {
      console.error('Failed to start tracking:', error);
      return false;
    }
  }

  // Stop tracking a device
  async stopTracking(deviceId: string): Promise<boolean> {
    try {
      const watchId = this?.watchIds?.get(deviceId);
      if (watchId) {
        const { clearWatch } = useGeolocation();
        clearWatch(watchId);
        this?.watchIds?.delete(deviceId);
      }

      await apiRequest('PATCH', `/api/tracking/devices/${deviceId}`, {
        isActive: false,
        lastSeen: new Date()
      });

      return true;
    } catch (error) {
      console.error('Failed to stop tracking:', error);
      return false;
    }
  }

  // Get device information
  async getDevice(deviceId: string): Promise<TrackedDevice | null> {
    try {
      const response = await apiRequest('GET', `/api/tracking/devices/${deviceId}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get device:', error);
      return null;
    }
  }

  // Get all devices for a student
  async getStudentDevices(studentId: number): Promise<TrackedDevice[]> {
    try {
      const response = await apiRequest('GET', `/api/tracking/students/${studentId}/devices`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get student devices:', error);
      return [];
    }
  }

  // Get all devices a parent can monitor
  async getParentDevices(parentId: number): Promise<TrackedDevice[]> {
    try {
      const response = await apiRequest('GET', `/api/tracking/parents/${parentId}/devices`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get parent devices:', error);
      return [];
    }
  }

  // Update device location
  private async updateDeviceLocation(deviceId: string, location: GeolocationData): Promise<void> {
    try {
      await apiRequest('POST', `/api/tracking/devices/${deviceId}/location`, {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        timestamp: location.timestamp,
        address: location.address
      });
    } catch (error) {
      console.error('Failed to update device location:', error);
    }
  }

  // Check if device entered/exited safe zones
  private async checkSafeZones(device: TrackedDevice, location: GeolocationData): Promise<void> {
    const { calculateSchoolDistance } = useGeolocation();

    for (const zone of device.safeZones) {
      if (!zone.isActive) continue;

      const distance = calculateSchoolDistance(
        location.latitude,
        location.longitude,
        zone.latitude,
        zone.longitude
      ) * 1000; // Convert to meters

      const isInZone = distance <= zone.radius;
      const wasInZone = await this.wasDeviceInZone(device.id, zone.id);

      // Detect zone entry
      if (isInZone && !wasInZone && zone.entryNotification) {
        await this.createAlert({
          deviceId: device.id,
          type: 'entry',
          message: `${device.deviceName} entered ${zone.name || ''}`,
          location,
          severity: 'low'
        });
      }

      // Detect zone exit
      if (!isInZone && wasInZone && zone.exitNotification) {
        await this.createAlert({
          deviceId: device.id,
          type: 'exit',
          message: `${device.deviceName} left ${zone.name || ''}`,
          location,
          severity: zone.type === 'school' ? 'medium' : 'low'
        });
      }

      // Update zone status
      await this.updateZoneStatus(device.id, zone.id, isInZone);
    }
  }

  // Check for speed alerts (useful for tablets in vehicles)
  private async checkSpeedAlerts(device: TrackedDevice, location: GeolocationData): Promise<void> {
    try {
      const lastLocation = await this.getLastLocation(device.id);
      if (!lastLocation) return;

      const { calculateSchoolDistance } = useGeolocation();
      const distance = calculateSchoolDistance(
        lastLocation.latitude,
        lastLocation.longitude,
        location.latitude,
        location.longitude
      );

      const timeElapsed = (location.timestamp - lastLocation.timestamp) / 1000 / 3600; // hours
      const speed = distance / timeElapsed; // km/h

      if (speed > device?.trackingSettings?.speedAlertThreshold) {
        await this.createAlert({
          deviceId: device.id,
          type: 'speed',
          message: `${device.deviceName} traveling at ${speed.toFixed(1)} km/h`,
          location,
          severity: speed > 80 ? 'high' : 'medium'
        });
      }
    } catch (error) {
      console.error('Speed check error:', error);
    }
  }

  // Create location alert
  private async createAlert(alert: Omit<LocationAlert, 'id' | 'timestamp' | 'isRead'>): Promise<void> {
    try {
      await apiRequest('POST', '/api/tracking/alerts', {
        ...alert,
        timestamp: new Date(),
        isRead: false
      });
    } catch (error) {
      console.error('Failed to create alert:', error);
    }
  }

  // Emergency mode activation
  async activateEmergencyMode(deviceId: string): Promise<boolean> {
    try {
      const device = await this.getDevice(deviceId);
      if (!device) throw new Error('Device not found');

      // Increase location frequency to every 30 seconds
      await this.updateTrackingSettings(deviceId, {
        ...device.trackingSettings,
        locationFrequency: 0.5,
        emergencyMode: true
      });

      // Send emergency alerts to all contacts
      for (const contact of device.emergencyContacts) {
        await this.sendEmergencyAlert(device, contact);
      }

      await this.createAlert({
        deviceId,
        type: 'emergency',
        message: `Emergency mode activated for ${device.deviceName}`,
        severity: 'critical'
      });

      return true;
    } catch (error) {
      console.error('Failed to activate emergency mode:', error);
      return false;
    }
  }

  // Send emergency alert to contact
  private async sendEmergencyAlert(device: TrackedDevice, contact: EmergencyContact): Promise<void> {
    try {
      await apiRequest('POST', '/api/tracking/emergency-alert', {
        deviceId: device.id,
        contactId: contact.id,
        message: `EMERGENCY: ${device.deviceName} needs immediate assistance`,
        location: device.currentLocation
      });
    } catch (error) {
      console.error('Failed to send emergency alert:', error);
    }
  }

  // Update device tracking settings
  async updateTrackingSettings(deviceId: string, settings: Partial<TrackingSettings>): Promise<boolean> {
    try {
      await apiRequest('PATCH', `/api/tracking/devices/${deviceId}/settings`, settings);
      return true;
    } catch (error) {
      console.error('Failed to update tracking settings:', error);
      return false;
    }
  }

  // Add safe zone
  async addSafeZone(deviceId: string, zone: Omit<SafeZone, 'id'>): Promise<SafeZone> {
    try {
      const response = await apiRequest('POST', `/api/tracking/devices/${deviceId}/safe-zones`, zone);
      return await response.json();
    } catch (error) {
      console.error('Failed to add safe zone:', error);
      throw new Error('Failed to add safe zone');
    }
  }

  // Get device alerts
  async getDeviceAlerts(deviceId: string, limit: number = 50): Promise<LocationAlert[]> {
    try {
      const response = await apiRequest('GET', `/api/tracking/devices/${deviceId}/alerts?limit=${limit}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get device alerts:', error);
      return [];
    }
  }

  // Helper methods
  private async wasDeviceInZone(deviceId: string, zoneId: string): Promise<boolean> {
    try {
      const response = await apiRequest('GET', `/api/tracking/devices/${deviceId}/zone-status/${zoneId}`);
      const data = await response.json();
      return data.isInZone;
    } catch (error) {
      return false;
    }
  }

  private async updateZoneStatus(deviceId: string, zoneId: string, isInZone: boolean): Promise<void> {
    try {
      await apiRequest('POST', `/api/tracking/devices/${deviceId}/zone-status/${zoneId}`, { isInZone });
    } catch (error) {
      console.error('Failed to update zone status:', error);
    }
  }

  private async getLastLocation(deviceId: string): Promise<GeolocationData | null> {
    try {
      const response = await apiRequest('GET', `/api/tracking/devices/${deviceId}/last-location`);
      return await response.json();
    } catch (error) {
      return null;
    }
  }

  private handleTrackingError(deviceId: string, error: any): void {
    console.error(`Tracking error for device ${deviceId}:`, error);
    this.createAlert({
      deviceId,
      type: 'offline',
      message: `${deviceId} tracking error: ${error.message}`,
      severity: 'medium'
    });
  }
}

// React hook for device tracking
export function useDeviceTracking() {
  const { t } = useLanguage();
  const trackingService = DeviceTrackingService.getInstance();

  return {
    registerDevice: trackingService?.registerDevice?.bind(trackingService),
    startTracking: trackingService?.startTracking?.bind(trackingService),
    stopTracking: trackingService?.stopTracking?.bind(trackingService),
    getDevice: trackingService?.getDevice?.bind(trackingService),
    getStudentDevices: trackingService?.getStudentDevices?.bind(trackingService),
    getParentDevices: trackingService?.getParentDevices?.bind(trackingService),
    activateEmergencyMode: trackingService?.activateEmergencyMode?.bind(trackingService),
    updateTrackingSettings: trackingService?.updateTrackingSettings?.bind(trackingService),
    addSafeZone: trackingService?.addSafeZone?.bind(trackingService),
    getDeviceAlerts: trackingService?.getDeviceAlerts?.bind(trackingService)
  };
}

export default DeviceTrackingService;
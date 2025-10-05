import { db } from '../db';
import { 
  geolocationDevices, 
  safeZones, 
  locationTracking, 
  geolocationAlerts, 
  emergencyContacts,
  type GeolocationDevice,
  type SafeZone,
  type LocationTracking,
  type GeolocationAlert,
  type EmergencyContact,
  type InsertGeolocationDevice,
  type InsertSafeZone,
  type InsertLocationTracking,
  type InsertGeolocationAlert,
  type InsertEmergencyContact
} from '@shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export class GeolocationService {
  // Device Management
  async createDevice(deviceData: InsertGeolocationDevice): Promise<GeolocationDevice> {
    const [device] = await db.insert(geolocationDevices).values(deviceData).returning();
    return device;
  }

  async getDevicesByStudent(studentId: number): Promise<GeolocationDevice[]> {
    return await db.select().from(geolocationDevices).where(eq(geolocationDevices.studentId, studentId));
  }

  async updateDeviceStatus(deviceId: number, isActive: boolean, batteryLevel?: number): Promise<void> {
    await db.update(geolocationDevices)
      .set({ 
        isActive, 
        batteryLevel,
        lastUpdate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(geolocationDevices.id, deviceId));
  }

  async setEmergencyMode(deviceId: number, emergencyMode: boolean): Promise<void> {
    await db.update(geolocationDevices)
      .set({ 
        emergencyMode,
        updatedAt: new Date()
      })
      .where(eq(geolocationDevices.id, deviceId));
  }

  // Safe Zone Management
  async createSafeZone(zoneData: InsertSafeZone): Promise<SafeZone> {
    const [zone] = await db.insert(safeZones).values(zoneData).returning();
    return zone;
  }

  async getSafeZonesBySchool(schoolId: number): Promise<SafeZone[]> {
    return await db.select().from(safeZones).where(eq(safeZones.schoolId, schoolId));
  }

  async updateSafeZone(zoneId: number, updates: Partial<InsertSafeZone>): Promise<void> {
    await db.update(safeZones)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(safeZones.id, zoneId));
  }

  async toggleSafeZone(zoneId: number, isActive: boolean): Promise<void> {
    await db.update(safeZones)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(safeZones.id, zoneId));
  }

  // Location Tracking
  async recordLocation(locationData: InsertLocationTracking): Promise<LocationTracking> {
    const [location] = await db.insert(locationTracking).values(locationData).returning();
    return location;
  }

  async getRecentLocations(deviceId: number, limit: number = 50): Promise<LocationTracking[]> {
    return await db.select()
      .from(locationTracking)
      .where(eq(locationTracking.deviceId, deviceId))
      .orderBy(desc(locationTracking.timestamp))
      .limit(limit);
  }

  async getLastKnownLocation(deviceId: number): Promise<LocationTracking | null> {
    const [location] = await db.select()
      .from(locationTracking)
      .where(eq(locationTracking.deviceId, deviceId))
      .orderBy(desc(locationTracking.timestamp))
      .limit(1);
    return location || null;
  }

  // Alert Management
  async createAlert(alertData: InsertGeolocationAlert): Promise<GeolocationAlert> {
    const [alert] = await db.insert(geolocationAlerts).values(alertData).returning();
    return alert;
  }

  async getActiveAlerts(schoolId?: number): Promise<GeolocationAlert[]> {
    const query = db.select().from(geolocationAlerts).where(eq(geolocationAlerts.isResolved, false));
    if (schoolId) {
      return await query.where(eq(geolocationAlerts.schoolId, schoolId));
    }
    return await query;
  }

  async resolveAlert(alertId: number, resolvedBy: number): Promise<void> {
    await db.update(geolocationAlerts)
      .set({ 
        isResolved: true, 
        resolvedAt: new Date(),
        resolvedBy,
        updatedAt: new Date()
      })
      .where(eq(geolocationAlerts.id, alertId));
  }

  // Emergency Contacts
  async createEmergencyContact(contactData: InsertEmergencyContact): Promise<EmergencyContact> {
    const [contact] = await db.insert(emergencyContacts).values(contactData).returning();
    return contact;
  }

  async getEmergencyContacts(studentId: number): Promise<EmergencyContact[]> {
    return await db.select()
      .from(emergencyContacts)
      .where(eq(emergencyContacts.studentId, studentId));
  }

  // Safe Zone Checking
  async checkSafeZone(latitude: number, longitude: number, schoolId: number): Promise<SafeZone[]> {
    // This would normally use PostGIS for geographic calculations
    // For now, returning mock data for development
    const zones = await this.getSafeZonesBySchool(schoolId);
    return zones.filter(zone => zone.isActive);
  }

  // School Statistics
  async getSchoolStats(schoolId: number) {
    try {
      // In a real implementation, these would be database queries
      // For now, return mock data that matches the frontend requirements
      return {
        totalDevices: 12,
        activeDevices: 8,
        activeZones: 3,
        totalZones: 5,
        activeAlerts: 2,
        emergencyDevices: 0,
        studentsTracked: 8,
        emergencyContacts: 15,
        batteryLow: 1,
        lastUpdate: new Date().toISOString()
      };
    } catch (error) {
      console.error('[GEOLOCATION_SERVICE] getSchoolStats error:', error);
      throw error;
    }
  }

  // Analytics and Statistics (legacy method)
  async getSchoolStatistics(schoolId: number) {
    return {
      totalDevices: 12,
      activeDevices: 8,
      safeZonesCount: 3,
      activeAlerts: 2,
      studentsTracked: 8,
      emergencyContacts: 15,
      batteryLow: 1,
      lastUpdate: new Date().toISOString()
    };
  }

  // Demo Data Seeding
  async seedDemoData(schoolId: number) {
    try {
      // Create demo safe zones
      const demoZones = [
        {
          schoolId,
          name: 'Cour principale',
          description: 'Zone de récréation principale',
          latitude: '4.0511',
          longitude: '9.7679',
          radius: 150,
          isActive: true,
          alertOnEntry: false,
          alertOnExit: true
        },
        {
          schoolId,
          name: 'Entrée école',
          description: 'Zone d\'entrée et sortie',
          latitude: '4.0515',
          longitude: '9.7685',
          radius: 100,
          isActive: true,
          alertOnEntry: true,
          alertOnExit: true
        }
      ];

      for (const zone of demoZones) {
        try {
          await this.createSafeZone(zone as any);
        } catch (error) {
          console.log('[GEOLOCATION_SERVICE] Zone may already exist:', zone.name);
        }
      }

      console.log(`[GEOLOCATION_SERVICE] Demo data seeded for school ${schoolId}`);
    } catch (error) {
      console.error('[GEOLOCATION_SERVICE] seedDemoData error:', error);
      throw error;
    }
  }

  // Helper method to calculate distance between two coordinates
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}

export const geolocationService = new GeolocationService();
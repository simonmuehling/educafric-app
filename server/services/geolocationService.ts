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
    
    // Update device last update timestamp
    await db.update(geolocationDevices)
      .set({ 
        lastUpdate: new Date(),
        batteryLevel: locationData.batteryLevel 
      })
      .where(eq(geolocationDevices.id, locationData.deviceId));

    return location;
  }

  async getRecentLocations(deviceId: number, limit: number = 50): Promise<LocationTracking[]> {
    return await db.select()
      .from(locationTracking)
      .where(eq(locationTracking.deviceId, deviceId))
      .orderBy(desc(locationTracking.timestamp))
      .limit(limit);
  }

  async getLastKnownLocation(deviceId: number): Promise<LocationTracking | undefined> {
    const [location] = await db.select()
      .from(locationTracking)
      .where(eq(locationTracking.deviceId, deviceId))
      .orderBy(desc(locationTracking.timestamp))
      .limit(1);
    return location;
  }

  // Alert Management
  async createAlert(alertData: InsertGeolocationAlert): Promise<GeolocationAlert> {
    const [alert] = await db.insert(geolocationAlerts).values(alertData).returning();
    return alert;
  }

  async getActiveAlerts(schoolId?: number): Promise<GeolocationAlert[]> {
    let query = db.select().from(geolocationAlerts).where(eq(geolocationAlerts.isResolved, false));
    
    if (schoolId) {
      // Join with devices to filter by school
      // Note: This would need proper join implementation
    }
    
    return await query.orderBy(desc(geolocationAlerts.createdAt));
  }

  async resolveAlert(alertId: number, resolvedBy: number): Promise<void> {
    await db.update(geolocationAlerts)
      .set({ 
        isResolved: true,
        resolvedBy,
        resolvedAt: new Date(),
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
      .where(and(
        eq(emergencyContacts.studentId, studentId),
        eq(emergencyContacts.isActive, true)
      ))
      .orderBy(emergencyContacts.priority);
  }

  // Analytics and Statistics
  async getSchoolStats(schoolId: number) {
    // Get total students with devices
    const [deviceStats] = await db.select({
      totalDevices: sql<number>`count(*)`,
      activeDevices: sql<number>`count(case when ${geolocationDevices.isActive} then 1 end)`,
      emergencyDevices: sql<number>`count(case when ${geolocationDevices.emergencyMode} then 1 end)`
    }).from(geolocationDevices);

    // Get safe zones count
    const [zoneStats] = await db.select({
      totalZones: sql<number>`count(*)`,
      activeZones: sql<number>`count(case when ${safeZones.isActive} then 1 end)`
    }).from(safeZones).where(eq(safeZones.schoolId, schoolId));

    // Get unresolved alerts count
    const [alertStats] = await db.select({
      activeAlerts: sql<number>`count(*)`
    }).from(geolocationAlerts).where(eq(geolocationAlerts.isResolved, false));

    return {
      totalDevices: deviceStats?.totalDevices || 0,
      activeDevices: deviceStats?.activeDevices || 0,
      emergencyDevices: deviceStats?.emergencyDevices || 0,
      totalZones: zoneStats?.totalZones || 0,
      activeZones: zoneStats?.activeZones || 0,
      activeAlerts: alertStats?.activeAlerts || 0
    };
  }

  // Check if location is within safe zone
  async checkSafeZone(latitude: number, longitude: number, schoolId: number): Promise<SafeZone[]> {
    // Simple distance calculation (Haversine formula would be more accurate)
    const zones = await this.getSafeZonesBySchool(schoolId);
    
    const withinZones = zones.filter(zone => {
      if (!zone.isActive) return false;
      
      const lat1 = parseFloat(zone.latitude);
      const lon1 = parseFloat(zone.longitude);
      const distance = this.calculateDistance(latitude, longitude, lat1, lon1);
      
      return distance <= zone.radius;
    });

    return withinZones;
  }

  // Distance calculation helper (in meters)
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  // Bulk operations for demo data
  async seedDemoData(schoolId: number): Promise<void> {
    // Create demo safe zones
    const demoZones = [
      {
        schoolId,
        name: 'Périmètre Principal',
        description: 'Zone principale de l\'école',
        latitude: '3.848',
        longitude: '11.502',
        radius: 100,
        isActive: true,
        alertOnExit: true
      },
      {
        schoolId,
        name: 'Cour de Récréation',
        description: 'Zone de récréation des élèves',
        latitude: '3.849',
        longitude: '11.503',
        radius: 50,
        isActive: true,
        alertOnExit: false
      },
      {
        schoolId,
        name: 'Cantine',
        description: 'Zone de restauration',
        latitude: '3.847',
        longitude: '11.501',
        radius: 30,
        isActive: true,
        alertOnEntry: false,
        alertOnExit: false
      }
    ];

    for (const zone of demoZones) {
      await db.insert(safeZones).values(zone).onConflictDoNothing();
    }
  }
}

export const geolocationService = new GeolocationService();
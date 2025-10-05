/**
 * Geolocation Alert Service
 * Monitors student locations and triggers alerts when they exit safe zones
 */

import { NotificationService } from './notificationService';

interface StudentLocation {
  studentId: number;
  latitude: number;
  longitude: number;
  timestamp: string;
  accuracy: number;
  address?: string;
}

interface SafeZone {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  type: 'home' | 'school' | 'relative' | 'activity';
  active: boolean;
  studentId: number;
  parentId: number;
  createdBy: number;
}

interface LocationAlert {
  studentId: number;
  alertType: 'zone_exit' | 'zone_entry' | 'out_of_all_zones' | 'extended_absence';
  timestamp: string;
  currentLocation: StudentLocation;
  affectedZone?: SafeZone;
  duration?: number; // minutes outside zones
}

class GeolocationAlertService {
  private notificationService: NotificationService;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private sigTermHandler: (() => void) | null = null;
  private sigIntHandler: (() => void) | null = null;
  private studentTracking: Map<number, {
    lastKnownLocation: StudentLocation;
    lastSafeZoneExit?: string;
    isOutsideZones: boolean;
    consecutiveOutsideReadings: number;
  }> = new Map();

  constructor() {
    this.notificationService = new NotificationService();
    console.log('[GEOLOCATION_ALERTS] 🛡️ Geolocation Alert Service initialized');
  }

  /**
   * Start monitoring student locations
   */
  startMonitoring(): void {
    if (this.monitoringInterval) {
      console.log('[GEOLOCATION_ALERTS] ⚠️ Monitoring already active');
      return;
    }

    console.log('[GEOLOCATION_ALERTS] 🔄 Starting location monitoring...');
    
    // Check student locations every 2 minutes (more efficient than 30 seconds)
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.checkAllStudentLocations();
      } catch (error) {
        console.error('[GEOLOCATION_ALERTS] ❌ Monitoring error:', error);
        // Continue monitoring even if one check fails
      }
    }, 120000);

    console.log('[GEOLOCATION_ALERTS] ✅ Location monitoring started (2min intervals)');
    
    // Add graceful shutdown handler with proper listener management
    this.sigTermHandler = () => this.stopMonitoring();
    this.sigIntHandler = () => this.stopMonitoring();
    process.on('SIGTERM', this.sigTermHandler);
    process.on('SIGINT', this.sigIntHandler);
  }

  /**
   * Stop monitoring student locations
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('[GEOLOCATION_ALERTS] 🛑 Location monitoring stopped');
    }
    
    // Clear tracking data to prevent memory leaks
    this.studentTracking.clear();
    
    // Remove specific process listeners to avoid interfering with other services
    if (this.sigTermHandler) {
      process.removeListener('SIGTERM', this.sigTermHandler);
      this.sigTermHandler = null;
    }
    if (this.sigIntHandler) {
      process.removeListener('SIGINT', this.sigIntHandler);
      this.sigIntHandler = null;
    }
  }

  /**
   * Process a new student location update
   */
  async processLocationUpdate(location: StudentLocation): Promise<void> {
    console.log(`[GEOLOCATION_ALERTS] 📍 Processing location for student ${location.studentId}`);
    
    try {
      // Get student's safe zones
      const safeZones = await this.getStudentSafeZones(location.studentId);
      if (safeZones.length === 0) {
        console.log(`[GEOLOCATION_ALERTS] ℹ️ No safe zones defined for student ${location.studentId}`);
        return;
      }

      // Check if student is in any safe zone
      const currentZone = this.findCurrentSafeZone(location, safeZones);
      const wasInSafeZone = this.isStudentCurrentlyInSafeZone(location.studentId);
      const isNowInSafeZone = !!currentZone;

      // Update tracking data
      const tracking = this.studentTracking.get(location.studentId) || {
        lastKnownLocation: location,
        isOutsideZones: false,
        consecutiveOutsideReadings: 0
      };

      tracking.lastKnownLocation = location;

      // Determine alert type
      if (!wasInSafeZone && isNowInSafeZone) {
        // Student entered a safe zone
        await this.handleZoneEntry(location, currentZone!, tracking);
        tracking.isOutsideZones = false;
        tracking.consecutiveOutsideReadings = 0;
        tracking.lastSafeZoneExit = undefined;
      } else if (wasInSafeZone && !isNowInSafeZone) {
        // Student left a safe zone
        await this.handleZoneExit(location, safeZones, tracking);
        tracking.isOutsideZones = true;
        tracking.consecutiveOutsideReadings = 1;
        tracking.lastSafeZoneExit = new Date().toISOString();
      } else if (!isNowInSafeZone) {
        // Student remains outside safe zones
        tracking.consecutiveOutsideReadings++;
        
        // Check for extended absence (more than 15 minutes outside)
        if (tracking.lastSafeZoneExit) {
          const exitTime = new Date(tracking.lastSafeZoneExit).getTime();
          const currentTime = new Date().getTime();
          const minutesOutside = Math.floor((currentTime - exitTime) / (1000 * 60));
          
          // Send extended absence alert every 30 minutes
          if (minutesOutside > 15 && minutesOutside % 30 === 0) {
            await this.handleExtendedAbsence(location, minutesOutside, tracking);
          }
        }
      }

      // Update tracking
      this.studentTracking.set(location.studentId, tracking);

    } catch (error) {
      console.error(`[GEOLOCATION_ALERTS] ❌ Error processing location:`, error);
    }
  }

  /**
   * Handle student entering a safe zone
   */
  private async handleZoneEntry(
    location: StudentLocation, 
    zone: SafeZone, 
    tracking: any
  ): Promise<void> {
    console.log(`[GEOLOCATION_ALERTS] ✅ Student ${location.studentId} entered zone "${zone.name}"`);
    
    // Get student and parent info
    const studentInfo = await this.getStudentInfo(location.studentId);
    if (!studentInfo) return;

    await this.notificationService.notifyZoneAlert('zone_entry', {
      childName: studentInfo.name,
      childId: location.studentId,
      parentId: studentInfo.parentId,
      zoneName: zone.name,
      currentLocation: location.address || `${location.latitude}, ${location.longitude}`,
      time: new Date().toLocaleTimeString('fr-FR'),
      teacherIds: studentInfo.teacherIds
    }, 'fr');
  }

  /**
   * Handle student exiting a safe zone
   */
  private async handleZoneExit(
    location: StudentLocation, 
    safeZones: SafeZone[], 
    tracking: any
  ): Promise<void> {
    console.log(`[GEOLOCATION_ALERTS] ⚠️ Student ${location.studentId} exited safe zones`);
    
    // Get student and parent info
    const studentInfo = await this.getStudentInfo(location.studentId);
    if (!studentInfo) return;

    // Find the zone they likely exited from (closest one)
    const closestZone = this.findClosestSafeZone(location, safeZones);
    
    await this.notificationService.notifyZoneAlert('zone_exit', {
      childName: studentInfo.name,
      childId: location.studentId,
      parentId: studentInfo.parentId,
      zoneName: closestZone?.name || 'Zone de sécurité',
      currentLocation: location.address || `${location.latitude}, ${location.longitude}`,
      time: new Date().toLocaleTimeString('fr-FR'),
      teacherIds: studentInfo.teacherIds
    }, 'fr');
  }

  /**
   * Handle extended absence from safe zones
   */
  private async handleExtendedAbsence(
    location: StudentLocation, 
    minutesOutside: number, 
    tracking: any
  ): Promise<void> {
    console.log(`[GEOLOCATION_ALERTS] 🚨 Student ${location.studentId} absent for ${minutesOutside} minutes`);
    
    const studentInfo = await this.getStudentInfo(location.studentId);
    if (!studentInfo) return;

    const duration = minutesOutside < 60 ? 
      `${minutesOutside} minutes` : 
      `${Math.floor(minutesOutside / 60)}h ${minutesOutside % 60}min`;

    await this.notificationService.notifyZoneAlert('extended_absence', {
      childName: studentInfo.name,
      childId: location.studentId,
      parentId: studentInfo.parentId,
      currentLocation: location.address || `${location.latitude}, ${location.longitude}`,
      time: new Date().toLocaleTimeString('fr-FR'),
      duration,
      teacherIds: studentInfo.teacherIds
    }, 'fr');
  }

  /**
   * Check all students' current locations
   */
  private async checkAllStudentLocations(): Promise<void> {
    console.log('[GEOLOCATION_ALERTS] 🔍 Checking all student locations...');
    
    try {
      // Add timeout to prevent hanging with proper error handling
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Location check timeout')), 10000)
      );

      const locationCheckPromise = this.performLocationCheck();
      
      await Promise.race([locationCheckPromise, timeoutPromise]);
    } catch (error) {
      if (error instanceof Error && error.message === 'Location check timeout') {
        console.warn('[GEOLOCATION_ALERTS] ⏰ Location check timed out');
      } else {
        console.error('[GEOLOCATION_ALERTS] ❌ Error checking locations');
      }
    }
  }

  /**
   * Perform the actual location check with proper error handling
   */
  private async performLocationCheck(): Promise<void> {
    // In a real implementation, this would:
    // 1. Query database for all active students with geolocation enabled
    // 2. Get their latest location updates
    // 3. Process each location update
    
    // Mock implementation for demo
    const activeStudents = [15]; // Demo student ID
    
    for (const studentId of activeStudents) {
      try {
        // Simulate location update
        const mockLocation: StudentLocation = {
          studentId,
          latitude: 4.0511 + (Math.random() - 0.5) * 0.01,
          longitude: 9.7679 + (Math.random() - 0.5) * 0.01,
          timestamp: new Date().toISOString(),
          accuracy: 10,
          address: 'Position simulée, Douala'
        };
        
        await this.processLocationUpdate(mockLocation);
      } catch (error) {
        console.error(`[GEOLOCATION_ALERTS] ❌ Error processing location for student ${studentId}`);
        // Continue with other students even if one fails
      }
    }
  }

  /**
   * Utility functions
   */
  private findCurrentSafeZone(location: StudentLocation, safeZones: SafeZone[]): SafeZone | null {
    for (const zone of safeZones.filter(z => z.active)) {
      const distance = this.calculateDistance(
        location.latitude, location.longitude,
        zone.latitude, zone.longitude
      );
      
      if (distance <= zone.radius) {
        return zone;
      }
    }
    return null;
  }

  private findClosestSafeZone(location: StudentLocation, safeZones: SafeZone[]): SafeZone | null {
    if (safeZones.length === 0) return null;
    
    let closest = safeZones[0];
    let minDistance = this.calculateDistance(
      location.latitude, location.longitude,
      closest.latitude, closest.longitude
    );
    
    for (const zone of safeZones.slice(1)) {
      const distance = this.calculateDistance(
        location.latitude, location.longitude,
        zone.latitude, zone.longitude
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closest = zone;
      }
    }
    
    return closest;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private isStudentCurrentlyInSafeZone(studentId: number): boolean {
    const tracking = this.studentTracking.get(studentId);
    return tracking ? !tracking.isOutsideZones : false;
  }

  private async getStudentSafeZones(studentId: number): Promise<SafeZone[]> {
    // Mock safe zones for demo student
    return [
      {
        id: 1,
        name: 'École Primaire Central',
        latitude: 4.0511,
        longitude: 9.7679,
        radius: 200,
        type: 'school',
        active: true,
        studentId,
        parentId: 7,
        createdBy: 7
      },
      {
        id: 2,
        name: 'Maison',
        latitude: 4.0521,
        longitude: 9.7689,
        radius: 100,
        type: 'home',
        active: true,
        studentId,
        parentId: 7,
        createdBy: 7
      }
    ];
  }

  private async getStudentInfo(studentId: number): Promise<{
    name: string;
    parentId: number;
    teacherIds: number[];
  } | null> {
    // Mock student info
    return {
      name: 'Emma Talla',
      parentId: 7,
      teacherIds: [12, 13] // Teacher IDs who should be notified for urgent alerts
    };
  }
}

// Export singleton instance
export const geolocationAlertService = new GeolocationAlertService();
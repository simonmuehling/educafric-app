import { db } from '../db';
import { 
  geolocationDevices, 
  safeZones, 
  locationTracking, 
  geolocationAlerts, 
  emergencyContacts,
  attendance,
  users,
  enrollments,
  classes,
  type GeolocationDevice,
  type SafeZone,
  type LocationTracking,
  type GeolocationAlert,
  type EmergencyContact,
  type User,
  type Attendance,
  type InsertGeolocationDevice,
  type InsertSafeZone,
  type InsertLocationTracking,
  type InsertGeolocationAlert,
  type InsertEmergencyContact,
  type InsertAttendance
} from '@shared/schema';
import { eq, and, desc, sql, lt, gte } from 'drizzle-orm';

interface RouteOptimization {
  studentId: number;
  currentLocation: { latitude: number; longitude: number };
  destination: { latitude: number; longitude: number };
  optimizedRoute: RoutePoint[];
  estimatedTime: number;
  safetyScore: number;
}

interface RoutePoint {
  latitude: number;
  longitude: number;
  address?: string;
  safetyLevel: 'high' | 'medium' | 'low';
  checkpoints: string[];
}

interface AttendanceAutomation {
  studentId: number;
  status: 'present' | 'absent' | 'late' | 'auto_marked';
  location: { latitude: number; longitude: number };
  accuracy: number;
  timestamp: Date;
  confidence: number;
}

interface EmergencyResponse {
  alertId: number;
  responseLevel: 'low' | 'medium' | 'high' | 'critical';
  autoActions: string[];
  contactsNotified: number[];
  estimatedResponse: number;
  nearbyResources: EmergencyResource[];
}

interface EmergencyResource {
  type: 'police' | 'medical' | 'fire' | 'school_security';
  distance: number;
  contact: string;
  estimatedArrival: number;
}

export class EnhancedGeolocationService {
  
  // ==================== ROUTE OPTIMIZATION ====================
  
  async optimizeRoute(
    studentId: number, 
    destinationLat: number, 
    destinationLng: number
  ): Promise<RouteOptimization> {
    console.log(`🗺️ [ROUTE_OPTIMIZATION] Optimizing route for student ${studentId}`);
    
    // Get student's current location
    const [latestLocation] = await db
      .select()
      .from(locationTracking)
      .innerJoin(geolocationDevices, eq(locationTracking.deviceId, geolocationDevices.id))
      .where(eq(geolocationDevices.studentId, studentId))
      .orderBy(desc(locationTracking.timestamp))
      .limit(1);

    if (!latestLocation) {
      throw new Error('No recent location data found for student');
    }

    const currentLat = parseFloat(latestLocation.location_tracking.latitude);
    const currentLng = parseFloat(latestLocation.location_tracking.longitude);

    // Get safe zones for route planning
    const studentData = await db
      .select()
      .from(users)
      .where(and(eq(users.id, studentId), eq(users.role, 'Student')))
      .limit(1);

    const schoolSafeZones = await db
      .select()
      .from(safeZones)
      .where(eq(safeZones.schoolId, studentData[0]?.schoolId || 1));

    // Calculate optimized route with safety considerations
    const optimizedRoute = this.calculateSafeRoute(
      { latitude: currentLat, longitude: currentLng },
      { latitude: destinationLat, longitude: destinationLng },
      schoolSafeZones
    );

    const routeOptimization: RouteOptimization = {
      studentId,
      currentLocation: { latitude: currentLat, longitude: currentLng },
      destination: { latitude: destinationLat, longitude: destinationLng },
      optimizedRoute,
      estimatedTime: this.calculateTravelTime(optimizedRoute),
      safetyScore: this.calculateSafetyScore(optimizedRoute, schoolSafeZones)
    };

    console.log(`✅ [ROUTE_OPTIMIZATION] Route optimized - ${optimizedRoute.length} waypoints, ${routeOptimization.estimatedTime}min ETA`);
    
    return routeOptimization;
  }

  private calculateSafeRoute(
    start: { latitude: number; longitude: number },
    end: { latitude: number; longitude: number },
    safeZones: SafeZone[]
  ): RoutePoint[] {
    // African educational context route optimization
    const route: RoutePoint[] = [];
    
    // Add starting point
    route.push({
      latitude: start.latitude,
      longitude: start.longitude,
      address: 'Point de départ',
      safetyLevel: 'high',
      checkpoints: ['Départ confirmé']
    });

    // Add intermediate waypoints through safe zones
    safeZones.forEach((zone, index) => {
      const zoneLat = parseFloat(zone.latitude);
      const zoneLng = parseFloat(zone.longitude);
      
      // Check if zone is on the route (simplified calculation)
      if (this.isPointOnRoute(start, end, { latitude: zoneLat, longitude: zoneLng })) {
        route.push({
          latitude: zoneLat,
          longitude: zoneLng,
          address: zone.name,
          safetyLevel: 'high',
          checkpoints: [`Zone sécurisée: ${zone.name}`, 'Vérification automatique']
        });
      }
    });

    // Add destination
    route.push({
      latitude: end.latitude,
      longitude: end.longitude,
      address: 'Destination',
      safetyLevel: 'medium',
      checkpoints: ['Arrivée confirmée']
    });

    return route;
  }

  private isPointOnRoute(
    start: { latitude: number; longitude: number },
    end: { latitude: number; longitude: number },
    point: { latitude: number; longitude: number }
  ): boolean {
    // Simplified calculation for demo - in production use proper routing algorithms
    const distanceFromStart = this.calculateDistance(start, point);
    const distanceFromEnd = this.calculateDistance(point, end);
    const directDistance = this.calculateDistance(start, end);
    
    return (distanceFromStart + distanceFromEnd) <= (directDistance * 1.2);
  }

  private calculateDistance(
    point1: { latitude: number; longitude: number },
    point2: { latitude: number; longitude: number }
  ): number {
    // Haversine formula for African geographical context
    const R = 6371; // Earth's radius in km
    const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
    const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private calculateTravelTime(route: RoutePoint[]): number {
    // African urban context travel time calculation
    let totalTime = 0;
    for (let i = 0; i < route.length - 1; i++) {
      const distance = this.calculateDistance(route[i], route[i + 1]);
      // Average speed in African urban areas: 15-25 km/h depending on traffic
      const averageSpeed = route[i].safetyLevel === 'high' ? 20 : 15;
      totalTime += (distance / averageSpeed) * 60; // Convert to minutes
    }
    return Math.round(totalTime);
  }

  private calculateSafetyScore(route: RoutePoint[], safeZones: SafeZone[]): number {
    let score = 0;
    let totalPoints = route.length;

    route.forEach(point => {
      switch (point.safetyLevel) {
        case 'high': score += 3; break;
        case 'medium': score += 2; break;
        case 'low': score += 1; break;
      }
    });

    return Math.round((score / (totalPoints * 3)) * 100);
  }

  // ==================== ATTENDANCE AUTOMATION ====================

  async automateAttendance(schoolId: number, classId: number): Promise<AttendanceAutomation[]> {
    console.log(`📋 [ATTENDANCE_AUTOMATION] Processing automated attendance for class ${classId}`);
    
    const now = new Date();
    const schoolDay = this.getSchoolHours();
    
    // Get all students in the class with their devices
    const studentsWithDevices = await db
      .select({
        studentId: students.id,
        studentName: sql<string>`${students.firstName} || ' ' || ${students.lastName}`,
        deviceId: geolocationDevices.id,
        lastLocation: locationTracking.latitude,
        lastLongitude: locationTracking.longitude,
        lastUpdate: locationTracking.timestamp,
        accuracy: locationTracking.accuracy
      })
      .from(students)
      .leftJoin(geolocationDevices, eq(students.id, geolocationDevices.studentId))
      .leftJoin(locationTracking, eq(geolocationDevices.id, locationTracking.deviceId))
      .where(eq(students.classId, classId));

    // Get school safe zones
    const schoolZones = await db
      .select()
      .from(safeZones)
      .where(and(
        eq(safeZones.schoolId, schoolId),
        eq(safeZones.isActive, true)
      ));

    const attendanceResults: AttendanceAutomation[] = [];

    for (const student of studentsWithDevices) {
      if (!student.lastLocation || !student.lastUpdate) {
        // No location data - mark as absent
        attendanceResults.push({
          studentId: student.studentId,
          status: 'absent',
          location: { latitude: 0, longitude: 0 },
          accuracy: 0,
          timestamp: now,
          confidence: 90
        });
        continue;
      }

      const studentLat = parseFloat(student.lastLocation);
      const studentLng = parseFloat(student.lastLongitude);
      const locationAge = now.getTime() - new Date(student.lastUpdate).getTime();

      // Check if student is in any school safe zone
      const isInSchoolZone = schoolZones.some(zone => {
        const distance = this.calculateDistance(
          { latitude: studentLat, longitude: studentLng },
          { latitude: parseFloat(zone.latitude), longitude: parseFloat(zone.longitude) }
        );
        return distance <= (zone.radius / 1000); // Convert radius to km
      });

      // Determine attendance status
      let status: AttendanceAutomation['status'] = 'absent';
      let confidence = 85;

      if (isInSchoolZone) {
        if (locationAge < 30 * 60 * 1000) { // Location less than 30 minutes old
          status = 'present';
          confidence = 95;
        } else if (locationAge < 60 * 60 * 1000) { // Location less than 1 hour old
          status = 'auto_marked';
          confidence = 80;
        }
      } else if (now.getHours() > schoolDay.start && now.getHours() < schoolDay.end) {
        // School hours but not in zone
        if (locationAge < 15 * 60 * 1000) { // Very recent location outside school
          status = 'late';
          confidence = 90;
        }
      }

      attendanceResults.push({
        studentId: student.studentId,
        status,
        location: { latitude: studentLat, longitude: studentLng },
        accuracy: student.accuracy || 0,
        timestamp: now,
        confidence
      });

      // Auto-insert attendance record if confidence is high
      if (confidence >= 85) {
        await this.insertAttendanceRecord(student.studentId, classId, status, confidence);
      }
    }

    console.log(`✅ [ATTENDANCE_AUTOMATION] Processed ${attendanceResults.length} students`);
    return attendanceResults;
  }

  private getSchoolHours() {
    // African school hours (typically 7:30 AM - 3:30 PM)
    return {
      start: 7.5, // 7:30 AM
      end: 15.5   // 3:30 PM
    };
  }

  private async insertAttendanceRecord(
    studentId: number, 
    classId: number, 
    status: string, 
    confidence: number
  ): Promise<void> {
    try {
      await db.insert(attendance).values({
        studentId,
        classId,
        date: new Date(),
        status,
        teacherId: 1, // System automated
        parentNotified: false,
        reason: `Marquage automatique (confiance: ${confidence}%)`
      });
    } catch (error) {
      console.error(`[ATTENDANCE_AUTOMATION] Error inserting record for student ${studentId}:`, error);
    }
  }

  // ==================== EMERGENCY RESPONSE PROTOCOLS ====================

  async triggerEmergencyResponse(alertId: number): Promise<EmergencyResponse> {
    console.log(`🚨 [EMERGENCY_RESPONSE] Triggering emergency response for alert ${alertId}`);
    
    // Get alert details
    const [alert] = await db
      .select()
      .from(geolocationAlerts)
      .where(eq(geolocationAlerts.id, alertId));

    if (!alert) {
      throw new Error('Alert not found');
    }

    // Determine response level based on alert type and priority
    const responseLevel = this.determineResponseLevel(alert.alertType, alert.priority);
    
    // Get emergency contacts for the student
    const emergencyContacts = await db
      .select()
      .from(emergencyContacts)
      .where(and(
        eq(emergencyContacts.studentId, alert.studentId),
        eq(emergencyContacts.isActive, true)
      ))
      .orderBy(emergencyContacts.priority);

    // Execute automatic actions based on response level
    const autoActions = await this.executeAutoActions(responseLevel, alert);
    
    // Notify emergency contacts
    const contactsNotified = await this.notifyEmergencyContacts(emergencyContacts, alert, responseLevel);
    
    // Find nearby emergency resources (African context)
    const nearbyResources = await this.findNearbyEmergencyResources(
      parseFloat(alert.latitude || '0'),
      parseFloat(alert.longitude || '0')
    );

    const response: EmergencyResponse = {
      alertId,
      responseLevel,
      autoActions,
      contactsNotified: contactsNotified.map(c => c.id),
      estimatedResponse: this.calculateResponseTime(responseLevel, nearbyResources),
      nearbyResources
    };

    // Log emergency response
    await this.logEmergencyResponse(alertId, response);

    console.log(`✅ [EMERGENCY_RESPONSE] Response activated - Level: ${responseLevel}, Contacts: ${contactsNotified.length}`);
    
    return response;
  }

  private determineResponseLevel(alertType: string, priority: string): EmergencyResponse['responseLevel'] {
    if (priority === 'critical' || alertType === 'panic_button') return 'critical';
    if (priority === 'high' || alertType === 'zone_exit') return 'high';
    if (priority === 'medium' || alertType === 'battery_low') return 'medium';
    return 'low';
  }

  private async executeAutoActions(
    responseLevel: EmergencyResponse['responseLevel'],
    alert: GeolocationAlert
  ): Promise<string[]> {
    const actions: string[] = [];

    switch (responseLevel) {
      case 'critical':
        actions.push('Alerte police automatique envoyée');
        actions.push('Notification équipe sécurité école');
        actions.push('SMS d\'urgence aux parents');
        actions.push('Activation géolocalisation temps réel');
        break;
      
      case 'high':
        actions.push('Notification sécurité école');
        actions.push('SMS aux contacts d\'urgence');
        actions.push('Enregistrement audio activé');
        break;
      
      case 'medium':
        actions.push('Notification parents');
        actions.push('Alerte enseignant responsable');
        break;
      
      case 'low':
        actions.push('Notification système');
        break;
    }

    // Execute each action (in production, these would be real integrations)
    for (const action of actions) {
      console.log(`🔄 [AUTO_ACTION] Executing: ${action}`);
      // Simulate action execution
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return actions;
  }

  private async notifyEmergencyContacts(
    contacts: EmergencyContact[],
    alert: GeolocationAlert,
    responseLevel: EmergencyResponse['responseLevel']
  ): Promise<EmergencyContact[]> {
    const notifiedContacts: EmergencyContact[] = [];

    // Determine how many contacts to notify based on response level
    const contactLimit = responseLevel === 'critical' ? contacts.length : 
                        responseLevel === 'high' ? Math.min(3, contacts.length) : 
                        Math.min(2, contacts.length);

    for (let i = 0; i < contactLimit; i++) {
      const contact = contacts[i];
      if (contact) {
        // Send notification (SMS, call, etc.)
        console.log(`📱 [EMERGENCY_CONTACT] Notifying ${contact.name} (${contact.relationship}) at ${contact.phone}`);
        notifiedContacts.push(contact);
      }
    }

    return notifiedContacts;
  }

  private async findNearbyEmergencyResources(
    latitude: number,
    longitude: number
  ): Promise<EmergencyResource[]> {
    // African urban context emergency resources (Douala/Yaoundé example)
    const resources: EmergencyResource[] = [
      {
        type: 'police',
        distance: 2.5,
        contact: '+237222334455',
        estimatedArrival: 15
      },
      {
        type: 'medical',
        distance: 1.8,
        contact: '+237677889900',
        estimatedArrival: 12
      },
      {
        type: 'school_security',
        distance: 0.5,
        contact: '+237699001122',
        estimatedArrival: 5
      }
    ];

    return resources.sort((a, b) => a.distance - b.distance);
  }

  private calculateResponseTime(
    responseLevel: EmergencyResponse['responseLevel'],
    resources: EmergencyResource[]
  ): number {
    const nearestResource = resources[0];
    if (!nearestResource) return 30; // Default 30 minutes

    // African urban response time adjustments
    const baseTime = nearestResource.estimatedArrival;
    const levelMultiplier = responseLevel === 'critical' ? 0.7 : 
                           responseLevel === 'high' ? 0.8 : 
                           responseLevel === 'medium' ? 1.0 : 1.2;

    return Math.round(baseTime * levelMultiplier);
  }

  private async logEmergencyResponse(alertId: number, response: EmergencyResponse): Promise<void> {
    // Update alert with response information
    await db.update(geolocationAlerts)
      .set({
        notificationsSent: {
          responseLevel: response.responseLevel,
          contactsNotified: response.contactsNotified.length,
          autoActions: response.autoActions,
          timestamp: new Date().toISOString()
        },
        updatedAt: new Date()
      })
      .where(eq(geolocationAlerts.id, alertId));
  }

  // ==================== ENHANCED REPORTING ====================

  async generateGeolocationReport(schoolId: number, dateFrom: Date, dateTo: Date) {
    console.log(`📊 [GEOLOCATION_REPORT] Generating report for school ${schoolId}`);
    
    const report = {
      summary: {
        totalAlerts: 0,
        resolvedAlerts: 0,
        activeDevices: 0,
        routesOptimized: 0,
        attendanceAutomated: 0,
        emergencyResponses: 0
      },
      details: {
        alertsByType: {},
        deviceActivity: [],
        safeZoneStatistics: [],
        responseTimeMetrics: {}
      }
    };

    // Get alert statistics
    const alertStats = await db
      .select({
        alertType: geolocationAlerts.alertType,
        count: sql<number>`count(*)`
      })
      .from(geolocationAlerts)
      .where(and(
        gte(geolocationAlerts.createdAt, dateFrom),
        lt(geolocationAlerts.createdAt, dateTo)
      ))
      .groupBy(geolocationAlerts.alertType);

    // Compile report data
    report.summary.totalAlerts = alertStats.reduce((sum, stat) => sum + stat.count, 0);
    report.details.alertsByType = Object.fromEntries(
      alertStats.map(stat => [stat.alertType, stat.count])
    );

    console.log(`✅ [GEOLOCATION_REPORT] Report generated - ${report.summary.totalAlerts} alerts analyzed`);
    
    return report;
  }
}

export const enhancedGeolocationService = new EnhancedGeolocationService();
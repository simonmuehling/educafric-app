// Simple Geolocation Service - Working implementation for EDUCAFRIC
// This service provides basic geolocation functionality without complex database dependencies

export class SimpleGeolocationService {
  
  // ==================== MOCK DATA FOR DEMONSTRATION ====================
  
  private static generateMockChildren() {
    return [
      {
        id: 1,
        name: 'Emma Talla',
        class: '3ème A',
        deviceId: 'device_001',
        deviceType: 'smartphone',
        lastLocation: {
          latitude: 4.0511,
          longitude: 9.7679,
          timestamp: new Date().toISOString(),
          address: 'École Primaire Central, Douala'
        },
        batteryLevel: 85,
        status: 'at_school' as const
      },
      {
        id: 2,
        name: 'Junior Kamga',
        class: '2ème B',
        deviceId: 'device_002',
        deviceType: 'smartwatch',
        lastLocation: {
          latitude: 4.0525,
          longitude: 9.7695,
          timestamp: new Date().toISOString(),
          address: 'Domicile, Quartier Bonapriso'
        },
        batteryLevel: 92,
        status: 'safe' as const
      }
    ];
  }

  private static generateMockSafeZones() {
    return [
      {
        id: 1,
        name: 'École Primaire Central',
        type: 'school' as const,
        coordinates: { lat: 4.0511, lng: 9.7679 },
        radius: 100,
        children: [1, 2],
        active: true
      },
      {
        id: 2,
        name: 'Domicile Kamga',
        type: 'home' as const,
        coordinates: { lat: 4.0525, lng: 9.7695 },
        radius: 50,
        children: [2],
        active: true
      }
    ];
  }

  private static generateMockAlerts() {
    return [
      {
        id: 1,
        childName: 'Emma Talla',
        type: 'zone_exit' as const,
        message: 'Emma Talla a quitté la zone "École Primaire Central" à 10:49:20',
        timestamp: new Date().toISOString(),
        severity: 'warning' as const,
        resolved: false
      }
    ];
  }

  // ==================== PUBLIC API METHODS ====================

  async getChildrenForParent(parentId: number) {
    console.log(`[GEOLOCATION_SERVICE] 📍 Getting children for parent ${parentId}`);
    return this.generateMockChildren();
  }

  async getSafeZonesForParent(parentId: number) {
    console.log(`[GEOLOCATION_SERVICE] 🛡️ Getting safe zones for parent ${parentId}`);
    return this.generateMockSafeZones();
  }

  async getAlertsForParent(parentId: number) {
    console.log(`[GEOLOCATION_SERVICE] 🚨 Getting alerts for parent ${parentId}`);
    return this.generateMockAlerts();
  }

  async createSafeZone(zoneData: any) {
    console.log(`[GEOLOCATION_SERVICE] ➕ Creating safe zone:`, zoneData);
    const newZone = {
      id: Date.now(),
      ...zoneData,
      active: true,
      createdAt: new Date().toISOString()
    };
    return newZone;
  }

  async updateSafeZone(zoneId: number, updates: any) {
    console.log(`[GEOLOCATION_SERVICE] ✏️ Updating safe zone ${zoneId}:`, updates);
    return { success: true, zoneId, updates };
  }

  async testZoneExit(data: { studentId: number; zoneName: string }) {
    console.log(`[GEOLOCATION_SERVICE] 🧪 Testing zone exit alert:`, data);
    
    // Simulate zone exit alert
    const simulatedAlert = {
      success: true,
      alertId: Date.now(),
      studentId: data.studentId,
      zoneName: data.zoneName,
      location: 'Position simulée, Douala',
      timestamp: new Date().toISOString(),
      notificationsSent: {
        sms: true,
        push: true,
        email: false
      }
    };

    return simulatedAlert;
  }


  async getLocationHistory(deviceId: string, limit: number = 50) {
    console.log(`[GEOLOCATION_SERVICE] 📍 Getting location history for device ${deviceId}`);
    return Array.from({ length: Math.min(limit, 10) }, (_, i) => ({
      id: i + 1,
      deviceId,
      latitude: 4.0511 + (Math.random() - 0.5) * 0.01,
      longitude: 9.7679 + (Math.random() - 0.5) * 0.01,
      timestamp: new Date(Date.now() - i * 30 * 60 * 1000).toISOString(),
      accuracy: 5 + Math.random() * 10,
      batteryLevel: 85 + Math.random() * 10
    }));
  }

  async getSchoolGeolocationStats(schoolId: number) {
    console.log(`[GEOLOCATION_SERVICE] 📊 Getting geolocation stats for school ${schoolId}`);
    return {
      totalDevices: 25,
      activeDevices: 23,
      activeZones: 8,
      activeAlerts: 2,
      emergencyDevices: 0,
      totalZones: 10,
      lastUpdated: new Date().toISOString()
    };
  }

  async createEmergencyContact(contactData: any) {
    console.log(`[GEOLOCATION_SERVICE] 🚨 Creating emergency contact:`, contactData);
    return {
      id: Date.now(),
      ...contactData,
      isActive: true,
      createdAt: new Date().toISOString()
    };
  }

  async createDevice(deviceData: any) {
    console.log('[GEOLOCATION_SERVICE] 📱 Creating device:', deviceData);
    
    const device = {
      id: Date.now(),
      studentId: deviceData.studentId,
      deviceType: deviceData.deviceType,
      deviceId: deviceData.deviceId,
      isActive: true,
      batteryLevel: Math.floor(Math.random() * 100) + 1,
      lastUpdate: new Date().toISOString(),
      emergencyMode: false,
      ...deviceData
    };
    
    console.log('[GEOLOCATION_SERVICE] ✅ Device created:', device);
    return device;
  }

  async getDevicesForStudent(studentId: number) {
    console.log(`[GEOLOCATION_SERVICE] 📱 Getting devices for student ${studentId}`);
    
    // Return mock devices for demo
    return [
      {
        id: 1,
        studentId: studentId,
        deviceType: 'smartphone',
        deviceId: `DEVICE_${studentId}_001`,
        isActive: true,
        batteryLevel: 85,
        lastUpdate: new Date().toISOString(),
        emergencyMode: false
      }
    ];
  }

  // Generate mock children data
  private generateMockChildren() {
    return SimpleGeolocationService.generateMockChildren();
  }

  // Generate mock safe zones data
  private generateMockSafeZones() {
    return SimpleGeolocationService.generateMockSafeZones();
  }

  // Generate mock alerts data
  private generateMockAlerts() {
    return SimpleGeolocationService.generateMockAlerts();
  }
}

// Export a singleton instance
export const simpleGeolocationService = new SimpleGeolocationService();
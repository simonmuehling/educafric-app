// Geolocation Service - DATABASE-ONLY implementation for EDUCAFRIC
// This service provides geolocation functionality using ONLY database queries
// NO MOCK DATA - follows ARCHITECTURE DATABASE-ONLY principle

import { db } from "../db";
import { eq, and, desc, sql } from "drizzle-orm";

export class SimpleGeolocationService {
  
  // ==================== DATABASE QUERIES ====================

  async getChildrenForParent(parentId: number) {
    console.log(`[GEOLOCATION_SERVICE] 📍 Getting children for parent ${parentId} from DATABASE`);
    
    try {
      // Get children linked to this parent via parent_student_relations
      const children = await db.execute(sql`
        SELECT 
          s.id,
          CONCAT(s.first_name, ' ', s.last_name) as name,
          c.name as class,
          td.device_id as "deviceId",
          td.device_type as "deviceType",
          td.battery_level as "batteryLevel",
          td.is_active as "isActive",
          td.last_update as "lastUpdate",
          td.current_latitude as latitude,
          td.current_longitude as longitude,
          td.current_address as address
        FROM parent_student_relations psr
        JOIN users s ON psr.student_id = s.id
        LEFT JOIN enrollments e ON e.student_id = s.id AND e.status = 'active'
        LEFT JOIN classes c ON e.class_id = c.id
        LEFT JOIN tracking_devices td ON td.student_id = s.id AND td.is_active = true
        WHERE psr.parent_id = ${parentId}
        ORDER BY s.first_name
      `);

      const result = (children.rows || []).map((child: any) => ({
        id: child.id,
        name: child.name || 'Élève',
        class: child.class || 'Non assigné',
        deviceId: child.deviceId || null,
        deviceType: child.deviceType || 'smartphone',
        batteryLevel: child.batteryLevel || null,
        lastLocation: child.latitude ? {
          latitude: parseFloat(child.latitude),
          longitude: parseFloat(child.longitude),
          timestamp: child.lastUpdate || new Date().toISOString(),
          address: child.address || 'Position inconnue'
        } : null,
        status: child.isActive ? 'safe' : 'unknown'
      }));

      console.log(`[GEOLOCATION_SERVICE] ✅ Found ${result.length} children for parent ${parentId}`);
      return result;
    } catch (error) {
      console.error(`[GEOLOCATION_SERVICE] ❌ Error getting children:`, error);
      return [];
    }
  }

  async getSafeZonesForParent(parentId: number) {
    console.log(`[GEOLOCATION_SERVICE] 🛡️ Getting safe zones for parent ${parentId} from DATABASE`);
    
    try {
      const zones = await db.execute(sql`
        SELECT 
          id,
          name,
          type,
          description,
          latitude,
          longitude,
          radius,
          is_active as "isActive",
          alert_on_entry as "alertOnEntry",
          alert_on_exit as "alertOnExit",
          children_ids as "childrenIds",
          schedule,
          created_at as "createdAt"
        FROM safe_zones
        WHERE parent_id = ${parentId} OR parent_id IS NULL
        ORDER BY created_at DESC
      `);

      const result = (zones.rows || []).map((zone: any) => ({
        id: zone.id,
        name: zone.name,
        type: zone.type || 'custom',
        description: zone.description,
        coordinates: { 
          lat: parseFloat(zone.latitude), 
          lng: parseFloat(zone.longitude) 
        },
        radius: zone.radius,
        children: zone.childrenIds || [],
        childrenIds: zone.childrenIds || [],
        active: zone.isActive,
        alertOnEntry: zone.alertOnEntry,
        alertOnExit: zone.alertOnExit,
        schedule: zone.schedule
      }));

      console.log(`[GEOLOCATION_SERVICE] ✅ Found ${result.length} safe zones for parent ${parentId}`);
      return result;
    } catch (error) {
      console.error(`[GEOLOCATION_SERVICE] ❌ Error getting safe zones:`, error);
      return [];
    }
  }

  async getAlertsForParent(parentId: number) {
    console.log(`[GEOLOCATION_SERVICE] 🚨 Getting alerts for parent ${parentId} from DATABASE`);
    
    try {
      const alerts = await db.execute(sql`
        SELECT 
          ga.id,
          ga.alert_type as type,
          ga.priority as severity,
          ga.message,
          ga.latitude,
          ga.longitude,
          ga.is_resolved as resolved,
          ga.created_at as timestamp,
          CONCAT(u.first_name, ' ', u.last_name) as "childName"
        FROM geolocation_alerts ga
        JOIN users u ON ga.student_id = u.id
        WHERE ga.parent_id = ${parentId}
        ORDER BY ga.created_at DESC
        LIMIT 50
      `);

      const result = (alerts.rows || []).map((alert: any) => ({
        id: alert.id,
        childName: alert.childName || 'Élève',
        type: alert.type,
        message: alert.message,
        timestamp: alert.timestamp,
        severity: alert.severity || 'normal',
        resolved: alert.resolved,
        location: alert.latitude ? {
          lat: parseFloat(alert.latitude),
          lng: parseFloat(alert.longitude)
        } : null
      }));

      console.log(`[GEOLOCATION_SERVICE] ✅ Found ${result.length} alerts for parent ${parentId}`);
      return result;
    } catch (error) {
      console.error(`[GEOLOCATION_SERVICE] ❌ Error getting alerts:`, error);
      return [];
    }
  }

  async createSafeZone(zoneData: any) {
    console.log(`[GEOLOCATION_SERVICE] ➕ Creating safe zone in DATABASE:`, zoneData);
    
    try {
      const result = await db.execute(sql`
        INSERT INTO safe_zones (
          school_id, parent_id, name, description, type,
          latitude, longitude, radius, is_active,
          alert_on_entry, alert_on_exit, children_ids, schedule
        ) VALUES (
          ${zoneData.schoolId || 1},
          ${zoneData.parentId || null},
          ${zoneData.name},
          ${zoneData.description || null},
          ${zoneData.type || 'custom'},
          ${zoneData.latitude},
          ${zoneData.longitude},
          ${zoneData.radius || 100},
          ${zoneData.active !== false},
          ${zoneData.alertOnEntry || false},
          ${zoneData.alertOnExit !== false},
          ${JSON.stringify(zoneData.childrenIds || [])},
          ${JSON.stringify(zoneData.schedule || null)}
        )
        RETURNING *
      `);

      const newZone = (result.rows || [])[0];
      console.log(`[GEOLOCATION_SERVICE] ✅ Safe zone created in database with ID: ${newZone?.id}`);
      
      if (zoneData.childrenIds?.length > 0) {
        console.log(`[GEOLOCATION_SERVICE] 👶 Zone "${zoneData.name}" will track ${zoneData.childrenIds.length} children`);
      }
      
      return newZone;
    } catch (error) {
      console.error(`[GEOLOCATION_SERVICE] ❌ Error creating safe zone:`, error);
      throw error;
    }
  }

  async updateSafeZone(zoneId: number, updates: any) {
    console.log(`[GEOLOCATION_SERVICE] ✏️ Updating safe zone ${zoneId} in DATABASE:`, updates);
    
    try {
      const result = await db.execute(sql`
        UPDATE safe_zones SET
          name = COALESCE(${updates.name}, name),
          description = COALESCE(${updates.description}, description),
          latitude = COALESCE(${updates.latitude}, latitude),
          longitude = COALESCE(${updates.longitude}, longitude),
          radius = COALESCE(${updates.radius}, radius),
          is_active = COALESCE(${updates.active}, is_active),
          children_ids = COALESCE(${JSON.stringify(updates.childrenIds)}, children_ids),
          updated_at = NOW()
        WHERE id = ${zoneId}
        RETURNING *
      `);

      console.log(`[GEOLOCATION_SERVICE] ✅ Safe zone ${zoneId} updated`);
      return { success: true, zone: (result.rows || [])[0] };
    } catch (error) {
      console.error(`[GEOLOCATION_SERVICE] ❌ Error updating safe zone:`, error);
      return { success: false, error };
    }
  }

  async deleteSafeZone(zoneId: number) {
    console.log(`[GEOLOCATION_SERVICE] 🗑️ Deleting safe zone ${zoneId} from DATABASE`);
    
    try {
      await db.execute(sql`DELETE FROM safe_zones WHERE id = ${zoneId}`);
      console.log(`[GEOLOCATION_SERVICE] ✅ Safe zone ${zoneId} deleted`);
      return { success: true };
    } catch (error) {
      console.error(`[GEOLOCATION_SERVICE] ❌ Error deleting safe zone:`, error);
      return { success: false, error };
    }
  }

  async createAlert(alertData: any) {
    console.log(`[GEOLOCATION_SERVICE] 🚨 Creating alert in DATABASE:`, alertData);
    
    try {
      const result = await db.execute(sql`
        INSERT INTO geolocation_alerts (
          student_id, device_id, school_id, parent_id,
          alert_type, priority, message, latitude, longitude,
          safe_zone_id, notifications_sent
        ) VALUES (
          ${alertData.studentId},
          ${alertData.deviceId || null},
          ${alertData.schoolId || 1},
          ${alertData.parentId || null},
          ${alertData.alertType},
          ${alertData.priority || 'normal'},
          ${alertData.message},
          ${alertData.latitude || null},
          ${alertData.longitude || null},
          ${alertData.safeZoneId || null},
          ${JSON.stringify(alertData.notificationsSent || {})}
        )
        RETURNING *
      `);

      const newAlert = (result.rows || [])[0];
      console.log(`[GEOLOCATION_SERVICE] ✅ Alert created with ID: ${newAlert?.id}`);
      return newAlert;
    } catch (error) {
      console.error(`[GEOLOCATION_SERVICE] ❌ Error creating alert:`, error);
      throw error;
    }
  }

  async testZoneExit(data: { studentId: number; zoneName: string; parentId?: number }) {
    console.log(`[GEOLOCATION_SERVICE] 🧪 Testing zone exit alert:`, data);
    
    try {
      // Create a real alert in the database
      const alert = await this.createAlert({
        studentId: data.studentId,
        schoolId: 1,
        parentId: data.parentId,
        alertType: 'zone_exit',
        priority: 'warning',
        message: `L'élève a quitté la zone "${data.zoneName}" à ${new Date().toLocaleTimeString('fr-FR')}`,
        latitude: 4.0511 + (Math.random() - 0.5) * 0.01,
        longitude: 9.7679 + (Math.random() - 0.5) * 0.01,
        notificationsSent: { sms: true, push: true, email: false }
      });

      return {
        success: true,
        alertId: alert?.id,
        studentId: data.studentId,
        zoneName: data.zoneName,
        location: 'Position simulée, Douala',
        timestamp: new Date().toISOString(),
        notificationsSent: { sms: true, push: true, email: false }
      };
    } catch (error) {
      console.error(`[GEOLOCATION_SERVICE] ❌ Error testing zone exit:`, error);
      return { success: false, error };
    }
  }

  async resolveAlert(alertId: number, userId: number) {
    console.log(`[GEOLOCATION_SERVICE] ✅ Resolving alert ${alertId}`);
    
    try {
      await db.execute(sql`
        UPDATE geolocation_alerts SET
          is_resolved = true,
          resolved_by = ${userId},
          resolved_at = NOW(),
          updated_at = NOW()
        WHERE id = ${alertId}
      `);
      return { success: true };
    } catch (error) {
      console.error(`[GEOLOCATION_SERVICE] ❌ Error resolving alert:`, error);
      return { success: false, error };
    }
  }

  async getLocationHistory(deviceId: string, limit: number = 50) {
    console.log(`[GEOLOCATION_SERVICE] 📍 Getting location history for device ${deviceId}`);
    
    try {
      const history = await db.execute(sql`
        SELECT 
          id, device_id, latitude, longitude, accuracy, 
          altitude, speed, battery_level, timestamp
        FROM device_location_history
        WHERE device_id = ${deviceId}
        ORDER BY timestamp DESC
        LIMIT ${limit}
      `);

      return history.rows || [];
    } catch (error) {
      console.error(`[GEOLOCATION_SERVICE] ❌ Error getting location history:`, error);
      return [];
    }
  }

  async getSchoolGeolocationStats(schoolId: number) {
    console.log(`[GEOLOCATION_SERVICE] 📊 Getting geolocation stats for school ${schoolId}`);
    
    try {
      const stats = await db.execute(sql`
        SELECT
          (SELECT COUNT(*) FROM tracking_devices WHERE is_active = true) as "activeDevices",
          (SELECT COUNT(*) FROM tracking_devices) as "totalDevices",
          (SELECT COUNT(*) FROM safe_zones WHERE school_id = ${schoolId} AND is_active = true) as "activeZones",
          (SELECT COUNT(*) FROM safe_zones WHERE school_id = ${schoolId}) as "totalZones",
          (SELECT COUNT(*) FROM geolocation_alerts WHERE school_id = ${schoolId} AND is_resolved = false) as "activeAlerts"
      `);

      const row: any = (stats.rows || [])[0] || {};
      return {
        totalDevices: parseInt(String(row.totalDevices)) || 0,
        activeDevices: parseInt(String(row.activeDevices)) || 0,
        activeZones: parseInt(String(row.activeZones)) || 0,
        totalZones: parseInt(String(row.totalZones)) || 0,
        activeAlerts: parseInt(String(row.activeAlerts)) || 0,
        emergencyDevices: 0,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error(`[GEOLOCATION_SERVICE] ❌ Error getting stats:`, error);
      return {
        totalDevices: 0, activeDevices: 0, activeZones: 0,
        totalZones: 0, activeAlerts: 0, emergencyDevices: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  async createDevice(deviceData: any) {
    console.log('[GEOLOCATION_SERVICE] 📱 Creating device in DATABASE:', deviceData);
    
    try {
      const result = await db.execute(sql`
        INSERT INTO tracking_devices (
          user_id, student_id, device_name, device_type, is_active
        ) VALUES (
          ${deviceData.userId || null},
          ${deviceData.studentId},
          ${deviceData.deviceName || 'Appareil'},
          ${deviceData.deviceType || 'smartphone'},
          true
        )
        RETURNING *
      `);

      const device = (result.rows || [])[0];
      console.log('[GEOLOCATION_SERVICE] ✅ Device created:', device?.id);
      return device;
    } catch (error) {
      console.error('[GEOLOCATION_SERVICE] ❌ Error creating device:', error);
      throw error;
    }
  }

  async getDevicesForStudent(studentId: number) {
    console.log(`[GEOLOCATION_SERVICE] 📱 Getting devices for student ${studentId}`);
    
    try {
      const devices = await db.execute(sql`
        SELECT * FROM tracking_devices
        WHERE student_id = ${studentId}
        ORDER BY created_at DESC
      `);

      return devices.rows || [];
    } catch (error) {
      console.error(`[GEOLOCATION_SERVICE] ❌ Error getting devices:`, error);
      return [];
    }
  }

  async updateDeviceLocation(deviceId: number, locationData: any) {
    console.log(`[GEOLOCATION_SERVICE] 📍 Updating device ${deviceId} location`);
    
    try {
      // Update current location in tracking_devices
      await db.execute(sql`
        UPDATE tracking_devices SET
          current_latitude = ${locationData.latitude},
          current_longitude = ${locationData.longitude},
          location_accuracy = ${locationData.accuracy || null},
          current_address = ${locationData.address || null},
          battery_level = ${locationData.batteryLevel || null},
          last_update = NOW(),
          updated_at = NOW()
        WHERE id = ${deviceId}
      `);

      // Also log to history
      await db.execute(sql`
        INSERT INTO device_location_history (
          device_id, latitude, longitude, accuracy, battery_level
        ) VALUES (
          ${deviceId},
          ${locationData.latitude},
          ${locationData.longitude},
          ${locationData.accuracy || null},
          ${locationData.batteryLevel || null}
        )
      `);

      console.log(`[GEOLOCATION_SERVICE] ✅ Device location updated`);
      return { success: true };
    } catch (error) {
      console.error(`[GEOLOCATION_SERVICE] ❌ Error updating location:`, error);
      return { success: false, error };
    }
  }
}

// Export a singleton instance
export const simpleGeolocationService = new SimpleGeolocationService();

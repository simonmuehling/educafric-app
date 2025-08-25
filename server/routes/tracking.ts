import type { Express } from "express";
import { nanoid } from "nanoid";
import { db } from "../db";
import { trackingDevices, geofenceViolations, emergencyAlerts, deviceLocationHistory, zoneStatus } from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";

function registerTrackingRoutes(app: Express) {
  // Register a new device
  app.post("/api/tracking/devices", async (req, res) => {
    try {
      const deviceData = {
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const [device] = await db.insert(trackingDevices).values(deviceData).returning();
      res.json(device);
    } catch (error) {
      console.error("Failed to register device:", error);
      res.status(500).json({ message: "Failed to register device" });
    }
  });

  // Get device by ID
  app.get("/api/tracking/devices/:deviceId", async (req, res) => {
    try {
      const { deviceId } = req.params;
      const [device] = await db.select().from(trackingDevices).where(eq(trackingDevices.id, parseInt(deviceId)));
      
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }

      // Get safe zones for this device
      const zones = await db.select().from(geofenceViolations).where(eq(geofenceViolations.deviceId, parseInt(deviceId)));
      
      res.json({
        ...device,
        geofenceViolations: zones,
        currentLocation: device.currentLatitude && device.currentLongitude ? {
          latitude: parseFloat(device.currentLatitude),
          longitude: parseFloat(device.currentLongitude),
          accuracy: parseFloat(device.locationAccuracy || "0"),
          address: device.currentAddress,
          timestamp: device.lastSeen?.getTime() || Date.now()
        } : null
      });
    } catch (error) {
      console.error("Failed to get device:", error);
      res.status(500).json({ message: "Failed to get device" });
    }
  });

  // Get all devices for a student
  app.get("/api/tracking/students/:studentId/devices", async (req, res) => {
    try {
      const { studentId } = req.params;
      const devices = await db.select().from(trackingDevices)
        .where(eq(trackingDevices.studentId, parseInt(studentId)));

      // Get safe zones for all devices
      const deviceIds = devices.map(d => d.id);
      const zones = deviceIds.length > 0 
        ? await db.select().from(geofenceViolations).where(sql`${geofenceViolations.deviceId} = ANY(${deviceIds})`)
        : [];

      const devicesWithZones = devices.map(device => ({
        ...device,
        geofenceViolations: zones.filter(z => z.deviceId === device.id),
        currentLocation: device.currentLatitude && device.currentLongitude ? {
          latitude: parseFloat(device.currentLatitude),
          longitude: parseFloat(device.currentLongitude),
          accuracy: parseFloat(device.locationAccuracy || "0"),
          address: device.currentAddress,
          timestamp: device.lastSeen?.getTime() || Date.now()
        } : null
      }));

      res.json(devicesWithZones);
    } catch (error) {
      console.error("Failed to get student devices:", error);
      res.status(500).json({ message: "Failed to get student devices" });
    }
  });

  // Get all devices a parent can monitor
  app.get("/api/tracking/parents/:parentId/devices", async (req, res) => {
    try {
      const { parentId } = req.params;
      
      // Get all students this parent is responsible for
      // This would need to be implemented based on your parent-student relationship model
      // For now, we'll return devices for students linked to this parent
      const devices = await db.select({
        device: trackingDevices,
      })
      .from(trackingDevices)
      .innerJoin(
        sql`(SELECT student_id FROM parent_student_relations WHERE parent_id = ${parentId})`,
        sql`${trackingDevices.studentId} = student_id`
      );

      // Get safe zones for all devices
      const deviceIds = devices.map(d => d.device.id);
      const zones = deviceIds.length > 0 
        ? await db.select().from(geofenceViolations).where(sql`${geofenceViolations.deviceId} = ANY(${deviceIds})`)
        : [];

      const devicesWithZones = devices.map(({ device }) => ({
        ...device,
        geofenceViolations: zones.filter(z => z.deviceId === device.id),
        currentLocation: device.currentLatitude && device.currentLongitude ? {
          latitude: parseFloat(device.currentLatitude),
          longitude: parseFloat(device.currentLongitude),
          accuracy: parseFloat(device.locationAccuracy || "0"),
          address: device.currentAddress,
          timestamp: device.lastSeen?.getTime() || Date.now()
        } : null
      }));

      res.json(devicesWithZones);
    } catch (error) {
      console.error("Failed to get parent devices:", error);
      res.status(500).json({ message: "Failed to get parent devices" });
    }
  });

  // Update device location
  app.post("/api/tracking/devices/:deviceId/location", async (req, res) => {
    try {
      const { deviceId } = req.params;
      const { latitude, longitude, accuracy, address, batteryLevel, speed } = req.body;

      // Update device current location
      await db.update(trackingDevices)
        .set({
          currentLatitude: latitude.toString(),
          currentLongitude: longitude.toString(),
          locationAccuracy: accuracy?.toString(),
          currentAddress: address,
          batteryLevel: batteryLevel,
          lastSeen: new Date(),
          updatedAt: new Date()
        })
        .where(eq(trackingDevices.id, deviceId));

      // Add to location history
      await db.insert(deviceLocationHistory).values({
        deviceId,
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        accuracy: accuracy?.toString(),
        address,
        batteryLevel,
        speed: speed?.toString(),
        timestamp: new Date()
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Failed to update device location:", error);
      res.status(500).json({ message: "Failed to update device location" });
    }
  });

  // Update device tracking settings
  app.patch("/api/tracking/devices/:deviceId/settings", async (req, res) => {
    try {
      const { deviceId } = req.params;
      const settings = req.body;

      await db.update(trackingDevices)
        .set({
          trackingSettings: settings,
          updatedAt: new Date()
        })
        .where(eq(trackingDevices.id, deviceId));

      res.json({ success: true });
    } catch (error) {
      console.error("Failed to update tracking settings:", error);
      res.status(500).json({ message: "Failed to update tracking settings" });
    }
  });

  // Add safe zone
  app.post("/api/tracking/devices/:deviceId/safe-zones", async (req, res) => {
    try {
      const { deviceId } = req.params;
      const zoneData = {
        id: nanoid(),
        deviceId,
        ...req.body,
        createdAt: new Date()
      };

      const [zone] = await db.insert(geofenceViolations).values(zoneData).returning();
      res.json(zone);
    } catch (error) {
      console.error("Failed to add safe zone:", error);
      res.status(500).json({ message: "Failed to add safe zone" });
    }
  });

  // Create location alert
  app.post("/api/tracking/alerts", async (req, res) => {
    try {
      const alertData = {
        id: nanoid(),
        ...req.body
      };

      const [alert] = await db.insert(emergencyAlerts).values(alertData).returning();
      res.json(alert);
    } catch (error) {
      console.error("Failed to create alert:", error);
      res.status(500).json({ message: "Failed to create alert" });
    }
  });

  // Get device alerts
  app.get("/api/tracking/devices/:deviceId/alerts", async (req, res) => {
    try {
      const { deviceId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;

      const alerts = await db.select().from(emergencyAlerts)
        .where(eq(emergencyAlerts.deviceId, parseInt(deviceId)))
        .orderBy(desc(emergencyAlerts.timestamp))
        .limit(limit);

      res.json(alerts);
    } catch (error) {
      console.error("Failed to get device alerts:", error);
      res.status(500).json({ message: "Failed to get device alerts" });
    }
  });

  // Get zone status
  app.get("/api/tracking/devices/:deviceId/zone-status/:zoneId", async (req, res) => {
    try {
      const { deviceId, zoneId } = req.params;
      
      const [status] = await db.select().from(zoneStatus)
        .where(and(
          eq(zoneStatus.deviceId, deviceId),
          eq(zoneStatus.zoneId, zoneId)
        ))
        .orderBy(desc(zoneStatus.updatedAt))
        .limit(1);

      res.json({ isInZone: status?.isInZone || false });
    } catch (error) {
      console.error("Failed to get zone status:", error);
      res.status(500).json({ isInZone: false });
    }
  });

  // Update zone status
  app.post("/api/tracking/devices/:deviceId/zone-status/:zoneId", async (req, res) => {
    try {
      const { deviceId, zoneId } = req.params;
      const { isInZone } = req.body;

      // Get current status
      const [currentStatus] = await db.select().from(zoneStatus)
        .where(and(
          eq(zoneStatus.deviceId, deviceId),
          eq(zoneStatus.zoneId, zoneId)
        ))
        .orderBy(desc(zoneStatus.updatedAt))
        .limit(1);

      if (!currentStatus || currentStatus.isInZone !== isInZone) {
        // Insert new status record
        await db.insert(zoneStatus).values({
          deviceId,
          zoneId,
          isInZone,
          enteredAt: isInZone ? new Date() : null,
          exitedAt: !isInZone ? new Date() : null,
          updatedAt: new Date()
        });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Failed to update zone status:", error);
      res.status(500).json({ message: "Failed to update zone status" });
    }
  });

  // Get last location
  app.get("/api/tracking/devices/:deviceId/last-location", async (req, res) => {
    try {
      const { deviceId } = req.params;
      
      const [location] = await db.select().from(deviceLocationHistory)
        .where(eq(deviceLocationHistory.deviceId, deviceId))
        .orderBy(desc(deviceLocationHistory.timestamp))
        .limit(1);

      if (!location) {
        return res.status(404).json({ message: "No location history found" });
      }

      res.json({
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude),
        accuracy: parseFloat(location.accuracy || "0"),
        address: location.address,
        timestamp: location.timestamp?.getTime() || Date.now()
      });
    } catch (error) {
      console.error("Failed to get last location:", error);
      res.status(500).json({ message: "Failed to get last location" });
    }
  });

  // Emergency alert endpoint
  app.post("/api/tracking/emergency-alert", async (req, res) => {
    try {
      const { deviceId, contactId, message, location } = req.body;
      
      // Here you would integrate with your notification service
      // to send SMS/WhatsApp/Email alerts to emergency contacts
      
      // Create emergency alert record
      await db.insert(emergencyAlerts).values({
        deviceId,
        type: 'emergency',
        alertType: 'emergency',
        message,
        latitude: location?.latitude?.toString() || null,
        longitude: location?.longitude?.toString() || null,
        severity: 'critical',
        isRead: false,
        timestamp: new Date()
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Failed to send emergency alert:", error);
      res.status(500).json({ message: "Failed to send emergency alert" });
    }
  });
  
  console.log('[TRACKING] ✅ Tracking routes registered successfully');
}

export default registerTrackingRoutes;
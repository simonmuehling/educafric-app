import { Router } from "express";
import { storage } from "../storage";
import { requireAuth, requireAnyRole } from "../middleware/auth";
import { insertBusRouteSchema, insertBusStationSchema, insertBusStudentSchema } from "@shared/schema";

const router = Router();

// === BUS ROUTE ROUTES ===

// Get all bus routes for a school
router.get("/routes/:schoolId", requireAuth, async (req, res) => {
  try {
    const schoolId = parseInt(req.params.schoolId);
    const routes = await storage.getBusRoutesBySchool(schoolId);

    res.json(routes);
  } catch (error: any) {
    console.error("[BUS] Error fetching routes:", error);
    res.status(500).json({ error: "Failed to fetch bus routes" });
  }
});

// Get active bus routes for a school
router.get("/routes/:schoolId/active", requireAuth, async (req, res) => {
  try {
    const schoolId = parseInt(req.params.schoolId);
    const routes = await storage.getActiveBusRoutesBySchool(schoolId);

    res.json(routes);
  } catch (error: any) {
    console.error("[BUS] Error fetching active routes:", error);
    res.status(500).json({ error: "Failed to fetch active bus routes" });
  }
});

// Get single route by ID
router.get("/routes/single/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const route = await storage.getBusRouteById(id);

    if (!route) {
      return res.status(404).json({ error: "Bus route not found" });
    }

    res.json(route);
  } catch (error: any) {
    console.error("[BUS] Error fetching route:", error);
    res.status(500).json({ error: "Failed to fetch bus route" });
  }
});

// Create a new bus route (Director only)
router.post("/routes", requireAuth, requireAnyRole(['Director']), async (req, res) => {
  try {
    const validated = insertBusRouteSchema.parse(req.body);
    const route = await storage.createBusRoute(validated);

    res.status(201).json(route);
  } catch (error: any) {
    console.error("[BUS] Error creating route:", error);
    res.status(400).json({ error: error.message || "Failed to create bus route" });
  }
});

// Update a bus route (Director only)
router.patch("/routes/:id", requireAuth, requireAnyRole(['Director']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const route = await storage.updateBusRoute(id, req.body);

    res.json(route);
  } catch (error: any) {
    console.error("[BUS] Error updating route:", error);
    res.status(400).json({ error: "Failed to update bus route" });
  }
});

// Delete a bus route (Director only)
router.delete("/routes/:id", requireAuth, requireAnyRole(['Director']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteBusRoute(id);

    res.json({ message: "Bus route deleted successfully" });
  } catch (error: any) {
    console.error("[BUS] Error deleting route:", error);
    res.status(500).json({ error: "Failed to delete bus route" });
  }
});

// === STATION ROUTES ===

// Get all stations for a route
router.get("/stations/:routeId", requireAuth, async (req, res) => {
  try {
    const routeId = parseInt(req.params.routeId);
    const stations = await storage.getBusStationsByRoute(routeId);

    res.json(stations);
  } catch (error: any) {
    console.error("[BUS] Error fetching stations:", error);
    res.status(500).json({ error: "Failed to fetch bus stations" });
  }
});

// Get single station by ID
router.get("/stations/single/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const station = await storage.getBusStationById(id);

    if (!station) {
      return res.status(404).json({ error: "Bus station not found" });
    }

    res.json(station);
  } catch (error: any) {
    console.error("[BUS] Error fetching station:", error);
    res.status(500).json({ error: "Failed to fetch bus station" });
  }
});

// Create a new station (Director only)
router.post("/stations", requireAuth, requireAnyRole(['Director']), async (req, res) => {
  try {
    const validated = insertBusStationSchema.parse(req.body);
    const station = await storage.createBusStation(validated);

    res.status(201).json(station);
  } catch (error: any) {
    console.error("[BUS] Error creating station:", error);
    res.status(400).json({ error: error.message || "Failed to create bus station" });
  }
});

// Update a station (Director only)
router.patch("/stations/:id", requireAuth, requireAnyRole(['Director']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const station = await storage.updateBusStation(id, req.body);

    res.json(station);
  } catch (error: any) {
    console.error("[BUS] Error updating station:", error);
    res.status(400).json({ error: "Failed to update bus station" });
  }
});

// Delete a station (Director only)
router.delete("/stations/:id", requireAuth, requireAnyRole(['Director']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteBusStation(id);

    res.json({ message: "Bus station deleted successfully" });
  } catch (error: any) {
    console.error("[BUS] Error deleting station:", error);
    res.status(500).json({ error: "Failed to delete bus station" });
  }
});

// === STUDENT ENROLLMENT ROUTES ===

// Get all students enrolled in a route
router.get("/enrollments/:routeId", requireAuth, async (req, res) => {
  try {
    const routeId = parseInt(req.params.routeId);
    const students = await storage.getBusStudentsByRoute(routeId);

    res.json(students);
  } catch (error: any) {
    console.error("[BUS] Error fetching enrolled students:", error);
    res.status(500).json({ error: "Failed to fetch enrolled students" });
  }
});

// Get student's bus enrollment
router.get("/enrollments/student/:studentId", requireAuth, async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const enrollment = await storage.getBusStudentEnrollment(studentId);

    if (!enrollment) {
      return res.status(404).json({ error: "No bus enrollment found for this student" });
    }

    res.json(enrollment);
  } catch (error: any) {
    console.error("[BUS] Error fetching student enrollment:", error);
    res.status(500).json({ error: "Failed to fetch student enrollment" });
  }
});

// Enroll a student in a bus route (Director/Teacher only)
router.post("/enrollments", requireAuth, requireAnyRole(['Director', 'Teacher']), async (req, res) => {
  try {
    const validated = insertBusStudentSchema.parse(req.body);
    const enrollment = await storage.enrollBusStudent(validated);

    res.status(201).json(enrollment);
  } catch (error: any) {
    console.error("[BUS] Error enrolling student:", error);
    res.status(400).json({ error: error.message || "Failed to enroll student" });
  }
});

// Update enrollment (Director/Teacher only)
router.patch("/enrollments/:id", requireAuth, requireAnyRole(['Director', 'Teacher']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const enrollment = await storage.updateBusEnrollment(id, req.body);

    res.json(enrollment);
  } catch (error: any) {
    console.error("[BUS] Error updating enrollment:", error);
    res.status(400).json({ error: "Failed to update enrollment" });
  }
});

// Unenroll a student from a route (Director/Teacher only)
router.delete("/enrollments/:studentId/:routeId", requireAuth, requireAnyRole(['Director', 'Teacher']), async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const routeId = parseInt(req.params.routeId);
    
    await storage.unenrollBusStudent(studentId, routeId);

    res.json({ message: "Student unenrolled successfully" });
  } catch (error: any) {
    console.error("[BUS] Error unenrolling student:", error);
    res.status(500).json({ error: "Failed to unenroll student" });
  }
});

export default router;

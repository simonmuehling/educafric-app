import { Router } from "express";
import { storage } from "../storage";
import { requireAuth, requireAnyRole } from "../middleware/auth";
import { insertCanteenMenuSchema, insertCanteenReservationSchema } from "@shared/schema";

const router = Router();

// === MENU ROUTES ===

// Get all menus for a school (with optional date range)
router.get("/menus/:schoolId", requireAuth, async (req, res) => {
  try {
    const schoolId = parseInt(req.params.schoolId);
    const { startDate, endDate } = req.query;

    const menus = await storage.getCanteenMenusBySchool(
      schoolId,
      startDate as string,
      endDate as string
    );

    res.json(menus);
  } catch (error: any) {
    console.error("[CANTEEN] Error fetching menus:", error);
    res.status(500).json({ error: "Failed to fetch canteen menus" });
  }
});

// Get single menu by ID
router.get("/menus/single/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const menu = await storage.getCanteenMenuById(id);

    if (!menu) {
      return res.status(404).json({ error: "Menu not found" });
    }

    res.json(menu);
  } catch (error: any) {
    console.error("[CANTEEN] Error fetching menu:", error);
    res.status(500).json({ error: "Failed to fetch menu" });
  }
});

// Create a new menu (Director/Teacher only)
router.post("/menus", requireAuth, requireAnyRole(['Director', 'Teacher']), async (req, res) => {
  try {
    const validated = insertCanteenMenuSchema.parse(req.body);
    const menu = await storage.createCanteenMenu(validated);

    res.status(201).json(menu);
  } catch (error: any) {
    console.error("[CANTEEN] Error creating menu:", error);
    res.status(400).json({ error: error.message || "Failed to create menu" });
  }
});

// Update a menu (Director/Teacher only)
router.patch("/menus/:id", requireAuth, requireAnyRole(['Director', 'Teacher']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const menu = await storage.updateCanteenMenu(id, req.body);

    res.json(menu);
  } catch (error: any) {
    console.error("[CANTEEN] Error updating menu:", error);
    res.status(400).json({ error: "Failed to update menu" });
  }
});

// Delete a menu (Director only)
router.delete("/menus/:id", requireAuth, requireAnyRole(['Director']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteCanteenMenu(id);

    res.json({ message: "Menu deleted successfully" });
  } catch (error: any) {
    console.error("[CANTEEN] Error deleting menu:", error);
    res.status(500).json({ error: "Failed to delete menu" });
  }
});

// === RESERVATION ROUTES ===

// Get reservations for a student
router.get("/reservations/student/:studentId", requireAuth, async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const reservations = await storage.getCanteenReservationsByStudent(studentId);

    res.json(reservations);
  } catch (error: any) {
    console.error("[CANTEEN] Error fetching student reservations:", error);
    res.status(500).json({ error: "Failed to fetch reservations" });
  }
});

// Get reservations for a menu
router.get("/reservations/menu/:menuId", requireAuth, async (req, res) => {
  try {
    const menuId = parseInt(req.params.menuId);
    const reservations = await storage.getCanteenReservationsByMenu(menuId);

    res.json(reservations);
  } catch (error: any) {
    console.error("[CANTEEN] Error fetching menu reservations:", error);
    res.status(500).json({ error: "Failed to fetch reservations" });
  }
});

// Create a reservation
router.post("/reservations", requireAuth, async (req, res) => {
  try {
    const validated = insertCanteenReservationSchema.parse(req.body);
    const reservation = await storage.createCanteenReservation(validated);

    res.status(201).json(reservation);
  } catch (error: any) {
    console.error("[CANTEEN] Error creating reservation:", error);
    res.status(400).json({ error: error.message || "Failed to create reservation" });
  }
});

// Update reservation (mark as paid, etc.)
router.patch("/reservations/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const reservation = await storage.updateCanteenReservation(id, req.body);

    res.json(reservation);
  } catch (error: any) {
    console.error("[CANTEEN] Error updating reservation:", error);
    res.status(400).json({ error: "Failed to update reservation" });
  }
});

// Delete a reservation
router.delete("/reservations/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteCanteenReservation(id);

    res.json({ message: "Reservation deleted successfully" });
  } catch (error: any) {
    console.error("[CANTEEN] Error deleting reservation:", error);
    res.status(500).json({ error: "Failed to delete reservation" });
  }
});

// === BALANCE ROUTES ===

// Get student's canteen balance
router.get("/balance/:studentId", requireAuth, async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const balance = await storage.getCanteenBalance(studentId);

    res.json(balance);
  } catch (error: any) {
    console.error("[CANTEEN] Error fetching balance:", error);
    res.status(500).json({ error: "Failed to fetch balance" });
  }
});

// Add to student's balance (Director/Teacher only)
router.post("/balance/:studentId/add", requireAuth, requireAnyRole(['Director', 'Teacher']), async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const { amount } = req.body;

    if (!amount || isNaN(parseFloat(amount))) {
      return res.status(400).json({ error: "Valid amount required" });
    }

    const balance = await storage.addToCanteenBalance(studentId, amount);
    res.json(balance);
  } catch (error: any) {
    console.error("[CANTEEN] Error adding to balance:", error);
    res.status(500).json({ error: "Failed to add to balance" });
  }
});

// Deduct from student's balance (Director/Teacher only)
router.post("/balance/:studentId/deduct", requireAuth, requireAnyRole(['Director', 'Teacher']), async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const { amount } = req.body;

    if (!amount || isNaN(parseFloat(amount))) {
      return res.status(400).json({ error: "Valid amount required" });
    }

    const balance = await storage.deductFromCanteenBalance(studentId, amount);
    res.json(balance);
  } catch (error: any) {
    console.error("[CANTEEN] Error deducting from balance:", error);
    res.status(500).json({ error: "Failed to deduct from balance" });
  }
});

export default router;

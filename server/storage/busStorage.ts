import { db } from "../db";
import { busRoutes, busStations, busStudents } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export class BusStorage {
  // === ROUTE METHODS ===
  async createRoute(route: any) {
    const [newRoute] = await db.insert(busRoutes).values(route).returning();
    return newRoute;
  }

  async getRouteById(id: number) {
    const [route] = await db.select().from(busRoutes).where(eq(busRoutes.id, id));
    return route;
  }

  async getRoutesBySchool(schoolId: number) {
    return db.select().from(busRoutes).where(eq(busRoutes.schoolId, schoolId));
  }

  async getActiveRoutesBySchool(schoolId: number) {
    return db.select().from(busRoutes).where(
      and(
        eq(busRoutes.schoolId, schoolId),
        eq(busRoutes.active, true)
      )
    );
  }

  async updateRoute(id: number, updates: any) {
    const [updated] = await db.update(busRoutes)
      .set(updates)
      .where(eq(busRoutes.id, id))
      .returning();
    return updated;
  }

  async deleteRoute(id: number) {
    // Also delete related stations and students
    await db.delete(busStations).where(eq(busStations.routeId, id));
    await db.delete(busStudents).where(eq(busStudents.routeId, id));
    await db.delete(busRoutes).where(eq(busRoutes.id, id));
  }

  // === STATION METHODS ===
  async createStation(station: any) {
    const [newStation] = await db.insert(busStations).values(station).returning();
    return newStation;
  }

  async getStationById(id: number) {
    const [station] = await db.select().from(busStations).where(eq(busStations.id, id));
    return station;
  }

  async getStationsByRoute(routeId: number) {
    return db.select().from(busStations)
      .where(eq(busStations.routeId, routeId))
      .orderBy(busStations.orderIndex);
  }

  async updateStation(id: number, updates: any) {
    const [updated] = await db.update(busStations)
      .set(updates)
      .where(eq(busStations.id, id))
      .returning();
    return updated;
  }

  async deleteStation(id: number) {
    await db.delete(busStations).where(eq(busStations.id, id));
  }

  // === BUS STUDENT ENROLLMENT METHODS ===
  async enrollStudent(enrollment: any) {
    const [newEnrollment] = await db.insert(busStudents).values(enrollment).returning();
    return newEnrollment;
  }

  async getStudentsByRoute(routeId: number) {
    return db.select().from(busStudents).where(
      and(
        eq(busStudents.routeId, routeId),
        eq(busStudents.active, true)
      )
    );
  }

  async getStudentEnrollment(studentId: number) {
    const [enrollment] = await db.select().from(busStudents).where(
      and(
        eq(busStudents.studentId, studentId),
        eq(busStudents.active, true)
      )
    );
    return enrollment;
  }

  async updateEnrollment(id: number, updates: any) {
    const [updated] = await db.update(busStudents)
      .set(updates)
      .where(eq(busStudents.id, id))
      .returning();
    return updated;
  }

  async unenrollStudent(studentId: number, routeId: number) {
    await db.update(busStudents)
      .set({ active: false })
      .where(
        and(
          eq(busStudents.studentId, studentId),
          eq(busStudents.routeId, routeId)
        )
      );
  }
}

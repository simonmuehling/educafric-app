import { db } from "../db";
import { canteenMenus, canteenReservations, canteenBalances } from "@shared/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export class CanteenStorage {
  // === MENU METHODS ===
  async createMenu(menu: any) {
    const [newMenu] = await db.insert(canteenMenus).values(menu).returning();
    return newMenu;
  }

  async getMenuById(id: number) {
    const [menu] = await db.select().from(canteenMenus).where(eq(canteenMenus.id, id));
    return menu;
  }

  async getMenusBySchool(schoolId: number, startDate?: string, endDate?: string) {
    let query = db.select().from(canteenMenus).where(eq(canteenMenus.schoolId, schoolId));
    
    if (startDate && endDate) {
      return db.select().from(canteenMenus).where(
        and(
          eq(canteenMenus.schoolId, schoolId),
          gte(canteenMenus.date, startDate),
          lte(canteenMenus.date, endDate)
        )
      );
    }
    
    return query;
  }

  async updateMenu(id: number, updates: any) {
    const [updated] = await db.update(canteenMenus)
      .set(updates)
      .where(eq(canteenMenus.id, id))
      .returning();
    return updated;
  }

  async deleteMenu(id: number) {
    await db.delete(canteenMenus).where(eq(canteenMenus.id, id));
  }

  // === RESERVATION METHODS ===
  async createReservation(reservation: any) {
    const [newReservation] = await db.insert(canteenReservations).values(reservation).returning();
    return newReservation;
  }

  async getReservationsByStudent(studentId: number) {
    return db.select().from(canteenReservations).where(eq(canteenReservations.studentId, studentId));
  }

  async getReservationsByMenu(menuId: number) {
    return db.select().from(canteenReservations).where(eq(canteenReservations.menuId, menuId));
  }

  async updateReservation(id: number, updates: any) {
    const [updated] = await db.update(canteenReservations)
      .set(updates)
      .where(eq(canteenReservations.id, id))
      .returning();
    return updated;
  }

  async deleteReservation(id: number) {
    await db.delete(canteenReservations).where(eq(canteenReservations.id, id));
  }

  // === BALANCE METHODS ===
  async getBalance(studentId: number) {
    const [balance] = await db.select().from(canteenBalances).where(eq(canteenBalances.studentId, studentId));
    
    // If no balance exists, create one with 0 balance
    if (!balance) {
      const [newBalance] = await db.insert(canteenBalances)
        .values({ studentId, balance: "0" })
        .returning();
      return newBalance;
    }
    
    return balance;
  }

  async updateBalance(studentId: number, newBalance: string) {
    const [updated] = await db.update(canteenBalances)
      .set({ balance: newBalance, lastUpdated: new Date() })
      .where(eq(canteenBalances.studentId, studentId))
      .returning();
    return updated;
  }

  async addToBalance(studentId: number, amount: string) {
    const currentBalance = await this.getBalance(studentId);
    const newBalance = (parseFloat(currentBalance.balance) + parseFloat(amount)).toFixed(2);
    return this.updateBalance(studentId, newBalance);
  }

  async deductFromBalance(studentId: number, amount: string) {
    const currentBalance = await this.getBalance(studentId);
    const newBalance = (parseFloat(currentBalance.balance) - parseFloat(amount)).toFixed(2);
    return this.updateBalance(studentId, newBalance);
  }
}

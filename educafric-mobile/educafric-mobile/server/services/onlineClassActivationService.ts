import { db } from "../db";
import { 
  onlineClassActivations, 
  type InsertOnlineClassActivation,
  type OnlineClassActivation
} from "@shared/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export class OnlineClassActivationService {
  
  /**
   * Calculate end date based on duration type
   */
  private calculateEndDate(startDate: Date, durationType: string): Date {
    const endDate = new Date(startDate);
    
    switch (durationType) {
      case "daily":
        endDate.setDate(endDate.getDate() + 1);
        break;
      case "weekly":
        endDate.setDate(endDate.getDate() + 7);
        break;
      case "monthly":
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case "quarterly":
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case "semestral":
        endDate.setMonth(endDate.getMonth() + 6);
        break;
      case "yearly":
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      default:
        throw new Error(`Invalid duration type: ${durationType}`);
    }
    
    return endDate;
  }

  /**
   * Admin manually activates online class module for a school
   */
  async activateForSchool(
    schoolId: number,
    durationType: "daily" | "weekly" | "monthly" | "quarterly" | "semestral" | "yearly",
    adminUserId: number,
    notes?: string
  ): Promise<OnlineClassActivation> {
    const startDate = new Date();
    const endDate = this.calculateEndDate(startDate, durationType);

    const [activation] = await db
      .insert(onlineClassActivations)
      .values({
        activatorType: "school",
        activatorId: schoolId,
        durationType,
        startDate,
        endDate,
        status: "active",
        activatedBy: "admin_manual",
        adminUserId,
        notes,
      })
      .returning();

    return activation;
  }

  /**
   * Teacher purchases online class module (flexible duration)
   * Fixed prices per duration
   */
  async activateForTeacher(
    teacherId: number,
    paymentId: string,
    paymentMethod: "stripe" | "mtn",
    durationType: "daily" | "weekly" | "monthly" | "quarterly" | "semestral" | "yearly" = "yearly",
    amountPaid?: number
  ): Promise<OnlineClassActivation> {
    const startDate = new Date();
    const endDate = this.calculateEndDate(startDate, durationType);

    // Fixed pricing per duration
    let defaultAmount = 150000;
    switch (durationType) {
      case 'daily': defaultAmount = 2500; break;
      case 'weekly': defaultAmount = 10000; break;
      case 'monthly': defaultAmount = 25000; break;
      case 'quarterly': defaultAmount = 73000; break;
      case 'semestral': defaultAmount = 105000; break;
      case 'yearly': defaultAmount = 150000; break;
    }

    const [activation] = await db
      .insert(onlineClassActivations)
      .values({
        activatorType: "teacher",
        activatorId: teacherId,
        durationType,
        startDate,
        endDate,
        status: "active",
        activatedBy: "self_purchase",
        paymentId,
        paymentMethod,
        amountPaid: amountPaid ?? defaultAmount,
      })
      .returning();

    return activation;
  }

  /**
   * Check if school has active online class module
   */
  async checkSchoolActivation(schoolId: number): Promise<OnlineClassActivation | null> {
    const now = new Date();
    
    const [activation] = await db
      .select()
      .from(onlineClassActivations)
      .where(
        and(
          eq(onlineClassActivations.activatorType, "school"),
          eq(onlineClassActivations.activatorId, schoolId),
          eq(onlineClassActivations.status, "active"),
          lte(onlineClassActivations.startDate, now),
          gte(onlineClassActivations.endDate, now)
        )
      )
      .limit(1);

    return activation || null;
  }

  /**
   * Check if teacher has active online class module (personal purchase)
   */
  async checkTeacherActivation(teacherId: number): Promise<OnlineClassActivation | null> {
    const now = new Date();
    
    const [activation] = await db
      .select()
      .from(onlineClassActivations)
      .where(
        and(
          eq(onlineClassActivations.activatorType, "teacher"),
          eq(onlineClassActivations.activatorId, teacherId),
          eq(onlineClassActivations.status, "active"),
          lte(onlineClassActivations.startDate, now),
          gte(onlineClassActivations.endDate, now)
        )
      )
      .limit(1);

    return activation || null;
  }

  /**
   * Get all activations for admin dashboard
   */
  async getAllActivations() {
    return await db
      .select()
      .from(onlineClassActivations)
      .orderBy(onlineClassActivations.createdAt);
  }

  /**
   * Get activations for a specific school
   */
  async getSchoolActivations(schoolId: number) {
    return await db
      .select()
      .from(onlineClassActivations)
      .where(
        and(
          eq(onlineClassActivations.activatorType, "school"),
          eq(onlineClassActivations.activatorId, schoolId)
        )
      )
      .orderBy(onlineClassActivations.createdAt);
  }

  /**
   * Cancel/deactivate an activation
   */
  async cancelActivation(activationId: number): Promise<void> {
    await db
      .update(onlineClassActivations)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(onlineClassActivations.id, activationId));
  }

  /**
   * Update expired activations (can be run as a cron job)
   */
  async updateExpiredActivations(): Promise<number> {
    const now = new Date();
    
    const result = await db
      .update(onlineClassActivations)
      .set({ status: "expired", updatedAt: now })
      .where(
        and(
          eq(onlineClassActivations.status, "active"),
          lte(onlineClassActivations.endDate, now)
        )
      );

    return result.rowCount || 0;
  }

  /**
   * Extend an existing activation
   */
  async extendActivation(
    activationId: number,
    additionalDurationType: "daily" | "weekly" | "monthly" | "quarterly" | "semestral" | "yearly"
  ): Promise<OnlineClassActivation> {
    const [activation] = await db
      .select()
      .from(onlineClassActivations)
      .where(eq(onlineClassActivations.id, activationId))
      .limit(1);

    if (!activation) {
      throw new Error("Activation not found");
    }

    const currentEndDate = new Date(activation.endDate);
    const newEndDate = this.calculateEndDate(currentEndDate, additionalDurationType);

    const [updated] = await db
      .update(onlineClassActivations)
      .set({ 
        endDate: newEndDate,
        status: "active",
        updatedAt: new Date() 
      })
      .where(eq(onlineClassActivations.id, activationId))
      .returning();

    return updated;
  }
}

export const onlineClassActivationService = new OnlineClassActivationService();

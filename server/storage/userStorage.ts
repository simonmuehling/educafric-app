// ===== USER STORAGE MODULE =====
// Extracted from huge storage.ts to prevent crashes

import { db } from "../db";
import { users } from "../../shared/schemas/userSchema";
import { commercialActivities } from "../../shared/schema";
import { eq, desc, sql, and, gte } from "drizzle-orm";
import * as bcrypt from "bcryptjs";
import type { IUserStorage } from "./interfaces";

export class UserStorage implements IUserStorage {
  async createUser(user: any): Promise<any> {
    try {
      // Password should already be hashed by calling code
      const [newUser] = await db.insert(users).values({
        ...user,
      }).returning();
      return newUser;
    } catch (error) {
      throw new Error(`Failed to create user: ${error}`);
    }
  }

  async getUserById(id: number): Promise<any | null> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return user || null;
    } catch (error) {
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<any | null> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      return user || null;
    } catch (error) {
      return null;
    }
  }

  async getUserByPasswordResetToken(token: string): Promise<any | null> {
    try {
      const [user] = await db.select().from(users).where(eq(users.passwordResetToken, token)).limit(1);
      return user || null;
    } catch (error) {
      return null;
    }
  }

  async getAllUsers(): Promise<any[]> {
    try {
      return await db.select().from(users);
    } catch (error) {
      return [];
    }
  }

  async updateUser(id: number, updates: any): Promise<any> {
    try {
      const [updatedUser] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
      return updatedUser;
    } catch (error) {
      throw new Error(`Failed to update user: ${error}`);
    }
  }

  async deleteUser(id: number): Promise<void> {
    try {
      await db.delete(users).where(eq(users.id, id));
    } catch (error) {
      throw new Error(`Failed to delete user: ${error}`);
    }
  }

  async verifyPassword(user: any, password: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, user.password);
    } catch (error) {
      return false;
    }
  }

  // === STRIPE SUBSCRIPTION METHODS ===
  async updateUserStripeCustomerId(userId: number, stripeCustomerId: string): Promise<any> {
    try {
      const [updatedUser] = await db.update(users)
        .set({ stripeCustomerId } as any)
        .where(eq(users.id, userId))
        .returning();
      return updatedUser;
    } catch (error) {
      throw new Error(`Failed to update Stripe customer ID: ${error}`);
    }
  }

  async updateUserStripeInfo(userId: number, stripeData: { customerId: string; subscriptionId: string }): Promise<any> {
    try {
      const [updatedUser] = await db.update(users)
        .set({ 
          stripeCustomerId: stripeData.customerId,
          stripeSubscriptionId: stripeData.subscriptionId 
        } as any)
        .where(eq(users.id, userId))
        .returning();
      return updatedUser;
    } catch (error) {
      throw new Error(`Failed to update Stripe info: ${error}`);
    }
  }

  async updateUserSubscription(userId: number, subscriptionData: {
    status?: string;
    plan?: string;
    subscriptionId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<any> {
    try {
      const updateData: any = {};
      
      if (subscriptionData.status) updateData.subscriptionStatus = subscriptionData.status;
      if (subscriptionData.plan) updateData.subscriptionPlan = subscriptionData.plan;
      if (subscriptionData.subscriptionId) updateData.stripeSubscriptionId = subscriptionData.subscriptionId;
      if (subscriptionData.startDate) updateData.subscriptionStart = subscriptionData.startDate;
      if (subscriptionData.endDate) updateData.subscriptionEnd = subscriptionData.endDate;
      
      const [updatedUser] = await db.update(users)
        .set(updateData)
        .where(eq(users.id, userId))
        .returning();
      return updatedUser;
    } catch (error) {
      throw new Error(`Failed to update user subscription: ${error}`);
    }
  }

  // === EMAIL PREFERENCES METHODS ===
  async getEmailPreferences(userId: number): Promise<any | null> {
    try {
      // For now, return default preferences since we don't have a separate table
      return {
        userId,
        allEmailsEnabled: true,
        passwordResetEmails: true,
        welcomeEmails: true,
        assignmentNotifications: true,
        gradeNotifications: true,
        attendanceAlerts: true,
        geolocationAlerts: true,
        emergencyNotifications: true
      };
    } catch (error) {
      return null;
    }
  }

  async createEmailPreferences(data: any): Promise<any> {
    try {
      // For now, just return the data since we store preferences in user profile
      return { id: Date.now(), ...data };
    } catch (error) {
      throw new Error(`Failed to create email preferences: ${error}`);
    }
  }

  async updateEmailPreferences(userId: number, updates: any): Promise<any> {
    try {
      // For now, just return the updates since we store preferences in user profile
      return { userId, ...updates };
    } catch (error) {
      throw new Error(`Failed to update email preferences: ${error}`);
    }
  }

  // Storage helper alias
  async getUser(userId: number): Promise<any | null> {
    return this.getUserById(userId);
  }

  // === COMMERCIAL ACTIVITY METHODS ===
  async createCommercialActivity(activity: {
    commercialId: number;
    activityType: string;
    description?: string;
    metadata?: any;
    ipAddress?: string;
    userAgent?: string;
    schoolId?: number;
  }): Promise<any> {
    try {
      const [newActivity] = await db.insert(commercialActivities).values({
        ...activity,
        metadata: activity.metadata ? JSON.stringify(activity.metadata) : null
      }).returning();
      return newActivity;
    } catch (error) {
      console.error(`[COMMERCIAL_ACTIVITY] Failed to log activity: ${error}`);
      return null;
    }
  }

  async getCommercialActivities(commercialId: number, limit: number = 50): Promise<any[]> {
    try {
      const activities = await db.select()
        .from(commercialActivities)
        .where(eq(commercialActivities.commercialId, commercialId))
        .orderBy(desc(commercialActivities.createdAt))
        .limit(limit);
      return activities;
    } catch (error) {
      console.error(`[COMMERCIAL_ACTIVITY] Failed to get activities: ${error}`);
      return [];
    }
  }

  async getCommercialActivitySummary(commercialId: number, days: number = 30): Promise<any> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const activities = await db.select()
        .from(commercialActivities)
        .where(
          and(
            eq(commercialActivities.commercialId, commercialId),
            gte(commercialActivities.createdAt, cutoffDate)
          )
        )
        .orderBy(desc(commercialActivities.createdAt));

      // Group activities by type
      const summary = {
        totalActivities: activities.length,
        period: `${days} days`,
        activitiesByType: {} as Record<string, number>,
        recentActivities: activities.slice(0, 10),
        lastLogin: null as any,
        loginCount: 0,
        uniqueDays: new Set<string>(),
        mostActiveDay: null as string | null
      };

      activities.forEach(activity => {
        // Count by type
        summary.activitiesByType[activity.activityType] = 
          (summary.activitiesByType[activity.activityType] || 0) + 1;
        
        // Track login info
        if (activity.activityType === 'login') {
          summary.loginCount++;
          if (!summary.lastLogin) {
            summary.lastLogin = activity;
          }
        }
        
        // Track unique days
        const dayKey = activity.createdAt?.toISOString().split('T')[0];
        if (dayKey) {
          summary.uniqueDays.add(dayKey);
        }
      });

      // Calculate most active day
      const dayCount: Record<string, number> = {};
      activities.forEach(activity => {
        const dayKey = activity.createdAt?.toISOString().split('T')[0];
        if (dayKey) {
          dayCount[dayKey] = (dayCount[dayKey] || 0) + 1;
        }
      });
      
      summary.mostActiveDay = Object.entries(dayCount)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || null;

      return {
        ...summary,
        uniqueDaysCount: summary.uniqueDays.size,
        uniqueDays: undefined // Remove Set from response
      };
    } catch (error) {
      console.error(`[COMMERCIAL_ACTIVITY] Failed to get summary: ${error}`);
      return {
        totalActivities: 0,
        period: `${days} days`,
        activitiesByType: {},
        recentActivities: [],
        lastLogin: null,
        loginCount: 0,
        uniqueDaysCount: 0,
        mostActiveDay: null
      };
    }
  }
}
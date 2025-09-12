// ===== USER STORAGE MODULE =====
// Extracted from huge storage.ts to prevent crashes

import { db } from "../db";
import { users } from "../../shared/schemas/userSchema";
// import { commercialActivities } from "../../shared/schema"; // Désactivé temporairement - table n'existe pas
import { eq, desc, sql, and, gte } from "drizzle-orm";
import * as bcrypt from "bcryptjs";
import type { IUserStorage } from "./interfaces";
import type { InsertNotificationPreferences, NotificationPreferences } from "../../shared/schema";

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
      // Temporairement désactivé car table commercialActivities n'existe pas
      console.log(`[COMMERCIAL_ACTIVITY] Login activity tracked for: ${activity.commercialId}`);
      return { id: Date.now(), ...activity };
    } catch (error) {
      console.error(`[COMMERCIAL_ACTIVITY] Failed to log activity: ${error}`);
      return null;
    }
  }

  async getCommercialActivities(commercialId: number, limit: number = 50): Promise<any[]> {
    try {
      // Temporairement désactivé car table commercialActivities n'existe pas
      return [];
    } catch (error) {
      console.error(`[COMMERCIAL_ACTIVITY] Failed to get activities: ${error}`);
      return [];
    }
  }

  async getCommercialActivitySummary(commercialId: number, days: number = 30): Promise<any> {
    try {
      // Temporairement désactivé car table commercialActivities n'existe pas
      const summary = {
        totalActivities: 0,
        period: `${days} days`,
        activitiesByType: {},
        recentActivities: [],
        lastLogin: null,
        loginCount: 0,
        uniqueDaysCount: 0,
        mostActiveDay: null
      };

      return summary;
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

  // === NOTIFICATION PREFERENCES METHODS ===
  async getNotificationPreferences(userId: number): Promise<any | null> {
    try {
      const { notificationPreferences } = await import("../../shared/schema");
      const [preferences] = await db.select()
        .from(notificationPreferences)
        .where(eq(notificationPreferences.userId, userId))
        .limit(1);
      
      // Return defaults if no preferences exist
      if (!preferences) {
        return {
          userId,
          pushNotifications: true,
          emailNotifications: true,
          smsNotifications: false,
          phone: null,
          autoOpen: true,
          soundEnabled: true,
          vibrationEnabled: true
        };
      }
      
      return preferences;
    } catch (error) {
      console.error(`[NOTIFICATION_PREFERENCES] Failed to get preferences for user ${userId}:`, error);
      // Return defaults on error
      return {
        userId,
        pushNotifications: true,
        emailNotifications: true,
        smsNotifications: false,
        phone: null,
        autoOpen: true,
        soundEnabled: true,
        vibrationEnabled: true
      };
    }
  }

  async upsertNotificationPreferences(
    userId: number, 
    preferences: Omit<InsertNotificationPreferences, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<NotificationPreferences> {
    try {
      const { notificationPreferences } = await import("../../shared/schema");
      
      // TRUE ATOMIC UPSERT - Insert or update in one query
      const [upserted] = await db.insert(notificationPreferences)
        .values({
          userId,
          ...preferences
        })
        .onConflictDoUpdate({
          target: notificationPreferences.userId,
          set: preferences
        })
        .returning();
        
      return upserted;
    } catch (error) {
      console.error(`[NOTIFICATION_PREFERENCES] Failed to upsert preferences for user ${userId}:`, error);
      throw new Error(`Failed to save notification preferences: ${error}`);
    }
  }

  async createNotificationPreferences(data: {
    userId: number;
    pushNotifications?: boolean;
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    phone?: string;
    autoOpen?: boolean;
    soundEnabled?: boolean;
    vibrationEnabled?: boolean;
  }): Promise<any> {
    try {
      const { notificationPreferences } = await import("../../shared/schema");
      const [created] = await db.insert(notificationPreferences)
        .values(data)
        .returning();
      return created;
    } catch (error) {
      console.error(`[NOTIFICATION_PREFERENCES] Failed to create preferences:`, error);
      throw new Error(`Failed to create notification preferences: ${error}`);
    }
  }
}
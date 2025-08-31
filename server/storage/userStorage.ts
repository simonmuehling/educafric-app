// ===== USER STORAGE MODULE =====
// Extracted from huge storage.ts to prevent crashes

import { db } from "../db";
import { users } from "../../shared/schemas/userSchema";
import { eq } from "drizzle-orm";
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
}
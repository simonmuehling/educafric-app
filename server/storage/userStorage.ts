// ===== USER STORAGE MODULE =====
// Extracted from huge storage.ts to prevent crashes

import { db } from "../db";
import { users } from "../../shared/schema";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcryptjs";
import type { IUserStorage } from "./interfaces";

export class UserStorage implements IUserStorage {
  async createUser(user: any): Promise<any> {
    try {
      const hashedPassword = await bcrypt.hash(user.password, 12);
      const [newUser] = await db.insert(users).values({
        ...user,
        password: hashedPassword,
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
}
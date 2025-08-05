import { eq, and, desc } from "drizzle-orm";
import { db } from "../db";
import { tutorialProgress, tutorialSteps } from "../../shared/tutorialSchema";
import type {
  TutorialProgress,
  InsertTutorialProgress,
  TutorialStep,
  InsertTutorialStep,
  TutorialStatusRequest,
  TutorialStatusResponse,
  UpdateTutorialProgressRequest,
  CompleteTutorialRequest
} from "../../shared/tutorialSchema";

export class TutorialService {
  
  // Get tutorial status for a user
  static async getTutorialStatus(request: TutorialStatusRequest): Promise<TutorialStatusResponse> {
    const { userId, userRole, tutorialVersion = "1.0" } = request;
    
    try {
      const progress = await db
        .select()
        .from(tutorialProgress)
        .where(
          and(
            eq(tutorialProgress.userId, userId),
            eq(tutorialProgress.userRole, userRole),
            eq(tutorialProgress.tutorialVersion, tutorialVersion)
          )
        )
        .orderBy(desc(tutorialProgress.createdAt))
        .limit(1);

      if (progress.length === 0) {
        return {
          hasCompleted: false,
          currentStep: 0,
          totalSteps: 0,
          lastAccessed: null,
          canRestart: true
        };
      }

      const userProgress = progress[0];
      return {
        hasCompleted: userProgress.isCompleted || false,
        currentStep: userProgress.currentStep || 0,
        totalSteps: userProgress.totalSteps || 0,
        lastAccessed: userProgress.lastAccessedAt?.toISOString() || null,
        canRestart: true
      };
    } catch (error) {
      console.error('[TUTORIAL_SERVICE] Error getting tutorial status:', error);
      throw new Error('Failed to get tutorial status');
    }
  }

  // Start or update tutorial progress
  static async updateTutorialProgress(request: UpdateTutorialProgressRequest): Promise<TutorialProgress> {
    const { userId, currentStep, totalSteps, userRole, deviceType, sessionData } = request;
    
    try {
      // Check if progress already exists
      const existingProgress = await db
        .select()
        .from(tutorialProgress)
        .where(
          and(
            eq(tutorialProgress.userId, userId),
            eq(tutorialProgress.userRole, userRole)
          )
        )
        .limit(1);

      if (existingProgress.length > 0) {
        // Update existing progress
        const updated = await db
          .update(tutorialProgress)
          .set({
            currentStep,
            totalSteps,
            lastAccessedAt: new Date(),
            deviceType,
            sessionData: sessionData ? JSON.stringify(sessionData) : null,
            updatedAt: new Date()
          })
          .where(eq(tutorialProgress.id, existingProgress[0].id))
          .returning();

        return updated[0];
      } else {
        // Create new progress
        const newProgress = await db
          .insert(tutorialProgress)
          .values({
            userId,
            currentStep,
            totalSteps,
            userRole,
            deviceType,
            sessionData: sessionData ? JSON.stringify(sessionData) : null,
            lastAccessedAt: new Date()
          })
          .returning();

        return newProgress[0];
      }
    } catch (error) {
      console.error('[TUTORIAL_SERVICE] Error updating tutorial progress:', error);
      throw new Error('Failed to update tutorial progress');
    }
  }

  // Complete tutorial
  static async completeTutorial(request: CompleteTutorialRequest): Promise<TutorialProgress> {
    const { userId, userRole, completionMethod, finalStep, totalSteps, deviceType, sessionData } = request;
    
    try {
      const existingProgress = await db
        .select()
        .from(tutorialProgress)
        .where(
          and(
            eq(tutorialProgress.userId, userId),
            eq(tutorialProgress.userRole, userRole)
          )
        )
        .limit(1);

      if (existingProgress.length > 0) {
        // Update existing progress to completed
        const updated = await db
          .update(tutorialProgress)
          .set({
            isCompleted: true,
            currentStep: finalStep,
            totalSteps,
            completionMethod,
            completedAt: completionMethod === 'completed' ? new Date() : null,
            skippedAt: completionMethod === 'skipped' ? new Date() : null,
            deviceType,
            sessionData: sessionData ? JSON.stringify(sessionData) : null,
            updatedAt: new Date()
          })
          .where(eq(tutorialProgress.id, existingProgress[0].id))
          .returning();

        return updated[0];
      } else {
        // Create new completed progress
        const newProgress = await db
          .insert(tutorialProgress)
          .values({
            userId,
            userRole,
            isCompleted: true,
            currentStep: finalStep,
            totalSteps,
            completionMethod,
            completedAt: completionMethod === 'completed' ? new Date() : null,
            skippedAt: completionMethod === 'skipped' ? new Date() : null,
            deviceType,
            sessionData: sessionData ? JSON.stringify(sessionData) : null,
            lastAccessedAt: new Date()
          })
          .returning();

        return newProgress[0];
      }
    } catch (error) {
      console.error('[TUTORIAL_SERVICE] Error completing tutorial:', error);
      throw new Error('Failed to complete tutorial');
    }
  }

  // Reset tutorial for a user
  static async resetTutorial(userId: number, userRole: string): Promise<boolean> {
    try {
      await db
        .delete(tutorialProgress)
        .where(
          and(
            eq(tutorialProgress.userId, userId),
            eq(tutorialProgress.userRole, userRole)
          )
        );

      console.log(`[TUTORIAL_SERVICE] Tutorial reset for user ${userId} with role ${userRole}`);
      return true;
    } catch (error) {
      console.error('[TUTORIAL_SERVICE] Error resetting tutorial:', error);
      throw new Error('Failed to reset tutorial');
    }
  }

  // Get tutorial analytics (for admin dashboard)
  static async getTutorialAnalytics() {
    try {
      const analytics = await db
        .select({
          userRole: tutorialProgress.userRole,
          totalUsers: db.$count(tutorialProgress.userId),
          completedUsers: db.$count(tutorialProgress.userId, eq(tutorialProgress.isCompleted, true)),
          skippedUsers: db.$count(tutorialProgress.userId, eq(tutorialProgress.completionMethod, 'skipped'))
        })
        .from(tutorialProgress)
        .groupBy(tutorialProgress.userRole);

      return analytics;
    } catch (error) {
      console.error('[TUTORIAL_SERVICE] Error getting tutorial analytics:', error);
      throw new Error('Failed to get tutorial analytics');
    }
  }

  // Record step completion (detailed tracking)
  static async recordStepCompletion(progressId: number, stepNumber: number, stepId: string, timeSpent?: number): Promise<TutorialStep> {
    try {
      const step = await db
        .insert(tutorialSteps)
        .values({
          progressId,
          stepNumber,
          stepId,
          isCompleted: true,
          timeSpent,
          completedAt: new Date()
        })
        .returning();

      return step[0];
    } catch (error) {
      console.error('[TUTORIAL_SERVICE] Error recording step completion:', error);
      throw new Error('Failed to record step completion');
    }
  }
}

export default TutorialService;
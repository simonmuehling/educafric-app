import { apiRequest } from '@/lib/queryClient';
import type {
  TutorialStatusResponse,
  UpdateTutorialProgressRequest,
  CompleteTutorialRequest
} from '@shared/tutorialSchema';

export class TutorialApi {
  // Get tutorial status for current user
  static async getTutorialStatus(userRole: string, tutorialVersion = "1.0"): Promise<TutorialStatusResponse> {
    const response = await fetch(`/api/tutorial/status?userRole=${encodeURIComponent(userRole)}&tutorialVersion=${encodeURIComponent(tutorialVersion)}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('[TUTORIAL_API] Failed to get tutorial status:', response.status, response.statusText);
      // Return default tutorial status instead of throwing
      return {
        isCompleted: false,
        currentStep: 0,
        totalSteps: 10,
        userRole: userRole,
        tutorialVersion: tutorialVersion,
        completedSteps: [],
        lastUpdated: new Date().toISOString()
      };
    }

    return response.json();
  }

  // Update tutorial progress
  static async updateProgress(data: Omit<UpdateTutorialProgressRequest, 'userId' | 'userRole'>): Promise<void> {
    await apiRequest('PUT', '/api/tutorial/progress', data);
  }

  // Complete tutorial
  static async completeTutorial(data: Omit<CompleteTutorialRequest, 'userId' | 'userRole'>): Promise<void> {
    await apiRequest('POST', '/api/tutorial/complete', data);
  }

  // Reset tutorial
  static async resetTutorial(userRole: string): Promise<void> {
    await apiRequest('POST', '/api/tutorial/reset', { userRole });
  }

  // Get tutorial analytics (admin only)
  static async getAnalytics() {
    const response = await fetch('/api/tutorial/analytics', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('[TUTORIAL_API] Failed to get tutorial analytics:', response.status, response.statusText);
      // Return empty analytics instead of throwing
      return {
        totalUsers: 0,
        completedTutorials: 0,
        averageCompletionTime: 0,
        mostCommonExitPoint: 'unknown',
        tutorialVersions: []
      };
    }

    return response.json();
  }
}

export default TutorialApi;
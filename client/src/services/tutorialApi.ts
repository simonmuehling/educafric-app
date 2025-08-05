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
      throw new Error(`Failed to get tutorial status: ${response.statusText}`);
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
      throw new Error(`Failed to get tutorial analytics: ${response.statusText}`);
    }

    return response.json();
  }
}

export default TutorialApi;
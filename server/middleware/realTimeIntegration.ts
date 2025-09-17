// ===== REAL-TIME INTEGRATION MIDDLEWARE =====
// Middleware to trigger real-time events from API operations

import { realTimeService } from '../services/realTimeService';
import { Request, Response, NextFunction } from 'express';

// Middleware to broadcast grade status updates
export const broadcastGradeUpdate = (submissionId: number, oldStatus: string, newStatus: string, reviewedBy?: number, feedback?: string) => {
  // Trigger real-time broadcast
  realTimeService.broadcastGradeStatusUpdate(submissionId, oldStatus, newStatus, reviewedBy, feedback);
};

// Middleware to broadcast review queue updates
export const broadcastReviewQueueUpdate = (action: 'ADD' | 'REMOVE' | 'UPDATE', submissionId: number) => {
  realTimeService.broadcastReviewQueueUpdate(action, submissionId);
};

// Middleware to broadcast bulletin progress
export const broadcastBulletinProgress = (classId: number, term: string, schoolId: number) => {
  realTimeService.broadcastBulletinProgress(classId, term, schoolId);
};

// Express middleware to track API operations and trigger real-time updates
export const realTimeTrackingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Store original res.json to intercept responses
  const originalJson = res.json;
  
  res.json = function(body: any) {
    // Trigger real-time events based on API operations
    if (req.path.includes('/grade-entries') && req.method === 'POST') {
      // New grade submission
      if (body.success && body.submissionId) {
        setTimeout(() => {
          broadcastReviewQueueUpdate('ADD', body.submissionId);
        }, 100);
      }
    }
    
    if (req.path.includes('/grade-review/review') && req.method === 'POST') {
      // Grade review action
      if (body.success && body.data) {
        setTimeout(() => {
          broadcastGradeUpdate(
            body.data.submissionId,
            body.data.previousStatus,
            body.data.newStatus,
            body.data.reviewedBy
          );
        }, 100);
      }
    }
    
    if (req.path.includes('/grade-review/bulk-review') && req.method === 'POST') {
      // Bulk review action
      if (body.success && body.data) {
        setTimeout(() => {
          body.data.submissionIds?.forEach((id: number) => {
            broadcastGradeUpdate(id, 'pending', body.data.reviewAction, body.data.reviewedBy);
          });
        }, 100);
      }
    }
    
    // Call original json method
    return originalJson.call(this, body);
  };
  
  next();
};

// Export individual trigger functions for use in route handlers
export {
  broadcastGradeUpdate as triggerGradeUpdate,
  broadcastReviewQueueUpdate as triggerReviewQueueUpdate,
  broadcastBulletinProgress as triggerBulletinProgress
};
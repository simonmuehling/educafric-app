// ===== REAL-TIME SERVICE FOR BULLETIN MANAGEMENT =====
// WebSocket-based real-time updates and conflict resolution

import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { db } from '../db';
import { users, teacherGradeSubmissions, bulletins } from '../../shared/schema';
import { eq, and, sql } from 'drizzle-orm';

// Real-time event types
export interface RealTimeEvent {
  type: string;
  payload: any;
  userId: number;
  schoolId: number;
  timestamp: Date;
  eventId: string;
}

export interface GradeStatusUpdate extends RealTimeEvent {
  type: 'GRADE_STATUS_UPDATE';
  payload: {
    submissionId: number;
    studentId: number;
    subjectId: number;
    classId: number;
    oldStatus: string;
    newStatus: string;
    reviewedBy?: number;
    feedback?: string;
  };
}

export interface ReviewQueueUpdate extends RealTimeEvent {
  type: 'REVIEW_QUEUE_UPDATE';
  payload: {
    action: 'ADD' | 'REMOVE' | 'UPDATE';
    submissionId: number;
    priority: 'urgent' | 'normal' | 'low';
    teacherId: number;
    subjectId: number;
    classId: number;
  };
}

export interface UserPresenceUpdate extends RealTimeEvent {
  type: 'USER_PRESENCE_UPDATE';
  payload: {
    userId: number;
    userName: string;
    userRole: string;
    action: 'CONNECTED' | 'DISCONNECTED' | 'ACTIVE';
    currentModule?: string;
    workingOn?: {
      type: 'GRADE_ENTRY' | 'GRADE_REVIEW' | 'BULLETIN_GENERATION';
      id: number;
      description: string;
    };
  };
}

export interface ConflictAlert extends RealTimeEvent {
  type: 'CONFLICT_ALERT';
  payload: {
    conflictType: 'GRADE_EDIT_CONFLICT' | 'REVIEW_CONFLICT' | 'CONCURRENT_OPERATION';
    resourceId: number;
    resourceType: 'GRADE_SUBMISSION' | 'BULLETIN' | 'STUDENT_RECORD';
    conflictingUserId: number;
    conflictingUserName: string;
    message: string;
    resolution?: 'OVERRIDE' | 'MERGE' | 'WAIT';
  };
}

export interface BulletinProgressUpdate extends RealTimeEvent {
  type: 'BULLETIN_PROGRESS_UPDATE';
  payload: {
    classId: number;
    term: string;
    totalStudents: number;
    completedGrades: number;
    pendingReviews: number;
    generatedBulletins: number;
    progressPercentage: number;
    estimatedCompletion?: Date;
  };
}

// Connected user session management
interface UserSession {
  userId: number;
  userName: string;
  userRole: string;
  schoolId: number;
  websocket: WebSocket;
  lastActivity: Date;
  currentModule?: string;
  workingOn?: {
    type: string;
    id: number;
    description: string;
    startTime: Date;
  };
}

// Global session store
const connectedUsers = new Map<string, UserSession>();
const userWorkingSessions = new Map<string, { userId: number; resourceId: number; resourceType: string; startTime: Date }>();

export class RealTimeService {
  private wss: WebSocketServer | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  // Initialize WebSocket server
  public initialize(server: Server): void {
    this.wss = new WebSocketServer({ 
      server, 
      path: '/ws',
      verifyClient: (info) => {
        // Add basic verification here if needed
        return true;
      }
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    this.startHeartbeat();
    
    console.log('[REALTIME] 🚀 WebSocket server initialized on /ws');
  }

  // Handle new WebSocket connections
  private async handleConnection(ws: WebSocket, request: any): Promise<void> {
    console.log('[REALTIME] 📱 New WebSocket connection established');

    // Handle authentication via URL parameters or headers
    const url = new URL(request.url!, `http://${request.headers.host}`);
    const userId = url.searchParams.get('userId');
    const sessionToken = url.searchParams.get('sessionToken');

    if (!userId) {
      ws.close(1008, 'Authentication required');
      return;
    }

    try {
      // Verify user session
      const user = await this.verifyUserSession(parseInt(userId), sessionToken);
      if (!user) {
        ws.close(1008, 'Invalid session');
        return;
      }

      // Create user session
      const sessionId = `${user.id}-${Date.now()}`;
      const userSession: UserSession = {
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        userRole: user.role,
        schoolId: user.schoolId || 1,
        websocket: ws,
        lastActivity: new Date(),
        currentModule: 'dashboard'
      };

      connectedUsers.set(sessionId, userSession);

      // Setup message handlers
      ws.on('message', (data: Buffer) => this.handleMessage(sessionId, data));
      ws.on('close', () => this.handleDisconnection(sessionId));
      ws.on('error', (error) => console.error('[REALTIME] WebSocket error:', error));

      // Send initial connection confirmation
      this.sendToUser(sessionId, {
        type: 'CONNECTION_ESTABLISHED',
        payload: {
          sessionId,
          user: {
            id: user.id,
            name: userSession.userName,
            role: user.role,
            schoolId: user.schoolId
          },
          timestamp: new Date(),
          server: 'Educafric Real-time Server v1.0'
        },
        userId: user.id,
        schoolId: user.schoolId,
        timestamp: new Date(),
        eventId: this.generateEventId()
      });

      // Broadcast user presence to school members
      this.broadcastToSchool(user.schoolId!, {
        type: 'USER_PRESENCE_UPDATE',
        payload: {
          userId: user.id,
          userName: userSession.userName,
          userRole: user.role,
          action: 'CONNECTED',
          currentModule: 'dashboard'
        },
        userId: user.id,
        schoolId: user.schoolId!,
        timestamp: new Date(),
        eventId: this.generateEventId()
      });

      console.log(`[REALTIME] ✅ User ${userSession.userName} (${user.role}) connected to school ${user.schoolId}`);

    } catch (error) {
      console.error('[REALTIME] ❌ Connection error:', error);
      ws.close(1011, 'Server error');
    }
  }

  // Handle incoming messages from clients
  private async handleMessage(sessionId: string, data: Buffer): Promise<void> {
    try {
      const session = connectedUsers.get(sessionId);
      if (!session) return;

      const message = JSON.parse(data.toString());
      session.lastActivity = new Date();

      switch (message.type) {
        case 'USER_ACTIVITY_UPDATE':
          await this.handleUserActivityUpdate(sessionId, message.payload);
          break;

        case 'GRADE_SUBMISSION_START':
          await this.handleGradeSubmissionStart(sessionId, message.payload);
          break;

        case 'GRADE_SUBMISSION_END':
          await this.handleGradeSubmissionEnd(sessionId, message.payload);
          break;

        case 'REVIEW_START':
          await this.handleReviewStart(sessionId, message.payload);
          break;

        case 'REVIEW_END':
          await this.handleReviewEnd(sessionId, message.payload);
          break;

        case 'REQUEST_SYNC':
          await this.handleSyncRequest(sessionId, message.payload);
          break;

        case 'HEARTBEAT':
          // Respond to heartbeat
          this.sendToUser(sessionId, {
            type: 'HEARTBEAT_ACK',
            payload: { timestamp: new Date() },
            userId: session.userId,
            schoolId: session.schoolId,
            timestamp: new Date(),
            eventId: this.generateEventId()
          });
          break;

        default:
          console.warn('[REALTIME] ⚠️ Unknown message type:', message.type);
      }

    } catch (error) {
      console.error('[REALTIME] ❌ Message handling error:', error);
    }
  }

  // Handle user disconnection
  private handleDisconnection(sessionId: string): void {
    const session = connectedUsers.get(sessionId);
    if (!session) return;

    // Clean up working sessions
    const workingKey = `${session.userId}-${sessionId}`;
    userWorkingSessions.delete(workingKey);

    // Broadcast user disconnection
    this.broadcastToSchool(session.schoolId, {
      type: 'USER_PRESENCE_UPDATE',
      payload: {
        userId: session.userId,
        userName: session.userName,
        userRole: session.userRole,
        action: 'DISCONNECTED'
      },
      userId: session.userId,
      schoolId: session.schoolId,
      timestamp: new Date(),
      eventId: this.generateEventId()
    });

    connectedUsers.delete(sessionId);
    console.log(`[REALTIME] 👋 User ${session.userName} disconnected`);
  }

  // === GRADE MANAGEMENT REAL-TIME HANDLERS ===

  // Handle grade submission status updates
  public async broadcastGradeStatusUpdate(submissionId: number, oldStatus: string, newStatus: string, reviewedBy?: number, feedback?: string): Promise<void> {
    try {
      // Get submission details
      const submission = await db.select({
        id: teacherGradeSubmissions.id,
        studentId: teacherGradeSubmissions.studentId,
        teacherId: teacherGradeSubmissions.teacherId,
        subjectId: teacherGradeSubmissions.subjectId,
        classId: teacherGradeSubmissions.classId,
        schoolId: teacherGradeSubmissions.schoolId
      })
      .from(teacherGradeSubmissions)
      .where(eq(teacherGradeSubmissions.id, submissionId))
      .limit(1);

      if (!submission.length) return;

      const sub = submission[0];

      const event: GradeStatusUpdate = {
        type: 'GRADE_STATUS_UPDATE',
        payload: {
          submissionId,
          studentId: sub.studentId,
          subjectId: sub.subjectId,
          classId: sub.classId,
          oldStatus,
          newStatus,
          reviewedBy,
          feedback
        },
        userId: reviewedBy || 0,
        schoolId: sub.schoolId,
        timestamp: new Date(),
        eventId: this.generateEventId()
      };

      // Broadcast to all school members
      this.broadcastToSchool(sub.schoolId, event);

      // Send specific notification to teacher if their submission was reviewed
      if (newStatus !== 'pending' && sub.teacherId) {
        this.sendToSpecificUser(sub.teacherId, {
          type: 'TEACHER_NOTIFICATION',
          payload: {
            message: `Your grade submission for subject ${sub.subjectId} has been ${newStatus}`,
            submissionId,
            newStatus,
            feedback
          },
          userId: reviewedBy || 0,
          schoolId: sub.schoolId,
          timestamp: new Date(),
          eventId: this.generateEventId()
        });
      }

      console.log(`[REALTIME] 📊 Grade status update broadcasted: ${submissionId} ${oldStatus} → ${newStatus}`);

    } catch (error) {
      console.error('[REALTIME] ❌ Error broadcasting grade status update:', error);
    }
  }

  // Handle review queue updates
  public async broadcastReviewQueueUpdate(action: 'ADD' | 'REMOVE' | 'UPDATE', submissionId: number): Promise<void> {
    try {
      // Get submission details for context
      const submission = await db.select({
        teacherId: teacherGradeSubmissions.teacherId,
        subjectId: teacherGradeSubmissions.subjectId,
        classId: teacherGradeSubmissions.classId,
        schoolId: teacherGradeSubmissions.schoolId,
        reviewPriority: teacherGradeSubmissions.reviewPriority
      })
      .from(teacherGradeSubmissions)
      .where(eq(teacherGradeSubmissions.id, submissionId))
      .limit(1);

      if (!submission.length) return;

      const sub = submission[0];

      const event: ReviewQueueUpdate = {
        type: 'REVIEW_QUEUE_UPDATE',
        payload: {
          action,
          submissionId,
          priority: (sub.reviewPriority as 'urgent' | 'normal' | 'low') || 'normal',
          teacherId: sub.teacherId,
          subjectId: sub.subjectId,
          classId: sub.classId
        },
        userId: 0,
        schoolId: sub.schoolId,
        timestamp: new Date(),
        eventId: this.generateEventId()
      };

      // Send to directors only
      this.broadcastToRole(sub.schoolId, 'Director', event);
      this.broadcastToRole(sub.schoolId, 'Admin', event);

      console.log(`[REALTIME] 📋 Review queue update: ${action} submission ${submissionId}`);

    } catch (error) {
      console.error('[REALTIME] ❌ Error broadcasting review queue update:', error);
    }
  }

  // Handle bulletin progress updates
  public async broadcastBulletinProgress(classId: number, term: string, schoolId: number): Promise<void> {
    try {
      // Calculate bulletin progress for the class
      const progressData = await this.calculateBulletinProgress(classId, term, schoolId);

      const event: BulletinProgressUpdate = {
        type: 'BULLETIN_PROGRESS_UPDATE',
        payload: progressData,
        userId: 0,
        schoolId,
        timestamp: new Date(),
        eventId: this.generateEventId()
      };

      this.broadcastToSchool(schoolId, event);
      console.log(`[REALTIME] 📈 Bulletin progress update: Class ${classId}, ${progressData.progressPercentage}% complete`);

    } catch (error) {
      console.error('[REALTIME] ❌ Error broadcasting bulletin progress:', error);
    }
  }

  // === CONFLICT RESOLUTION ===

  // Check for conflicts before starting work
  public async checkForConflicts(userId: number, resourceType: string, resourceId: number): Promise<ConflictAlert | null> {
    const conflictKey = `${resourceType}-${resourceId}`;
    
    for (const [sessionId, session] of userWorkingSessions.entries()) {
      const currentKey = `${session.resourceType}-${session.resourceId}`;
      
      if (currentKey === conflictKey && session.userId !== userId) {
        // Conflict detected - someone else is working on this resource
        const conflictingUser = await this.getUserById(session.userId);
        
        return {
          type: 'CONFLICT_ALERT',
          payload: {
            conflictType: resourceType === 'GRADE_SUBMISSION' ? 'GRADE_EDIT_CONFLICT' : 'REVIEW_CONFLICT',
            resourceId,
            resourceType: resourceType as any,
            conflictingUserId: session.userId,
            conflictingUserName: conflictingUser?.name || 'Unknown User',
            message: `${conflictingUser?.name || 'Another user'} is currently working on this ${resourceType.toLowerCase()}`,
            resolution: 'WAIT'
          },
          userId,
          schoolId: 0,
          timestamp: new Date(),
          eventId: this.generateEventId()
        };
      }
    }

    return null;
  }

  // === ACTIVITY HANDLERS ===

  private async handleUserActivityUpdate(sessionId: string, payload: any): Promise<void> {
    const session = connectedUsers.get(sessionId);
    if (!session) return;

    session.currentModule = payload.module;
    session.workingOn = payload.workingOn;

    // Broadcast activity update
    this.broadcastToSchool(session.schoolId, {
      type: 'USER_PRESENCE_UPDATE',
      payload: {
        userId: session.userId,
        userName: session.userName,
        userRole: session.userRole,
        action: 'ACTIVE',
        currentModule: payload.module,
        workingOn: payload.workingOn
      },
      userId: session.userId,
      schoolId: session.schoolId,
      timestamp: new Date(),
      eventId: this.generateEventId()
    });
  }

  private async handleGradeSubmissionStart(sessionId: string, payload: any): Promise<void> {
    const session = connectedUsers.get(sessionId);
    if (!session) return;

    const workingKey = `${session.userId}-${sessionId}`;
    userWorkingSessions.set(workingKey, {
      userId: session.userId,
      resourceId: payload.submissionId,
      resourceType: 'GRADE_SUBMISSION',
      startTime: new Date()
    });

    // Check for conflicts
    const conflict = await this.checkForConflicts(session.userId, 'GRADE_SUBMISSION', payload.submissionId);
    if (conflict) {
      this.sendToUser(sessionId, conflict);
    }
  }

  private async handleGradeSubmissionEnd(sessionId: string, payload: any): Promise<void> {
    const session = connectedUsers.get(sessionId);
    if (!session) return;

    const workingKey = `${session.userId}-${sessionId}`;
    userWorkingSessions.delete(workingKey);
  }

  private async handleReviewStart(sessionId: string, payload: any): Promise<void> {
    const session = connectedUsers.get(sessionId);
    if (!session) return;

    const workingKey = `${session.userId}-${sessionId}`;
    userWorkingSessions.set(workingKey, {
      userId: session.userId,
      resourceId: payload.submissionId,
      resourceType: 'GRADE_REVIEW',
      startTime: new Date()
    });

    // Notify others that this submission is being reviewed
    this.broadcastToRole(session.schoolId, 'Director', {
      type: 'REVIEW_SESSION_START',
      payload: {
        submissionId: payload.submissionId,
        reviewerId: session.userId,
        reviewerName: session.userName
      },
      userId: session.userId,
      schoolId: session.schoolId,
      timestamp: new Date(),
      eventId: this.generateEventId()
    });
  }

  private async handleReviewEnd(sessionId: string, payload: any): Promise<void> {
    const session = connectedUsers.get(sessionId);
    if (!session) return;

    const workingKey = `${session.userId}-${sessionId}`;
    userWorkingSessions.delete(workingKey);
  }

  private async handleSyncRequest(sessionId: string, payload: any): Promise<void> {
    const session = connectedUsers.get(sessionId);
    if (!session) return;

    // Send current state data based on request type
    switch (payload.syncType) {
      case 'REVIEW_QUEUE':
        // Send current review queue state
        // This would fetch current queue data and send it
        break;
      case 'GRADE_STATUS':
        // Send current grade submission statuses
        break;
      case 'USER_PRESENCE':
        // Send current connected users
        const connectedUsersInSchool = this.getConnectedUsersInSchool(session.schoolId);
        this.sendToUser(sessionId, {
          type: 'USER_PRESENCE_SYNC',
          payload: { connectedUsers: connectedUsersInSchool },
          userId: session.userId,
          schoolId: session.schoolId,
          timestamp: new Date(),
          eventId: this.generateEventId()
        });
        break;
    }
  }

  // === UTILITY METHODS ===

  // Send message to specific user
  private sendToUser(sessionId: string, event: RealTimeEvent): void {
    const session = connectedUsers.get(sessionId);
    if (session && session.websocket.readyState === WebSocket.OPEN) {
      try {
        session.websocket.send(JSON.stringify(event));
      } catch (error) {
        console.error('[REALTIME] ❌ Error sending to user:', error);
      }
    }
  }

  // Send message to specific user by ID
  private sendToSpecificUser(userId: number, event: RealTimeEvent): void {
    for (const [sessionId, session] of connectedUsers.entries()) {
      if (session.userId === userId) {
        this.sendToUser(sessionId, event);
      }
    }
  }

  // Broadcast to all users in a school
  private broadcastToSchool(schoolId: number, event: RealTimeEvent): void {
    for (const [sessionId, session] of connectedUsers.entries()) {
      if (session.schoolId === schoolId) {
        this.sendToUser(sessionId, event);
      }
    }
  }

  // Broadcast to specific role in a school
  private broadcastToRole(schoolId: number, role: string, event: RealTimeEvent): void {
    for (const [sessionId, session] of connectedUsers.entries()) {
      if (session.schoolId === schoolId && session.userRole === role) {
        this.sendToUser(sessionId, event);
      }
    }
  }

  // Get connected users in school
  private getConnectedUsersInSchool(schoolId: number): UserSession[] {
    return Array.from(connectedUsers.values()).filter(session => session.schoolId === schoolId);
  }

  // Calculate bulletin progress for a class
  private async calculateBulletinProgress(classId: number, term: string, schoolId: number): Promise<any> {
    try {
      // This would calculate actual progress based on grades and bulletins
      // For now, return mock data structure
      return {
        classId,
        term,
        totalStudents: 30,
        completedGrades: 25,
        pendingReviews: 5,
        generatedBulletins: 20,
        progressPercentage: 83.3
      };
    } catch (error) {
      console.error('[REALTIME] Error calculating bulletin progress:', error);
      return { classId, term, progressPercentage: 0 };
    }
  }

  // Verify user session
  private async verifyUserSession(userId: number, sessionToken: string | null): Promise<any> {
    try {
      // For now, just verify user exists
      // In production, would verify session token
      const user = await db.select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      return user.length > 0 ? user[0] : null;
    } catch (error) {
      console.error('[REALTIME] Error verifying user session:', error);
      return null;
    }
  }

  // Get user by ID
  private async getUserById(userId: number): Promise<{ name: string } | null> {
    try {
      const user = await db.select({
        firstName: users.firstName,
        lastName: users.lastName
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

      return user.length > 0 ? { name: `${user[0].firstName} ${user[0].lastName}` } : null;
    } catch (error) {
      console.error('[REALTIME] Error getting user:', error);
      return null;
    }
  }

  // Generate unique event ID
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Start heartbeat to keep connections alive
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      const now = new Date();
      
      // Clean up stale connections
      for (const [sessionId, session] of connectedUsers.entries()) {
        const timeSinceActivity = now.getTime() - session.lastActivity.getTime();
        
        if (timeSinceActivity > 300000) { // 5 minutes
          console.log(`[REALTIME] 🧹 Cleaning up stale connection for ${session.userName}`);
          session.websocket.close();
          this.handleDisconnection(sessionId);
        } else if (session.websocket.readyState === WebSocket.OPEN) {
          // Send heartbeat
          try {
            session.websocket.ping();
          } catch (error) {
            console.error('[REALTIME] Heartbeat error:', error);
          }
        }
      }
    }, 30000); // Every 30 seconds
  }

  // Get current stats
  public getStats(): { connectedUsers: number; activeConnections: number; workingSessions: number } {
    return {
      connectedUsers: connectedUsers.size,
      activeConnections: Array.from(connectedUsers.values()).filter(s => s.websocket.readyState === WebSocket.OPEN).length,
      workingSessions: userWorkingSessions.size
    };
  }

  // Cleanup on shutdown
  public cleanup(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    if (this.wss) {
      this.wss.close();
    }
    
    connectedUsers.clear();
    userWorkingSessions.clear();
    console.log('[REALTIME] 🛑 Real-time service cleaned up');
  }
}

// Export singleton instance
export const realTimeService = new RealTimeService();
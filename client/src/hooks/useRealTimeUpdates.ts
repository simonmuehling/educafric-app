// ===== REAL-TIME UPDATES HOOK =====
// React hook for managing WebSocket connections and real-time events

import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Real-time event types
export interface RealTimeEvent {
  type: string;
  payload: any;
  userId: number;
  schoolId: number;
  timestamp: string;
  eventId: string;
}

export interface UseRealTimeOptions {
  onGradeStatusUpdate?: (event: any) => void;
  onReviewQueueUpdate?: (event: any) => void;
  onUserPresenceUpdate?: (event: any) => void;
  onConflictAlert?: (event: any) => void;
  onBulletinProgress?: (event: any) => void;
  autoReconnect?: boolean;
  enableToasts?: boolean;
}

export interface RealTimeState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  lastEventTime: Date | null;
  connectedUsers: any[];
  serverStats: {
    connectedUsers: number;
    activeConnections: number;
  } | null;
}

export const useRealTimeUpdates = (options: UseRealTimeOptions = {}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // WebSocket reference
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // State management
  const [state, setState] = useState<RealTimeState>({
    connected: false,
    connecting: false,
    error: null,
    lastEventTime: null,
    connectedUsers: [],
    serverStats: null
  });

  // Default options
  const {
    onGradeStatusUpdate,
    onReviewQueueUpdate,
    onUserPresenceUpdate,
    onConflictAlert,
    onBulletinProgress,
    autoReconnect = true,
    enableToasts = true
  } = options;

  // WebSocket URL
  const getWebSocketURL = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    let host = window.location.host;
    
    // Handle cases where host might be undefined or empty
    if (!host) {
      // Fallback for development environment
      const hostname = window.location.hostname || 'localhost';
      const port = window.location.port || '5000';
      host = `${hostname}:${port}`;
      console.log('[REALTIME] 🔧 Using fallback host:', host);
    }
    
    // Remove insecure sessionToken from URL - authentication should be handled via headers or cookies
    const url = `${protocol}//${host}/ws?userId=${user?.id}`;
    console.log('[REALTIME] 📡 WebSocket URL:', url);
    return url;
  }, [user?.id]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!user?.id || wsRef.current?.readyState === WebSocket.CONNECTING) return;

    setState(prev => ({ ...prev, connecting: true, error: null }));

    try {
      const ws = new WebSocket(getWebSocketURL());
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[REALTIME] 🚀 WebSocket connected');
        setState(prev => ({ 
          ...prev, 
          connected: true, 
          connecting: false, 
          error: null 
        }));

        // Start heartbeat
        startHeartbeat();

        if (enableToasts) {
          toast({
            title: 'Real-time updates enabled',
            description: 'You will receive live notifications about grade submissions and reviews.',
          });
        }
      };

      ws.onmessage = (event) => {
        try {
          const data: RealTimeEvent = JSON.parse(event.data);
          handleRealTimeEvent(data);
        } catch (error) {
          console.error('[REALTIME] ❌ Error parsing message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('[REALTIME] 🔌 WebSocket disconnected', event.code, event.reason);
        setState(prev => ({ 
          ...prev, 
          connected: false, 
          connecting: false 
        }));

        stopHeartbeat();

        // Auto-reconnect if enabled and connection wasn't closed intentionally
        if (autoReconnect && event.code !== 1000) {
          scheduleReconnect();
        }
      };

      ws.onerror = (error) => {
        console.error('[REALTIME] ❌ WebSocket error:', error);
        setState(prev => ({ 
          ...prev, 
          error: 'Connection error', 
          connecting: false 
        }));
      };

    } catch (error) {
      console.error('[REALTIME] ❌ Connection failed:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to connect', 
        connecting: false 
      }));
    }
  }, [user?.id, getWebSocketURL, autoReconnect, enableToasts, toast]);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close(1000, 'User requested disconnect');
      wsRef.current = null;
    }
    
    stopHeartbeat();
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Schedule reconnection
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) return;

    reconnectTimeoutRef.current = setTimeout(() => {
      console.log('[REALTIME] 🔄 Attempting to reconnect...');
      reconnectTimeoutRef.current = null;
      connect();
    }, 3000); // Reconnect after 3 seconds
  }, [connect]);

  // Send message to server
  const sendMessage = useCallback((type: string, payload: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({
          type,
          payload,
          timestamp: new Date().toISOString()
        }));
      } catch (error) {
        console.error('[REALTIME] ❌ Error sending message:', error);
      }
    }
  }, []);

  // Handle incoming real-time events
  const handleRealTimeEvent = useCallback((event: RealTimeEvent) => {
    console.log('[REALTIME] 📨 Received event:', event.type, event.payload);
    
    setState(prev => ({ ...prev, lastEventTime: new Date() }));

    switch (event.type) {
      case 'CONNECTION_ESTABLISHED':
        console.log('[REALTIME] ✅ Connection established:', event.payload);
        break;

      case 'GRADE_STATUS_UPDATE':
        handleGradeStatusUpdate(event);
        break;

      case 'REVIEW_QUEUE_UPDATE':
        handleReviewQueueUpdate(event);
        break;

      case 'USER_PRESENCE_UPDATE':
        handleUserPresenceUpdate(event);
        break;

      case 'CONFLICT_ALERT':
        handleConflictAlert(event);
        break;

      case 'BULLETIN_PROGRESS_UPDATE':
        handleBulletinProgress(event);
        break;

      case 'TEACHER_NOTIFICATION':
        handleTeacherNotification(event);
        break;

      case 'REVIEW_SESSION_START':
        handleReviewSessionStart(event);
        break;

      case 'USER_PRESENCE_SYNC':
        setState(prev => ({ 
          ...prev, 
          connectedUsers: event.payload.connectedUsers 
        }));
        break;

      case 'HEARTBEAT_ACK':
        // Heartbeat acknowledged
        break;

      default:
        console.warn('[REALTIME] ⚠️ Unknown event type:', event.type);
    }
  }, []);

  // Handle grade status updates
  const handleGradeStatusUpdate = useCallback((event: RealTimeEvent) => {
    const { submissionId, oldStatus, newStatus, feedback } = event.payload;
    
    // Invalidate relevant queries
    queryClient.invalidateQueries({ queryKey: ['/api/teacher/grade-entries'] });
    queryClient.invalidateQueries({ queryKey: ['/api/grade-review/queue'] });
    
    // Call custom handler
    onGradeStatusUpdate?.(event.payload);

    // Show toast notification
    if (enableToasts) {
      const statusMap: Record<string, string> = {
        'approved': '✅ Approved',
        'returned': '↩️ Returned',
        'changes_requested': '🔄 Changes requested',
        'under_review': '👀 Under review'
      };

      toast({
        title: `Grade submission ${statusMap[newStatus] || newStatus}`,
        description: feedback || `Your grade submission status changed to ${newStatus}`,
        variant: newStatus === 'approved' ? 'default' : newStatus === 'returned' ? 'destructive' : 'default'
      });
    }
  }, [queryClient, onGradeStatusUpdate, enableToasts, toast]);

  // Handle review queue updates
  const handleReviewQueueUpdate = useCallback((event: RealTimeEvent) => {
    const { action, submissionId, priority } = event.payload;
    
    // Invalidate review queue queries
    queryClient.invalidateQueries({ queryKey: ['/api/grade-review/queue'] });
    queryClient.invalidateQueries({ queryKey: ['/api/grade-review/statistics'] });
    
    // Call custom handler
    onReviewQueueUpdate?.(event.payload);

    // Show notification for directors
    if (enableToasts && user?.role === 'Director' && action === 'ADD') {
      toast({
        title: 'New grade submission for review',
        description: `A grade submission requires your review${priority === 'urgent' ? ' (URGENT)' : ''}`,
        variant: priority === 'urgent' ? 'destructive' : 'default'
      });
    }
  }, [queryClient, onReviewQueueUpdate, enableToasts, user?.role, toast]);

  // Handle user presence updates
  const handleUserPresenceUpdate = useCallback((event: RealTimeEvent) => {
    const { userId, userName, action } = event.payload;
    
    setState(prev => {
      const updatedUsers = [...prev.connectedUsers];
      const existingIndex = updatedUsers.findIndex(u => u.userId === userId);
      
      if (action === 'DISCONNECTED') {
        if (existingIndex !== -1) {
          updatedUsers.splice(existingIndex, 1);
        }
      } else {
        if (existingIndex !== -1) {
          updatedUsers[existingIndex] = { ...updatedUsers[existingIndex], ...event.payload };
        } else {
          updatedUsers.push(event.payload);
        }
      }
      
      return { ...prev, connectedUsers: updatedUsers };
    });

    // Call custom handler
    onUserPresenceUpdate?.(event.payload);
  }, [onUserPresenceUpdate]);

  // Handle conflict alerts
  const handleConflictAlert = useCallback((event: RealTimeEvent) => {
    const { conflictType, message, conflictingUserName } = event.payload;
    
    // Call custom handler
    onConflictAlert?.(event.payload);

    // Show warning toast
    if (enableToasts) {
      toast({
        title: 'Conflict detected',
        description: message,
        variant: 'destructive'
      });
    }
  }, [onConflictAlert, enableToasts, toast]);

  // Handle bulletin progress updates
  const handleBulletinProgress = useCallback((event: RealTimeEvent) => {
    // Invalidate bulletin-related queries
    queryClient.invalidateQueries({ queryKey: ['/api/bulletins'] });
    
    // Call custom handler
    onBulletinProgress?.(event.payload);
  }, [queryClient, onBulletinProgress]);

  // Handle teacher notifications
  const handleTeacherNotification = useCallback((event: RealTimeEvent) => {
    const { message, newStatus } = event.payload;
    
    if (enableToasts) {
      toast({
        title: 'Grade submission update',
        description: message,
        variant: newStatus === 'approved' ? 'default' : 'destructive'
      });
    }
  }, [enableToasts, toast]);

  // Handle review session start
  const handleReviewSessionStart = useCallback((event: RealTimeEvent) => {
    const { reviewerName } = event.payload;
    
    if (enableToasts && user?.role === 'Director') {
      toast({
        title: 'Review in progress',
        description: `${reviewerName} is reviewing a grade submission`,
      });
    }
  }, [enableToasts, user?.role, toast]);

  // Start heartbeat
  const startHeartbeat = useCallback(() => {
    heartbeatTimeoutRef.current = setInterval(() => {
      sendMessage('HEARTBEAT', { timestamp: new Date().toISOString() });
    }, 30000); // Every 30 seconds
  }, [sendMessage]);

  // Stop heartbeat
  const stopHeartbeat = useCallback(() => {
    if (heartbeatTimeoutRef.current) {
      clearInterval(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }
  }, []);

  // Utility functions for specific use cases
  const notifyActivity = useCallback((module: string, workingOn?: any) => {
    sendMessage('USER_ACTIVITY_UPDATE', { module, workingOn });
  }, [sendMessage]);

  const notifyGradeSubmissionStart = useCallback((submissionId: number) => {
    sendMessage('GRADE_SUBMISSION_START', { submissionId });
  }, [sendMessage]);

  const notifyGradeSubmissionEnd = useCallback((submissionId: number) => {
    sendMessage('GRADE_SUBMISSION_END', { submissionId });
  }, [sendMessage]);

  const notifyReviewStart = useCallback((submissionId: number) => {
    sendMessage('REVIEW_START', { submissionId });
  }, [sendMessage]);

  const notifyReviewEnd = useCallback((submissionId: number) => {
    sendMessage('REVIEW_END', { submissionId });
  }, [sendMessage]);

  const requestSync = useCallback((syncType: 'REVIEW_QUEUE' | 'GRADE_STATUS' | 'USER_PRESENCE') => {
    sendMessage('REQUEST_SYNC', { syncType });
  }, [sendMessage]);

  // Auto-connect when user is available
  useEffect(() => {
    if (user?.id) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [user?.id, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    // State
    ...state,
    
    // Actions
    connect,
    disconnect,
    sendMessage,
    
    // Utility functions
    notifyActivity,
    notifyGradeSubmissionStart,
    notifyGradeSubmissionEnd,
    notifyReviewStart,
    notifyReviewEnd,
    requestSync,
    
    // Connection status helpers
    isConnected: state.connected,
    isConnecting: state.connecting,
    hasError: !!state.error
  };
};
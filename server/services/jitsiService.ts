// Jitsi Meet JWT Service
// Generates secure JWT tokens for Jitsi Meet authentication

import jwt from 'jsonwebtoken';
import crypto from 'crypto';

interface JitsiJwtPayload {
  room: string;
  displayName: string;
  userId: string | number;
  role: 'teacher' | 'student' | 'observer' | 'parent';
  email?: string;
  avatar?: string;
}

interface JitsiTokenOptions {
  domain?: string;
  appId?: string;
  appSecret?: string;
  expirationMinutes?: number;
}

class JitsiService {
  private domain: string;
  private appId: string;
  private appSecret: string;
  private defaultExpiration: number = 60; // 1 hour in minutes

  constructor() {
    // Initialize with meet.educafric.com configuration
    this.domain = process.env.JITSI_DOMAIN || 'meet.educafric.com';
    this.appId = process.env.JITSI_APP_ID || 'educafric-app';
    this.appSecret = process.env.JITSI_APP_SECRET || 'educafric-default-secret-2024-secure';

    console.log(`[JITSI_SERVICE] ✅ Initialized for domain: ${this.domain}, app: ${this.appId}`);
    console.log(`[JITSI_SERVICE] 📹 Video conferencing ready with secure authentication`);
  }

  /**
   * Generate a secure room name for a class session
   */
  generateRoomName(courseId: number, sessionId?: number): string {
    const timestamp = Date.now().toString(36);
    const randomBytes = crypto.randomBytes(8).toString('hex');
    
    if (sessionId) {
      return `course${courseId}-session${sessionId}-${timestamp}-${randomBytes}`;
    } else {
      return `course${courseId}-${timestamp}-${randomBytes}`;
    }
  }

  /**
   * Generate JWT token for Jitsi Meet access
   */
  generateJwtToken(payload: JitsiJwtPayload, options: JitsiTokenOptions = {}): string {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + (options.expirationMinutes || this.defaultExpiration) * 60;
    const nbf = now - 10; // Allow 10 seconds clock skew

    const domain = options.domain || this.domain;
    const appId = options.appId || this.appId;
    const appSecret = options.appSecret || this.appSecret;

    if (!appSecret) {
      throw new Error('Jitsi app secret not configured');
    }

    // Determine if user is moderator (teachers are moderators)
    const isModerator = payload.role === 'teacher';

    const jwtPayload = {
      // Standard JWT fields
      aud: 'jitsi',
      iss: appId,
      sub: domain,
      room: payload.room,
      exp,
      nbf,
      
      // Jitsi-specific context
      context: {
        user: {
          id: String(payload.userId),
          name: payload.displayName,
          email: payload.email,
          avatar: payload.avatar,
          moderator: isModerator // Critical: Explicit moderator flag for Jitsi
        },
        // Set user role for moderation permissions
        userRole: isModerator ? 'moderator' : 'participant',
        group: payload.role, // Additional grouping info
        
        // Features and permissions
        features: {
          recording: isModerator, // Only moderators can start recording
          livestreaming: isModerator,
          'screen-sharing': true,
          'audio-only': false,
          'private-chat': true,
          chat: true
        }
      }
    };

    try {
      const token = jwt.sign(jwtPayload, appSecret, { algorithm: 'HS256' });
      
      console.log(`[JITSI_JWT] ✅ Generated token for ${payload.displayName} (${payload.role}) in room ${payload.room}`);
      
      return token;
    } catch (error) {
      console.error('[JITSI_JWT] ❌ Failed to generate JWT token:', error);
      throw new Error('Failed to generate Jitsi JWT token');
    }
  }

  /**
   * Create join URL with embedded JWT
   */
  createJoinUrl(roomName: string, token: string, options?: {
    startWithAudioMuted?: boolean;
    startWithVideoMuted?: boolean;
    requireDisplayName?: boolean;
  }): string {
    const baseUrl = `https://${this.domain}/${roomName}`;
    const params = new URLSearchParams({
      jwt: token
    });

    // Add optional URL parameters
    if (options?.startWithAudioMuted) {
      params.append('config.startWithAudioMuted', 'true');
    }
    if (options?.startWithVideoMuted) {
      params.append('config.startWithVideoMuted', 'true');
    }
    if (options?.requireDisplayName) {
      params.append('config.requireDisplayName', 'true');
    }

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Validate that a JWT token is still valid
   */
  validateToken(token: string): boolean {
    try {
      const decoded = jwt.verify(token, this.appSecret) as any;
      const now = Math.floor(Date.now() / 1000);
      
      return decoded.exp > now;
    } catch (error) {
      console.error('[JITSI_JWT] Token validation failed:', error);
      return false;
    }
  }

  /**
   * Generate Jitsi configuration for embedding
   */
  generateJitsiConfig(roomName: string, token: string, options?: {
    parentNode?: string;
    width?: string | number;
    height?: string | number;
    prejoinPageEnabled?: boolean;
    toolbarButtons?: string[];
    startWithAudioMuted?: boolean;
    startWithVideoMuted?: boolean;
  }) {
    return {
      domain: this.domain,
      roomName,
      jwt: token,
      parentNode: options?.parentNode,
      width: options?.width || '100%',
      height: options?.height || '500px',
      
      // Configuration overrides
      configOverwrite: {
        prejoinPageEnabled: options?.prejoinPageEnabled ?? true,
        disableDeepLinking: true,
        startWithAudioMuted: options?.startWithAudioMuted ?? true,
        startWithVideoMuted: options?.startWithVideoMuted ?? false,
        enableWelcomePage: false,
        enableClosePage: false,
        
        // P2P configuration for better performance
        p2p: {
          enabled: true,
          stunServers: [
            { urls: 'stun:meet-jit-si-turnrelay.jitsi.net:443' }
          ]
        },
        
        // Video quality settings
        constraints: {
          video: {
            aspectRatio: 16 / 9,
            height: {
              ideal: 720,
              max: 720,
              min: 180
            }
          }
        },
        
        // Disable features for educational use
        disableInviteFunctions: true,
        enableEmailInStats: false
      },
      
      // Interface configuration
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: options?.toolbarButtons || [
          'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
          'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
          'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
          'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
          'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone'
        ],
        SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile', 'calendar'],
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        HIDE_INVITE_MORE_HEADER: true,
        MOBILE_APP_PROMO: false,
        NATIVE_APP_NAME: 'Educafric',
        PROVIDER_NAME: 'Educafric',
        SHOW_CHROME_EXTENSION_BANNER: false
      }
    };
  }

  /**
   * Generate quick access configuration for students/parents
   */
  generateGuestConfig(roomName: string, token: string, displayName: string) {
    return this.generateJitsiConfig(roomName, token, {
      prejoinPageEnabled: false,
      startWithAudioMuted: true,
      startWithVideoMuted: true,
      toolbarButtons: [
        'microphone', 'camera', 'hangup', 'chat', 'raisehand',
        'settings', 'tileview'
      ]
    });
  }
}

// Export singleton instance
export const jitsiService = new JitsiService();
export { JitsiService };
export type { JitsiJwtPayload, JitsiTokenOptions };
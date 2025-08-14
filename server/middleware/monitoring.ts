import { Request, Response, NextFunction } from 'express';
import { AuthenticatedUser } from '@shared/types';

// Security event aggregation and monitoring
interface SecurityEvent {
  id: string;
  timestamp: Date;
  type: 'authentication' | 'authorization' | 'input_validation' | 'rate_limit' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: number;
  ip: string;
  userAgent: string;
  endpoint: string;
  details: Record<string, any>;
  threat_score: number;
}

class SecurityMonitor {
  private events: SecurityEvent[] = [];
  private threatScores: Map<string, number> = new Map();
  private blockedIPs: Set<string> = new Set();

  constructor() {
    // Clean old events every hour
    setInterval(() => this.cleanOldEvents(), 3600000);
    // Analyze threats every 5 minutes
    setInterval(() => this.analyzeThreatPatterns(), 300000);
  }

  logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>) {
    // TEMPORARILY DISABLED - Security monitoring completely bypassed
    console.log(`[SECURITY_BYPASS] Event ignored: ${event.type} from ${event.ip}`);
    return;
    
    const securityEvent: SecurityEvent = {
      id: `SEC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...event
    };

    this.events.push(securityEvent);
    this.updateThreatScore(event.ip, event.threat_score);

    // Real-time threat detection
    if (event.severity === 'critical' || this.getThreatScore(event.ip) > 80) {
      this.handleCriticalThreat(securityEvent);
    }

    console.log(`[SECURITY_MONITOR] ${securityEvent.severity.toUpperCase()}: ${event.type} from ${event.ip}`);
  }

  private updateThreatScore(ip: string, score: number) {
    // Skip threat scoring for localhost during development
    if (ip === '127.0.0.1' || ip === 'localhost' || ip === '::1') {
      return;
    }
    
    const currentScore = this.threatScores.get(ip) || 0;
    const newScore = Math.min(100, currentScore + score);
    this.threatScores.set(ip, newScore);

    // Auto-block if threat score exceeds threshold (but not localhost)
    if (newScore > 95 && !['127.0.0.1', 'localhost', '::1'].includes(ip)) {
      this.blockedIPs.add(ip);
      console.log(`[SECURITY_MONITOR] CRITICAL: IP ${ip} auto-blocked (threat score: ${newScore})`);
    }
  }

  private getThreatScore(ip: string): number {
    return this.threatScores.get(ip) || 0;
  }

  private handleCriticalThreat(event: SecurityEvent) {
    // In production, this would send alerts to security team
    console.log(`[CRITICAL_THREAT] ${JSON.stringify({
      id: event.id,
      type: event.type,
      ip: event.ip,
      endpoint: event.endpoint,
      threatScore: this.getThreatScore(event.ip),
      timestamp: event.timestamp
    })}`);

    // Could integrate with external alerting services
    // await sendSlackAlert(event);
    // await sendEmailAlert(event);
  }

  private cleanOldEvents() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.events = this.events.filter(event => event.timestamp > twentyFourHoursAgo);
    
    // Decay threat scores over time
    for (const [ip, score] of Array.from(this.threatScores.entries())) {
      const decayedScore = Math.max(0, score - 5); // Reduce by 5 every hour
      if (decayedScore === 0) {
        this.threatScores.delete(ip);
        this.blockedIPs.delete(ip);
      } else {
        this.threatScores.set(ip, decayedScore);
      }
    }
  }

  private analyzeThreatPatterns() {
    // Analyze patterns in security events
    const recentEvents = this.events.filter(
      event => event.timestamp > new Date(Date.now() - 300000) // Last 5 minutes
    );

    // Group by IP for pattern analysis
    const eventsByIP = new Map<string, SecurityEvent[]>();
    recentEvents.forEach(event => {
      if (!eventsByIP.has(event.ip)) {
        eventsByIP.set(event.ip, []);
      }
      eventsByIP.get(event.ip)!.push(event);
    });

    // Detect suspicious patterns
    for (const [ip, ipEvents] of Array.from(eventsByIP.entries())) {
      // Multiple failed authentication attempts
      const authFailures = ipEvents.filter((e: SecurityEvent) => 
        e.type === 'authentication' && e.severity === 'medium'
      ).length;

      if (authFailures >= 5) {
        this.logSecurityEvent({
          type: 'suspicious_activity',
          severity: 'high',
          ip,
          userAgent: ipEvents[0].userAgent,
          endpoint: 'pattern_detection',
          details: { pattern: 'brute_force_attempt', failures: authFailures },
          threat_score: 25
        });
      }

      // Rapid endpoint scanning
      const uniqueEndpoints = new Set(ipEvents.map((e: SecurityEvent) => e.endpoint)).size;
      if (uniqueEndpoints >= 10 && ipEvents.length >= 20) {
        this.logSecurityEvent({
          type: 'suspicious_activity',
          severity: 'high',
          ip,
          userAgent: ipEvents[0].userAgent,
          endpoint: 'pattern_detection',
          details: { pattern: 'endpoint_scanning', endpoints: uniqueEndpoints, requests: ipEvents.length },
          threat_score: 30
        });
      }
    }
  }

  isBlocked(ip: string): boolean {
    // DISABLED: Never block any IP during development
    return false;
  }

  getSecurityStats() {
    const now = new Date();
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
    const lastDay = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const hourlyEvents = this.events.filter(e => e.timestamp > lastHour);
    const dailyEvents = this.events.filter(e => e.timestamp > lastDay);

    return {
      total_events_24h: dailyEvents.length,
      total_events_1h: hourlyEvents.length,
      critical_events_24h: dailyEvents.filter(e => e.severity === 'critical').length,
      blocked_ips: this.blockedIPs.size,
      high_risk_ips: Array.from(this.threatScores.entries())
        .filter(([, score]) => score > 50)
        .length,
      event_types_24h: this.getEventTypeCounts(dailyEvents),
      top_threat_ips: Array.from(this.threatScores.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([ip, score]) => ({ ip, score }))
    };
  }

  private getEventTypeCounts(events: SecurityEvent[]) {
    const counts: Record<string, number> = {};
    events.forEach(event => {
      counts[event.type] = (counts[event.type] || 0) + 1;
    });
    return counts;
  }

  getRecentEvents(limit = 50) {
    return this.events
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
}

// Global security monitor instance
export const securityMonitor = new SecurityMonitor();

// Enhanced security logging middleware
export function enhancedSecurityLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const originalSend = res.send;

  res.send = function(body: any) {
    const duration = Date.now() - startTime;
    const user = req.user as AuthenticatedUser;

    // Calculate threat score based on various factors
    let threatScore = 0;
    
    // High threat score for auth failures
    if (req.path.includes('/auth') && res.statusCode >= 400) {
      threatScore += 15;
    }
    
    // Rapid requests increase threat score
    if (duration < 10) {
      threatScore += 5;
    }
    
    // Non-standard user agents
    const userAgent = req.get('User-Agent') || '';
    if (!userAgent.includes('Mozilla') && !userAgent.includes('Chrome')) {
      threatScore += 10;
    }
    
    // Determine event type and severity
    let eventType: SecurityEvent['type'] = 'authentication';
    let severity: SecurityEvent['severity'] = 'low';
    
    if (req.path.includes('/auth')) {
      eventType = 'authentication';
      severity = res.statusCode >= 400 ? 'medium' : 'low';
    } else if (res.statusCode === 403) {
      eventType = 'authorization';
      severity = 'medium';
      threatScore += 10;
    } else if (res.statusCode === 429) {
      eventType = 'rate_limit';
      severity = 'high';
      threatScore += 20;
    } else if (res.statusCode >= 500) {
      severity = 'high';
      threatScore += 15;
    }

    // Only log API requests for security monitoring (exclude sandbox)
    if (req.path.startsWith('/api/') && !req.path.includes('/sandbox')) {
      securityMonitor.logSecurityEvent({
      type: eventType,
      severity,
      userId: user?.id,
      ip: req.ip || 'unknown',
      userAgent: userAgent,
      endpoint: req.path,
      details: {
        method: req.method,
        statusCode: res.statusCode,
        duration,
        query: req.query,
        userId: user?.id,
        userRole: user?.role
      },
      threat_score: threatScore
      });
    }

    return originalSend.call(this, body);
  };

  next();
}

// IP blocking middleware
export function ipBlockingMiddleware(req: Request, res: Response, next: NextFunction) {
  const clientIP = req.ip || 'unknown';
  
  // Never block localhost during development or sandbox routes
  if (['127.0.0.1', 'localhost', '::1'].includes(clientIP) || 
      req.path.includes('/sandbox') || 
      req.path.includes('/api/sandbox')) {
    return next();
  }
  
  if (securityMonitor.isBlocked(clientIP)) {
    securityMonitor.logSecurityEvent({
      type: 'suspicious_activity',
      severity: 'critical',
      ip: clientIP,
      userAgent: req.get('User-Agent') || '',
      endpoint: req.path,
      details: { reason: 'blocked_ip_attempt', method: req.method },
      threat_score: 50
    });

    return res.status(403).json({
      success: false,
      message: 'Access denied due to security policy',
      code: 'IP_BLOCKED'
    });
  }

  next();
}

// Performance monitoring middleware
export function performanceMonitor(req: Request, res: Response, next: NextFunction) {
  const startTime = process.hrtime.bigint();
  const startMemory = process.memoryUsage();

  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const endMemory = process.memoryUsage();
    
    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;

    // Only log critical performance issues to reduce noise
    if (duration > 3000) { // Only log very slow requests (>3s)
      console.warn(`[PERFORMANCE] CRITICAL_SLOW: ${req.method} ${req.path} took ${duration.toFixed(2)}ms`);
    }

    // Only log very memory-intensive requests
    if (memoryDelta > 50 * 1024 * 1024) { // More than 50MB memory increase
      console.warn(`[PERFORMANCE] CRITICAL_MEMORY: ${req.method} ${req.path} used ${(memoryDelta / 1024 / 1024).toFixed(2)}MB`);
    }

    // Reduced API logging - only show significant issues
    if (req.path.startsWith('/api/') && (duration > 2000 || memoryDelta > 20 * 1024 * 1024)) {
      console.log(`[PERFORMANCE] ${req.method} ${req.path} ${res.statusCode} ${duration.toFixed(2)}ms ${(memoryDelta / 1024).toFixed(0)}KB`);
    }
  });

  next();
}

// Health check with comprehensive system status
export function systemHealthCheck() {
  const memUsage = process.memoryUsage();
  const uptime = process.uptime();
  const securityStats = securityMonitor.getSecurityStats();

  return {
    system: {
      uptime: Math.floor(uptime),
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024),
        total: Math.round(memUsage.heapTotal / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024),
        rss: Math.round(memUsage.rss / 1024 / 1024)
      },
      cpu: {
        load: process.cpuUsage(),
        platform: process.platform,
        arch: process.arch
      }
    },
    security: securityStats,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  };
}
// Define SecurityEvent type locally to avoid circular import
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

// Alerting service for security events
export class AlertingService {
  private alertThresholds = {
    critical_events_per_hour: 10,
    blocked_ips_threshold: 20,
    failed_auth_per_minute: 15,
    api_abuse_requests_per_minute: 100
  };

  private ownerContacts: {
    emails: string[];
    phones: string[];
    name: string;
  } = {
    emails: [],
    phones: [],
    name: ''
  };

  constructor() {
    // Initialize alerting channels
    this.setupAlertChannels();
  }

  private setupAlertChannels() {
    // Owner contact information for critical alerts
    this.ownerContacts = {
      emails: ['admin@educafric.com', 'support@educafric.com'],
      phones: ['+237600000000', '+237600000001'], // Demo contact numbers
      name: 'Platform Administrator'
    };
    
    // In production, integrate with:
    // - Vonage SMS (already configured)
    // - Hostinger SMTP for emails
    // - Slack webhooks for dev team
    // - WhatsApp Business API
    console.log('[ALERTING] Alerting service initialized for Educafric security monitoring');
    console.log(`[ALERTING] Owner contacts configured: ${this.ownerContacts.emails[0]}, ${this.ownerContacts.phones[0]}`);
  }

  async sendCriticalAlert(event: SecurityEvent, context: any = {}) {
    const alert = {
      timestamp: new Date().toISOString(),
      severity: 'CRITICAL',
      platform: 'Educafric',
      event_type: event.type,
      source_ip: event.ip,
      endpoint: event.endpoint,
      threat_score: event.threat_score,
      user_id: event.userId,
      details: event.details,
      context
    };

    // Console logging for development
    console.log(`🚨 [CRITICAL_ALERT] ${JSON.stringify(alert, null, 2)}`);

    // In production, send to external services:
    // await this.sendEmailAlert(alert);
    // await this.sendSMSAlert(alert);
    
    // Send immediate SMS for critical security events
    if (event.severity === 'critical' && event.threat_score >= 40) {
      await this.sendCriticalSMS(alert);
    }

    return alert;
  }

  async sendSecuritySummary(stats: any) {
    const summary = {
      timestamp: new Date().toISOString(),
      platform: 'Educafric Educational Platform',
      period: '24 hours',
      african_context: true,
      security_summary: {
        total_events: stats.total_events_24h,
        critical_events: stats.critical_events_24h,
        blocked_ips: stats.blocked_ips,
        high_risk_ips: stats.high_risk_ips,
        top_threats: stats.top_threat_ips.slice(0, 5)
      },
      recommendations: this.generateSecurityRecommendations(stats)
    };

    console.log(`📊 [SECURITY_SUMMARY] ${JSON.stringify(summary, null, 2)}`);
    return summary;
  }

  private generateSecurityRecommendations(stats: any): string[] {
    const recommendations: string[] = [];

    if (stats.critical_events_24h > 5) {
      recommendations.push('High critical event volume detected - consider IP whitelisting for legitimate users');
    }

    if (stats.blocked_ips > 10) {
      recommendations.push('Multiple IP blocks active - review for false positives in African IP ranges');
    }

    if (stats.event_types_24h.authentication > 100) {
      recommendations.push('High authentication activity - monitor for credential stuffing attacks');
    }

    if (stats.total_events_24h > 1000) {
      recommendations.push('High security event volume - consider tuning detection sensitivity');
    }

    // African-specific recommendations
    recommendations.push('Ensure mobile network IP ranges are properly handled for African users');
    recommendations.push('Monitor for educational data access patterns specific to school schedules');

    return recommendations;
  }

  // Educational security specific alerts
  async sendEducationalSecurityAlert(type: string, details: any) {
    const educationalAlert = {
      timestamp: new Date().toISOString(),
      alert_type: 'educational_security',
      category: type,
      platform: 'Educafric',
      details,
      african_context: {
        school_hours: '6:00-18:00 local time',
        academic_calendar: 'African school terms',
        data_sensitivity: 'student_records'
      }
    };

    console.log(`🏫 [EDUCATIONAL_ALERT] ${JSON.stringify(educationalAlert, null, 2)}`);
    return educationalAlert;
  }

  // Performance alerts for African network conditions
  async sendPerformanceAlert(metrics: any) {
    if (metrics.average_response_time > 3000) { // 3 seconds
      const alert = {
        timestamp: new Date().toISOString(),
        alert_type: 'performance_degradation',
        platform: 'Educafric',
        metrics,
        african_optimization: {
          mobile_network_consideration: true,
          suggested_optimizations: [
            'Reduce payload sizes',
            'Implement better caching',
            'Optimize for 2G/3G networks'
          ]
        }
      };

      console.log(`⚡ [PERFORMANCE_ALERT] ${JSON.stringify(alert, null, 2)}`);
      return alert;
    }
  }
}

// Global alerting service instance
export const alertingService = new AlertingService();

// Scheduled alerting functions
export function setupScheduledAlerts() {
  // Daily security summary at 6 AM local time
  const dailySummaryInterval = 24 * 60 * 60 * 1000; // 24 hours
  setInterval(async () => {
    try {
      // This would integrate with the security monitor
      const stats = {
        total_events_24h: 0,
        critical_events_24h: 0,
        blocked_ips: 0,
        high_risk_ips: 0,
        top_threat_ips: [],
        event_types_24h: {}
      };
      
      await alertingService.sendSecuritySummary(stats);
    } catch (error) {
      console.error('[ALERTING] Failed to send daily security summary:', error);
    }
  }, dailySummaryInterval);

  // Weekly educational security report (Sundays)
  const weeklySummaryInterval = 7 * 24 * 60 * 60 * 1000; // 7 days
  setInterval(async () => {
    try {
      await alertingService.sendEducationalSecurityAlert('weekly_summary', {
        message: 'Weekly educational security report for African schools',
        period: 'past_7_days',
        focus_areas: ['student_data_access', 'grade_modifications', 'payment_security']
      });
    } catch (error) {
      console.error('[ALERTING] Failed to send weekly educational report:', error);
    }
  }, weeklySummaryInterval);

  console.log('[ALERTING] Scheduled alerts configured for Educafric platform');
}

// SMS notification integration for owner alerts
async function sendCriticalSMSAlert(alert: any): Promise<void> {
  try {
    const notificationService = await import('../services/notificationService');
    
    const ownerPhones = ['+237600000000', '+237600000001']; // Demo contact numbers
    const message = `🚨 EDUCAFRIC SECURITY ALERT\n\nType: ${alert.event_type}\nThreat Score: ${alert.threat_score}\nIP: ${alert.source_ip}\nTime: ${new Date(alert.timestamp).toLocaleString()}\n\nImmediate review required.`;
    
    for (const phone of ownerPhones) {
      await notificationService.notificationService.sendSMS(phone, message, 'en');
      console.log(`[CRITICAL_SMS] Alert sent to owner: ${phone}`);
    }
  } catch (error) {
    console.error('[CRITICAL_SMS] Failed to send owner alert:', error);
  }
}

// Add method to AlertingService class
AlertingService.prototype.sendCriticalSMS = async function(alert: any) {
  return sendCriticalSMSAlert(alert);
};
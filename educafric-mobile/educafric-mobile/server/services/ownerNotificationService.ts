// Owner notification service for critical Educafric platform alerts

interface OwnerContact {
  emails: string[];
  phones: string[];
  name: string;
  timezone: string;
}

class OwnerNotificationService {
  private ownerContact: OwnerContact = {
    emails: ['simonpmuehling@gmail.com', 'info@educafric.com'],
    phones: ['+237657004011', '+41768017000'], // Actual owner contact numbers
    name: 'Platform Administrator',
    timezone: 'Africa/Douala'
  };

  constructor() {
    console.log('[OWNER_NOTIFICATIONS] Service initialized for platform owner');
  }

  // Critical security alerts (immediate SMS + email)
  async sendCriticalSecurityAlert(event: any) {
    const alertMessage = this.formatSecurityAlert(event);
    
    try {
      // Send SMS to both numbers using dynamic import
      const { VonageService } = await import('./notificationService');
      const vonageService = new VonageService();
      
      for (const phone of this.ownerContact.phones) {
        await vonageService.sendSMS(phone, alertMessage.sms, 'en');
        console.log(`[OWNER_ALERT] Critical security SMS sent to ${phone}`);
      }

      // Log for email integration (when SMTP is configured)
      console.log(`[OWNER_ALERT] Email alert prepared for: ${this.ownerContact.emails.join(', ')}`);
      console.log(`[OWNER_ALERT] Alert: ${alertMessage.email}`);

    } catch (error) {
      console.error('[OWNER_ALERT] Failed to send critical alert:', error);
    }
  }

  // System health alerts (daily summaries)
  async sendSystemHealthSummary(healthData: any) {
    const summary = this.formatHealthSummary(healthData);
    
    console.log(`[OWNER_HEALTH] Daily summary prepared for: ${this.ownerContact.emails[0]}`);
    console.log(`[OWNER_HEALTH] Summary: ${summary}`);
  }

  // Platform milestone notifications
  async sendPlatformMilestone(milestone: string, details: any) {
    const message = `🎉 EDUCAFRIC MILESTONE\n\n${milestone}\n\nDetails: ${JSON.stringify(details, null, 2)}\n\nCongratulations on this achievement!`;
    
    // Send to primary phone for good news
    try {
      const { VonageService } = await import('./notificationService');
      const vonageService = new VonageService();
      await vonageService.sendSMS(this.ownerContact.phones[0], message, 'en');
      console.log(`[OWNER_MILESTONE] Milestone notification sent: ${milestone}`);
    } catch (error) {
      console.error('[OWNER_MILESTONE] Failed to send milestone alert:', error);
    }
  }

  // Revenue and subscription alerts
  async sendRevenueAlert(type: 'new_subscription' | 'payment_failed' | 'milestone', data: any) {
    let message = '';
    
    switch (type) {
      case 'new_subscription':
        message = `💰 NEW SUBSCRIPTION\n\nPlan: ${data.plan}\nAmount: ${data.amount} CFA\nUser: ${data.userEmail}\nSchool: ${data.schoolName || 'Individual'}\n\nEducafric is growing!`;
        break;
      case 'payment_failed':
        message = `⚠️ PAYMENT FAILED\n\nUser: ${data.userEmail}\nAmount: ${data.amount} CFA\nReason: ${data.reason}\n\nRequires attention.`;
        break;
      case 'milestone':
        message = `🚀 REVENUE MILESTONE\n\n${data.milestone}\nTotal Revenue: ${data.totalRevenue} CFA\nActive Subscriptions: ${data.activeSubscriptions}\n\nGreat progress!`;
        break;
    }

    try {
      const { VonageService } = await import('./notificationService');
      const vonageService = new VonageService();
      await vonageService.sendSMS(this.ownerContact.phones[0], message, 'en');
      console.log(`[OWNER_REVENUE] Revenue alert sent: ${type}`);
    } catch (error) {
      console.error('[OWNER_REVENUE] Failed to send revenue alert:', error);
    }
  }

  // Educational impact reports
  async sendEducationalImpactReport(stats: any) {
    const report = `📚 EDUCAFRIC IMPACT REPORT\n\nActive Schools: ${stats.activeSchools}\nTotal Students: ${stats.totalStudents}\nTeachers: ${stats.totalTeachers}\nGrades Recorded: ${stats.gradesRecorded}\n\nMaking education better across Africa!`;

    console.log(`[OWNER_IMPACT] Weekly impact report prepared`);
    console.log(`[OWNER_IMPACT] Report: ${report}`);
  }

  private formatSecurityAlert(event: any): { sms: string; email: string } {
    const sms = `🚨 EDUCAFRIC SECURITY\n\nThreat: ${event.type}\nScore: ${event.threat_score}\nIP: ${event.ip}\nTime: ${new Date(event.timestamp).toLocaleString('en-CH')}\n\nCheck /security dashboard`;

    const email = `Critical Security Alert for Educafric Platform

Event Type: ${event.type}
Threat Score: ${event.threat_score}
Source IP: ${event.ip}
Endpoint: ${event.endpoint}
Timestamp: ${new Date(event.timestamp).toLocaleString('en-CH')}

Details: ${JSON.stringify(event.details, null, 2)}

Action Required: Please review the security dashboard at https://educafric.replit.dev/security

Best regards,
Educafric Security System`;

    return { sms, email };
  }

  private formatHealthSummary(healthData: any): string {
    return `Educafric Daily Health Summary

System Uptime: ${Math.floor(healthData.system.uptime / 3600)}h
Memory Usage: ${healthData.system.memory.used}MB / ${healthData.system.memory.total}MB
Security Events: ${healthData.security.total_events_24h}
Critical Events: ${healthData.security.critical_events_24h}
Blocked IPs: ${healthData.security.blocked_ips}

Platform Status: ${healthData.status}
Timestamp: ${healthData.timestamp}

Your educational platform is running smoothly!`;
  }

  // Test notification (for verification)
  async sendTestNotification() {
    const testMessage = `✅ EDUCAFRIC TEST\n\nSecurity monitoring is active and owner notifications are working correctly.\n\nTime: ${new Date().toLocaleString('en-CH')}\n\nSystem operational!`;
    
    try {
      // Send to primary number (Cameroon)
      const { VonageService } = await import('./notificationService');
      const vonageService = new VonageService();
      await vonageService.sendSMS(this.ownerContact.phones[0], testMessage, 'en');
      console.log(`[OWNER_TEST] Test notification sent successfully to ${this.ownerContact.phones[0]}`);
      return true;
    } catch (error) {
      console.error('[OWNER_TEST] Test notification failed:', error);
      return false;
    }
  }
}

export const ownerNotificationService = new OwnerNotificationService();
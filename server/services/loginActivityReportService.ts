import cron from 'node-cron';
import { hostingerMailService } from './hostingerMailService';
import { db } from '../db';
import { sql } from 'drizzle-orm';

interface LoginActivityReport {
  date: string;
  totalLogins: number;
  uniqueUsers: number;
  loginsByRole: { role: string; count: number }[];
  loginsByCountry: { country: string; count: number; users: string[] }[];
  detailedLogins: { name: string; role: string; time: string; country: string; ip: string }[];
}

class LoginActivityReportService {
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (this.isInitialized) return;

    console.log('[LOGIN_ACTIVITY_REPORT] Initializing daily login activity reporting...');
    
    // Schedule daily report at 11pm (23:00) Africa/Douala timezone
    cron.schedule('0 23 * * *', () => {
      this.sendDailyLoginReport();
    }, {
      timezone: 'Africa/Douala'
    });

    this.isInitialized = true;
    console.log('[LOGIN_ACTIVITY_REPORT] Daily login activity reporting initialized - report at 11pm (Africa/Douala)');
    console.log('[LOGIN_ACTIVITY_REPORT] Target email: simonpmuehling@gmail.com');
  }

  async sendDailyLoginReport(): Promise<void> {
    try {
      console.log('[LOGIN_ACTIVITY_REPORT] Generating daily login report...');
      
      const report = await this.generateDailyReport();
      
      if (report.totalLogins === 0) {
        console.log('[LOGIN_ACTIVITY_REPORT] No logins in the last 24 hours, skipping report');
        return;
      }
      
      const success = await hostingerMailService.sendDailyLoginSummary(report);
      
      if (success) {
        console.log(`[LOGIN_ACTIVITY_REPORT] Daily report sent successfully - ${report.totalLogins} logins from ${report.loginsByCountry.length} countries`);
      } else {
        console.error('[LOGIN_ACTIVITY_REPORT] Failed to send daily report');
      }
    } catch (error) {
      console.error('[LOGIN_ACTIVITY_REPORT] Error sending daily login report:', error);
    }
  }

  async generateDailyReport(): Promise<LoginActivityReport> {
    try {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      
      const dateStr = today.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        timeZone: 'Africa/Douala'
      });

      // Get all logins from the last 24 hours
      const result = await db.execute(sql`
        SELECT 
          user_id,
          user_email,
          user_name,
          user_role,
          ip_address,
          country,
          city,
          login_time,
          school_id,
          school_name
        FROM login_activity
        WHERE login_time >= NOW() - INTERVAL '24 hours'
        ORDER BY login_time DESC
      `);

      const logins = result.rows as any[];
      
      // Calculate statistics
      const totalLogins = logins.length;
      const uniqueUserIds = new Set(logins.map(l => l.user_id));
      const uniqueUsers = uniqueUserIds.size;

      // Group by role
      const roleMap = new Map<string, number>();
      logins.forEach(l => {
        const role = l.user_role || 'Unknown';
        roleMap.set(role, (roleMap.get(role) || 0) + 1);
      });
      const loginsByRole = Array.from(roleMap.entries())
        .map(([role, count]) => ({ role, count }))
        .sort((a, b) => b.count - a.count);

      // Group by country
      const countryMap = new Map<string, { count: number; users: Set<string> }>();
      logins.forEach(l => {
        const country = l.country || 'Unknown';
        const userName = l.user_name || l.user_email || 'Anonymous';
        if (!countryMap.has(country)) {
          countryMap.set(country, { count: 0, users: new Set() });
        }
        const entry = countryMap.get(country)!;
        entry.count++;
        entry.users.add(userName);
      });
      const loginsByCountry = Array.from(countryMap.entries())
        .map(([country, data]) => ({ 
          country, 
          count: data.count, 
          users: Array.from(data.users) 
        }))
        .sort((a, b) => b.count - a.count);

      // Detailed logins (most recent first)
      const detailedLogins = logins.map(l => ({
        name: l.user_name || l.user_email || 'Anonymous',
        role: l.user_role || 'Unknown',
        time: new Date(l.login_time).toLocaleString('fr-FR', { timeZone: 'Africa/Douala' }),
        country: l.country || 'Unknown',
        ip: l.ip_address || 'Unknown'
      }));

      return {
        date: dateStr,
        totalLogins,
        uniqueUsers,
        loginsByRole,
        loginsByCountry,
        detailedLogins
      };
    } catch (error) {
      console.error('[LOGIN_ACTIVITY_REPORT] Error generating daily report:', error);
      return {
        date: new Date().toLocaleDateString('fr-FR', { timeZone: 'Africa/Douala' }),
        totalLogins: 0,
        uniqueUsers: 0,
        loginsByRole: [],
        loginsByCountry: [],
        detailedLogins: []
      };
    }
  }

  async sendTestReport(): Promise<boolean> {
    try {
      console.log('[LOGIN_ACTIVITY_REPORT] Sending test login activity report...');
      
      const report = await this.generateDailyReport();
      const success = await hostingerMailService.sendDailyLoginSummary(report);
      
      if (success) {
        console.log('[LOGIN_ACTIVITY_REPORT] Test report sent successfully');
      }
      
      return success;
    } catch (error) {
      console.error('[LOGIN_ACTIVITY_REPORT] Error sending test report:', error);
      return false;
    }
  }
}

export const loginActivityReportService = new LoginActivityReportService();

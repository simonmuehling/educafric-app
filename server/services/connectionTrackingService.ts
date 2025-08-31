import { db } from "../db";
import { dailyConnections, pageVisits } from "@shared/schema";
import { eq, sql, gte } from "drizzle-orm";
import { hostingerMailService } from "./hostingerMailService";

export class ConnectionTrackingService {
  // Log a new connection
  static async logConnection(connectionData: {
    userId: number;
    userEmail: string;
    userRole: string;
    userName: string;
    ipAddress: string;
    location?: any;
    userAgent?: string;
    sessionId?: string;
    accessMethod?: string;
  }) {
    try {
      const [connection] = await db.insert(dailyConnections).values({
        user_id: connectionData.userId,
        user_email: connectionData.userEmail,
        user_role: connectionData.userRole,
        user_name: connectionData.userName,
        ip_address: connectionData.ipAddress,
        location: connectionData.location,
        user_agent: connectionData.userAgent,
        session_id: connectionData.sessionId,
        access_method: connectionData.accessMethod || 'web'
      }).returning();

      console.log(`[CONNECTION_TRACKER] 📊 Connexion enregistrée: ${connectionData.userEmail} depuis ${connectionData.ipAddress}`);
      return connection;
    } catch (error) {
      console.error(`[CONNECTION_TRACKER] ❌ Erreur logging connexion:`, error);
      throw error;
    }
  }

  // Log a page visit
  static async logPageVisit(visitData: {
    userId: number;
    userEmail: string;
    userRole: string;
    pagePath: string;
    moduleName?: string;
    dashboardType?: string;
    timeSpent?: number;
    ipAddress: string;
    sessionId?: string;
  }) {
    try {
      const [visit] = await db.insert(pageVisits).values({
        user_id: visitData.userId,
        user_email: visitData.userEmail,
        user_role: visitData.userRole,
        page_path: visitData.pagePath,
        module_name: visitData.moduleName,
        dashboard_type: visitData.dashboardType,
        time_spent: visitData.timeSpent,
        ip_address: visitData.ipAddress,
        session_id: visitData.sessionId
      }).returning();

      console.log(`[PAGE_TRACKER] 📄 Page visitée: ${visitData.pagePath} par ${visitData.userEmail}`);
      return visit;
    } catch (error) {
      console.error(`[PAGE_TRACKER] ❌ Erreur logging page:`, error);
      throw error;
    }
  }

  // Get today's connection stats
  static async getTodayStats() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Total connections today
      const totalConnections = await db.select({ count: sql<number>`count(*)` })
        .from(dailyConnections)
        .where(gte(dailyConnections.connection_date, today));

      // Unique users today
      const uniqueUsers = await db.select({ count: sql<number>`count(DISTINCT user_id)` })
        .from(dailyConnections)
        .where(gte(dailyConnections.connection_date, today));

      // Connections by role
      const connectionsByRole = await db.select({
        role: dailyConnections.user_role,
        count: sql<number>`count(*)`
      })
      .from(dailyConnections)
      .where(gte(dailyConnections.connection_date, today))
      .groupBy(dailyConnections.user_role);

      // Most visited pages
      const topPages = await db.select({
        pagePath: pageVisits.page_path,
        moduleName: pageVisits.module_name,
        count: sql<number>`count(*)`
      })
      .from(pageVisits)
      .where(gte(pageVisits.visit_date, today))
      .groupBy(pageVisits.page_path, pageVisits.module_name)
      .orderBy(sql`count(*) DESC`)
      .limit(10);

      // Recent connections with details
      const recentConnections = await db.select()
        .from(dailyConnections)
        .where(gte(dailyConnections.connection_date, today))
        .orderBy(sql`connection_date DESC`)
        .limit(50);

      return {
        totalConnections: totalConnections[0]?.count || 0,
        uniqueUsers: uniqueUsers[0]?.count || 0,
        connectionsByRole: connectionsByRole || [],
        topPages: topPages || [],
        recentConnections: recentConnections || []
      };
    } catch (error) {
      console.error(`[CONNECTION_STATS] ❌ Erreur récupération stats:`, error);
      throw error;
    }
  }

  // Send daily email report
  static async sendDailyReport() {
    try {
      const stats = await this.getTodayStats();
      const today = new Date().toLocaleDateString('fr-FR');

      const emailContent = `
        <h2>📊 Rapport Quotidien Educafric - ${today}</h2>
        
        <h3>🔗 Résumé des Connexions</h3>
        <ul>
          <li><strong>Total connexions:</strong> ${stats.totalConnections}</li>
          <li><strong>Utilisateurs uniques:</strong> ${stats.uniqueUsers}</li>
        </ul>

        <h3>👥 Connexions par Rôle</h3>
        <ul>
          ${stats.connectionsByRole.map(role => 
            `<li><strong>${role.role}:</strong> ${role.count} connexions</li>`
          ).join('')}
        </ul>

        <h3>📱 Pages les Plus Visitées</h3>
        <ol>
          ${stats.topPages.map(page => 
            `<li><strong>${page.moduleName || page.pagePath}:</strong> ${page.count} visites</li>`
          ).join('')}
        </ol>

        <h3>🌍 Connexions Récentes (IP & Localisation)</h3>
        <table border="1" style="border-collapse: collapse; width: 100%;">
          <tr>
            <th>Utilisateur</th>
            <th>Rôle</th>
            <th>IP Address</th>
            <th>Localisation</th>
            <th>Heure</th>
          </tr>
          ${stats.recentConnections.slice(0, 20).map(conn => `
            <tr>
              <td>${conn.userName} (${conn.userEmail})</td>
              <td>${conn.userRole}</td>
              <td>${conn.ipAddress}</td>
              <td>${conn.location ? JSON.stringify(conn.location) : 'Non disponible'}</td>
              <td>${new Date(conn.connectionDate).toLocaleString('fr-FR')}</td>
            </tr>
          `).join('')}
        </table>

        <p><em>Rapport généré automatiquement par Educafric Analytics</em></p>
      `;

      await hostingerMailService.sendEmail({
        to: 'simonpmuehling@gmail.com',
        subject: `📊 Educafric - Rapport Quotidien ${today}`,
        text: `Rapport quotidien Educafric du ${today} - ${stats.totalConnections} connexions, ${stats.uniqueUsers} utilisateurs uniques`,
        html: emailContent
      });

      console.log(`[DAILY_REPORT] ✅ Rapport quotidien envoyé à simonpmuehling@gmail.com`);
      return { success: true, stats };
    } catch (error) {
      console.error(`[DAILY_REPORT] ❌ Erreur envoi rapport:`, error);
      throw error;
    }
  }

  // Get IP location info (basic implementation)
  static async getLocationFromIP(ipAddress: string) {
    try {
      // Basic IP location detection
      if (ipAddress === '127.0.0.1' || ipAddress.includes('192.168') || ipAddress.includes('10.0')) {
        return { country: 'Local', city: 'Development', region: 'Test Environment' };
      }

      // For production, you could integrate with ipapi.co or similar service
      // For now, return basic info
      return { 
        country: 'Unknown', 
        city: 'Unknown', 
        region: 'Unknown',
        ip: ipAddress 
      };
    } catch (error) {
      console.error(`[LOCATION_SERVICE] ❌ Erreur géolocalisation IP:`, error);
      return { country: 'Error', city: 'Error', region: 'Error' };
    }
  }
}
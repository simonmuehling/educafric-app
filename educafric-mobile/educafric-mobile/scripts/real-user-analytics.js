#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from "ws";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

neonConfig.webSocketConstructor = ws;

/**
 * Real User Analytics and Experience Monitoring
 * Analyzes actual user behavior patterns and system usage
 */

class RealUserAnalytics {
  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL must be set');
    }
    
    this.pool = new Pool({ connectionString: process.env.DATABASE_URL });
    this.analytics = {
      timestamp: new Date().toISOString(),
      userDemographics: {},
      usagePatterns: {},
      systemHealth: {},
      recommendations: []
    };
  }

  async runAnalytics() {
    console.log('📊 Starting Real User Analytics and Experience Monitoring...');
    
    try {
      await this.analyzeUserDemographics();
      await this.analyzeUsagePatterns();
      await this.checkSystemHealthFromUserPerspective();
      await this.generateUserExperienceRecommendations();
      await this.saveAnalytics();
      
      this.displayAnalytics();
      
    } catch (error) {
      console.error('❌ Analytics failed:', error.message);
    } finally {
      await this.pool.end();
    }
  }

  async analyzeUserDemographics() {
    console.log('👥 Analyzing user demographics...');
    
    try {
      // Get real user distribution by role
      const roleQuery = `
        SELECT role, COUNT(*) as count 
        FROM users 
        WHERE email NOT LIKE '%@test.educafric.com' 
          AND email NOT LIKE '%@test.com'
          AND email NOT LIKE '%@example.com'
        GROUP BY role
        ORDER BY count DESC
      `;
      const roleResult = await this.pool.query(roleQuery);
      
      // Get registration timeline
      const timelineQuery = `
        SELECT DATE(created_at) as date, COUNT(*) as registrations
        FROM users 
        WHERE email NOT LIKE '%@test.educafric.com' 
          AND email NOT LIKE '%@test.com'
          AND email NOT LIKE '%@example.com'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 30
      `;
      const timelineResult = await this.pool.query(timelineQuery);
      
      // Get school distribution
      const schoolQuery = `
        SELECT s.name as school_name, COUNT(u.id) as user_count
        FROM schools s
        LEFT JOIN users u ON u.school_id = s.id
        WHERE u.email NOT LIKE '%@test.educafric.com' 
          AND u.email NOT LIKE '%@test.com'
          AND u.email NOT LIKE '%@example.com'
        GROUP BY s.id, s.name
        ORDER BY user_count DESC
      `;
      const schoolResult = await this.pool.query(schoolQuery);
      
      this.analytics.userDemographics = {
        roleDistribution: roleResult.rows,
        registrationTimeline: timelineResult.rows,
        schoolDistribution: schoolResult.rows,
        totalRealUsers: roleResult.rows.reduce((sum, row) => sum + parseInt(row.count), 0)
      };
      
      console.log(`✅ Found ${this.analytics.userDemographics.totalRealUsers} real users`);
      
    } catch (error) {
      console.error('❌ User demographics analysis failed:', error.message);
      this.analytics.userDemographics.error = error.message;
    }
  }

  async analyzeUsagePatterns() {
    console.log('📈 Analyzing usage patterns...');
    
    try {
      // Analyze login patterns (if we had login logs)
      // For now, we'll analyze user activity based on profile updates
      const activityQuery = `
        SELECT 
          DATE(updated_at) as activity_date,
          role,
          COUNT(*) as activity_count
        FROM users 
        WHERE email NOT LIKE '%@test.educafric.com' 
          AND email NOT LIKE '%@test.com'
          AND email NOT LIKE '%@example.com'
          AND updated_at > created_at
        GROUP BY DATE(updated_at), role
        ORDER BY activity_date DESC
        LIMIT 50
      `;
      const activityResult = await this.pool.query(activityQuery);
      
      // Analyze subscription patterns
      const subscriptionQuery = `
        SELECT 
          subscription_status,
          COUNT(*) as count,
          role
        FROM users 
        WHERE email NOT LIKE '%@test.educafric.com' 
          AND email NOT LIKE '%@test.com'
          AND email NOT LIKE '%@example.com'
        GROUP BY subscription_status, role
      `;
      const subscriptionResult = await this.pool.query(subscriptionQuery);
      
      this.analytics.usagePatterns = {
        recentActivity: activityResult.rows,
        subscriptionPatterns: subscriptionResult.rows,
        activeUsers: activityResult.rows.length
      };
      
      console.log(`✅ Analyzed usage patterns for ${activityResult.rows.length} active users`);
      
    } catch (error) {
      console.error('❌ Usage pattern analysis failed:', error.message);
      this.analytics.usagePatterns.error = error.message;
    }
  }

  async checkSystemHealthFromUserPerspective() {
    console.log('🏥 Checking system health from user perspective...');
    
    try {
      // Check for users with potential issues
      const issuesQuery = `
        SELECT 
          'Missing Profile Info' as issue_type,
          COUNT(*) as affected_users
        FROM users 
        WHERE (first_name IS NULL OR first_name = '' OR last_name IS NULL OR last_name = '')
          AND email NOT LIKE '%@test.educafric.com' 
          AND email NOT LIKE '%@test.com'
          AND email NOT LIKE '%@example.com'
        
        UNION ALL
        
        SELECT 
          'No School Assignment' as issue_type,
          COUNT(*) as affected_users
        FROM users 
        WHERE school_id IS NULL
          AND role IN ('Student', 'Teacher', 'Parent')
          AND email NOT LIKE '%@test.educafric.com' 
          AND email NOT LIKE '%@test.com'
          AND email NOT LIKE '%@example.com'
      `;
      const issuesResult = await this.pool.query(issuesQuery);
      
      // Check for orphaned data
      const orphanedQuery = `
        SELECT 
          'Users without Schools' as data_type,
          COUNT(*) as count
        FROM users u
        LEFT JOIN schools s ON u.school_id = s.id
        WHERE u.school_id IS NOT NULL 
          AND s.id IS NULL
          AND u.email NOT LIKE '%@test.educafric.com'
      `;
      const orphanedResult = await this.pool.query(orphanedQuery);
      
      this.analytics.systemHealth = {
        userIssues: issuesResult.rows,
        dataIntegrityIssues: orphanedResult.rows,
        overallHealthScore: this.calculateHealthScore(issuesResult.rows, orphanedResult.rows)
      };
      
      console.log(`✅ System health analysis completed`);
      
    } catch (error) {
      console.error('❌ System health analysis failed:', error.message);
      this.analytics.systemHealth.error = error.message;
    }
  }

  calculateHealthScore(userIssues, dataIssues) {
    let score = 100;
    const totalUsers = this.analytics.userDemographics.totalRealUsers || 1;
    
    userIssues.forEach(issue => {
      const affectedPercentage = (parseInt(issue.affected_users) / totalUsers) * 100;
      score -= Math.min(affectedPercentage, 20); // Cap impact at 20 points per issue
    });
    
    dataIssues.forEach(issue => {
      if (parseInt(issue.count) > 0) {
        score -= 10; // 10 points for each data integrity issue
      }
    });
    
    return Math.max(0, Math.round(score));
  }

  generateUserExperienceRecommendations() {
    const { userDemographics, systemHealth } = this.analytics;
    
    // Generate recommendations based on real data
    if (userDemographics.totalRealUsers < 10) {
      this.analytics.recommendations.push({
        priority: 'high',
        category: 'user_acquisition',
        title: 'Low User Base Detected',
        description: `Only ${userDemographics.totalRealUsers} real users registered. Focus on user acquisition.`,
        actions: [
          'Implement user onboarding improvements',
          'Add referral system for existing users',
          'Create demo accounts for school administrators',
          'Develop marketing strategy for African educational institutions'
        ]
      });
    }
    
    if (systemHealth.overallHealthScore < 80) {
      this.analytics.recommendations.push({
        priority: 'critical',
        category: 'data_quality',
        title: 'Data Quality Issues Detected',
        description: `System health score is ${systemHealth.overallHealthScore}/100. User experience may be impacted.`,
        actions: [
          'Fix incomplete user profiles',
          'Ensure proper school assignments',
          'Implement data validation on registration',
          'Add profile completion prompts'
        ]
      });
    }
    
    // Role-specific recommendations
    const roleDistribution = userDemographics.roleDistribution || [];
    const studentCount = roleDistribution.find(r => r.role === 'Student')?.count || 0;
    const teacherCount = roleDistribution.find(r => r.role === 'Teacher')?.count || 0;
    
    if (studentCount > 0 && teacherCount === 0) {
      this.analytics.recommendations.push({
        priority: 'high',
        category: 'user_balance',
        title: 'Teacher Shortage Detected',
        description: `${studentCount} students registered but no teachers. Platform functionality limited.`,
        actions: [
          'Recruit teacher users',
          'Create teacher onboarding program',
          'Implement teacher invitation system',
          'Provide teacher training resources'
        ]
      });
    }
    
    console.log(`💡 Generated ${this.analytics.recommendations.length} recommendations`);
  }

  async saveAnalytics() {
    try {
      const reportPath = path.join(__dirname, '../real-user-analytics.json');
      await fs.writeFile(reportPath, JSON.stringify(this.analytics, null, 2));
      console.log(`💾 Real user analytics saved: ${reportPath}`);
    } catch (error) {
      console.error('❌ Failed to save analytics:', error.message);
    }
  }

  displayAnalytics() {
    console.log('\n' + '='.repeat(80));
    console.log('👥 REAL USER ANALYTICS & EXPERIENCE DASHBOARD');
    console.log('='.repeat(80));
    
    const { userDemographics, usagePatterns, systemHealth } = this.analytics;
    
    console.log(`📊 USER DEMOGRAPHICS:`);
    console.log(`  Total Real Users: ${userDemographics.totalRealUsers || 0}`);
    
    if (userDemographics.roleDistribution) {
      console.log(`  Role Distribution:`);
      userDemographics.roleDistribution.forEach(role => {
        console.log(`    ${role.role}: ${role.count}`);
      });
    }
    
    console.log(`\n🏥 SYSTEM HEALTH FROM USER PERSPECTIVE:`);
    console.log(`  Overall Health Score: ${systemHealth.overallHealthScore || 0}/100`);
    
    if (systemHealth.userIssues) {
      console.log(`  User Issues:`);
      systemHealth.userIssues.forEach(issue => {
        console.log(`    ${issue.issue_type}: ${issue.affected_users} users`);
      });
    }
    
    console.log(`\n📈 USAGE PATTERNS:`);
    console.log(`  Active Users (Recent Activity): ${usagePatterns.activeUsers || 0}`);
    
    if (this.analytics.recommendations.length > 0) {
      console.log(`\n💡 RECOMMENDATIONS FOR REAL USER EXPERIENCE:`);
      this.analytics.recommendations.forEach(rec => {
        console.log(`  [${rec.priority.toUpperCase()}] ${rec.title}`);
        console.log(`    ${rec.description}`);
        rec.actions.forEach(action => {
          console.log(`    • ${action}`);
        });
        console.log('');
      });
    }
    
    console.log('='.repeat(80));
    console.log(`⏰ Report generated: ${this.analytics.timestamp}`);
    console.log('='.repeat(80) + '\n');
  }
}

// Main execution
async function main() {
  const analytics = new RealUserAnalytics();
  await analytics.runAnalytics();
}

// Export for use as module
export { RealUserAnalytics };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Real user analytics failed:', error.message);
    process.exit(1);
  });
}
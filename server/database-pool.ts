/**
 * Enhanced Database Connection Pool for 3500+ Users
 * Optimizes Neon PostgreSQL connections for high concurrency
 */

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "../shared/schema";

interface PoolStats {
  totalConnections: number;
  activeConnections: number;
  queuedRequests: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
}

class DatabasePool {
  private connections: any[] = [];
  private maxConnections: number;
  private currentIndex: number = 0;
  private stats: PoolStats;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor(maxConnections: number = 25) {
    this.maxConnections = maxConnections;
    this.stats = {
      totalConnections: 0,
      activeConnections: 0,
      queuedRequests: 0,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0
    };
    
    this.initializePool();
    this.startHealthCheck();
  }

  private initializePool() {
    console.log(`[DB_POOL] 🚀 Initializing connection pool with ${this.maxConnections} connections`);
    
    for (let i = 0; i < this.maxConnections; i++) {
      try {
        const sql = neon(process.env.DATABASE_URL!);
        
        const db = drizzle(sql, { schema });
        this.connections.push({
          id: i,
          db,
          inUse: false,
          created: Date.now(),
          lastUsed: Date.now(),
          requestCount: 0
        });
        
        this.stats.totalConnections++;
      } catch (error) {
        console.error(`[DB_POOL] ❌ Failed to create connection ${i}:`, error);
      }
    }
    
    console.log(`[DB_POOL] ✅ Pool initialized with ${this.connections.length} connections`);
  }

  private startHealthCheck() {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 30000); // Check every 30 seconds
  }

  private async performHealthCheck() {
    let healthyConnections = 0;
    
    for (const conn of this.connections) {
      if (!conn.inUse) {
        try {
          // Simple health check query
          await conn.db.execute('SELECT 1');
          healthyConnections++;
          conn.lastUsed = Date.now();
        } catch (error) {
          console.warn(`[DB_POOL] ⚠️ Connection ${conn.id} health check failed:`, error);
        }
      }
    }
    
    if (healthyConnections < this.maxConnections * 0.5) {
      console.warn(`[DB_POOL] ⚠️ Only ${healthyConnections}/${this.maxConnections} connections healthy`);
    }
  }

  public async getConnection(): Promise<any> {
    const startTime = Date.now();
    this.stats.totalRequests++;
    this.stats.queuedRequests++;

    try {
      // Find available connection using round-robin
      let attempts = 0;
      let connection = null;
      
      while (attempts < this.maxConnections && !connection) {
        const conn = this.connections[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.maxConnections;
        
        if (!conn.inUse) {
          conn.inUse = true;
          conn.lastUsed = Date.now();
          conn.requestCount++;
          connection = conn;
          this.stats.activeConnections++;
          break;
        }
        attempts++;
      }

      if (!connection) {
        // All connections busy - use least recently used
        const lruConnection = this.connections
          .sort((a, b) => a.lastUsed - b.lastUsed)[0];
        
        console.warn(`[DB_POOL] ⚠️ All connections busy, reusing LRU connection ${lruConnection.id}`);
        connection = lruConnection;
        connection.inUse = true;
        connection.lastUsed = Date.now();
        connection.requestCount++;
      }

      this.stats.queuedRequests--;
      this.stats.successfulRequests++;
      
      const responseTime = Date.now() - startTime;
      this.updateAverageResponseTime(responseTime);

      return {
        db: connection.db,
        release: () => {
          connection.inUse = false;
          this.stats.activeConnections = Math.max(0, this.stats.activeConnections - 1);
        }
      };

    } catch (error) {
      this.stats.queuedRequests--;
      this.stats.failedRequests++;
      console.error(`[DB_POOL] ❌ Failed to get connection:`, error);
      throw error;
    }
  }

  private updateAverageResponseTime(responseTime: number) {
    const alpha = 0.1; // Exponential moving average factor
    this.stats.averageResponseTime = 
      this.stats.averageResponseTime === 0 
        ? responseTime 
        : (alpha * responseTime) + ((1 - alpha) * this.stats.averageResponseTime);
  }

  public getStats(): PoolStats {
    return { ...this.stats };
  }

  public getDetailedStats() {
    const now = Date.now();
    const connectionDetails = this.connections.map(conn => ({
      id: conn.id,
      inUse: conn.inUse,
      ageSeconds: Math.floor((now - conn.created) / 1000),
      idleSeconds: Math.floor((now - conn.lastUsed) / 1000),
      requestCount: conn.requestCount
    }));

    return {
      pool: this.stats,
      connections: connectionDetails,
      utilization: (this.stats.activeConnections / this.maxConnections * 100).toFixed(1),
      successRate: (this.stats.successfulRequests / Math.max(1, this.stats.totalRequests) * 100).toFixed(1)
    };
  }

  public async executeQuery<T>(queryFn: (db: any) => Promise<T>): Promise<T> {
    const connection = await this.getConnection();
    try {
      const result = await queryFn(connection.db);
      return result;
    } finally {
      connection.release();
    }
  }

  public destroy() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    console.log(`[DB_POOL] 🛑 Connection pool destroyed`);
  }
}

// Create singleton instance
const dbPool = new DatabasePool(25); // 25 connections for 3500 users

// Enhanced database export with connection pooling
export const db = {
  // Original drizzle instance for backward compatibility
  ...drizzle(neon(process.env.DATABASE_URL!), { schema }),
  
  // Pooled query execution
  pool: {
    execute: <T>(queryFn: (db: any) => Promise<T>) => dbPool.executeQuery(queryFn),
    getStats: () => dbPool.getStats(),
    getDetailedStats: () => dbPool.getDetailedStats(),
    getConnection: () => dbPool.getConnection()
  }
};

export { dbPool };
export default db;
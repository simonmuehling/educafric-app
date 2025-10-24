import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from "../shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure WebSocket for neon-serverless
neonConfig.webSocketConstructor = ws;

// Enable pooling for transaction support
neonConfig.poolQueryViaFetch = true;

// Configure connection pool with proper limits
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 10, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Connection timeout of 10 seconds
});

export const db = drizzle(pool, { schema });
export { pool }; // Export pool for potential cleanup in application shutdown

// Graceful shutdown: close pool on process termination
// Note: We don't call process.exit() here to allow other shutdown hooks to run
process.on('SIGINT', async () => {
  try {
    console.log('[DB] Closing database connection pool...');
    await pool.end();
    console.log('[DB] ✅ Database pool closed successfully');
  } catch (error) {
    console.error('[DB] ⚠️ Error closing database pool:', error);
  }
});

process.on('SIGTERM', async () => {
  try {
    console.log('[DB] Closing database connection pool...');
    await pool.end();
    console.log('[DB] ✅ Database pool closed successfully');
  } catch (error) {
    console.error('[DB] ⚠️ Error closing database pool:', error);
  }
});
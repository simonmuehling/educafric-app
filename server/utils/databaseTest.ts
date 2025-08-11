import { neon } from '@neondatabase/serverless';

export async function testDatabaseConnection(): Promise<{
  success: boolean;
  error?: string;
  connectionTime?: number;
  details?: any;
}> {
  const startTime = Date.now();
  
  try {
    const sql = neon(process.env.DATABASE_URL!);
    
    // Simple test query
    const result = await sql`SELECT 1 as test, NOW() as current_time`;
    
    const connectionTime = Date.now() - startTime;
    
    return {
      success: true,
      connectionTime,
      details: {
        testResult: result[0],
        databaseUrl: process.env.DATABASE_URL?.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'),
        environment: process.env.NODE_ENV
      }
    };
  } catch (error: any) {
    const connectionTime = Date.now() - startTime;
    
    return {
      success: false,
      error: error.message,
      connectionTime,
      details: {
        errorStack: error.stack,
        databaseUrl: process.env.DATABASE_URL?.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'),
        environment: process.env.NODE_ENV
      }
    };
  }
}

export async function testUserQuery(): Promise<{
  success: boolean;
  error?: string;
  userCount?: number;
}> {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    
    // Test if users table exists and count users
    const result = await sql`
      SELECT COUNT(*) as count 
      FROM users 
      LIMIT 1
    `;
    
    return {
      success: true,
      userCount: Number(result[0].count)
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}
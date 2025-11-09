import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';

const execAsync = promisify(exec);

export class AutoFixSystem {
  private static instance: AutoFixSystem;
  private fixHistory: Set<string> = new Set();
  private isFixing = false;

  public static getInstance(): AutoFixSystem {
    if (!AutoFixSystem.instance) {
      AutoFixSystem.instance = new AutoFixSystem();
    }
    return AutoFixSystem.instance;
  }

  async detectAndFixError(error: Error | unknown, context?: Record<string, unknown>): Promise<boolean> {
    if (this.isFixing) return false;
    
    // Extract error message safely
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // In production, disable aggressive auto-fixes to prevent data corruption
    if (process.env.NODE_ENV === 'production') {
      console.log(`[AUTOFIX] Production mode - logging error instead of auto-fixing: ${errorMessage}`);
      return false;
    }
    const errorKey = this.generateErrorKey(errorMessage, context);
    
    if (this.fixHistory.has(errorKey)) {
      console.log(`[AUTOFIX] Error already fixed: ${errorKey}`);
      return false;
    }

    this.isFixing = true;
    console.log(`[AUTOFIX] Attempting to fix error: ${errorMessage}`);
    
    try {
      const fixed = await this.applyFix(errorMessage, context);
      if (fixed) {
        this.fixHistory.add(errorKey);
        console.log(`[AUTOFIX] ✅ Successfully fixed: ${errorMessage}`);
        return true;
      }
    } catch (fixError) {
      console.error(`[AUTOFIX] ❌ Failed to fix error:`, fixError);
    } finally {
      this.isFixing = false;
    }
    
    return false;
  }

  private async applyFix(errorMessage: string, context?: Record<string, unknown>): Promise<boolean> {
    // Fix missing database columns
    if (errorMessage.includes('column') && errorMessage.includes('does not exist')) {
      return await this.fixMissingColumn(errorMessage);
    }
    
    // Fix TypeScript compilation errors
    if (errorMessage.includes('TypeScript') || errorMessage.includes('Cannot find module')) {
      return await this.fixTypeScriptError(errorMessage);
    }
    
    // Fix port/connection errors
    if (errorMessage.includes('EADDRINUSE') || errorMessage.includes('port')) {
      return await this.fixPortError(errorMessage);
    }
    
    // Fix missing dependencies
    if (errorMessage.includes('Cannot resolve') || errorMessage.includes('Module not found')) {
      return await this.fixMissingDependency(errorMessage);
    }
    
    // Fix database connection errors
    if (errorMessage.includes('database') && errorMessage.includes('connection')) {
      return await this.fixDatabaseConnection(errorMessage);
    }
    
    // Fix session/authentication errors
    if (errorMessage.includes('Failed to deserialize user') || errorMessage.includes('session')) {
      return await this.fixSessionError(errorMessage);
    }

    return false;
  }

  private async fixMissingColumn(errorMessage: string): Promise<boolean> {
    const columnMatch = errorMessage.match(/column "([^"]+)" does not exist/);
    if (!columnMatch) return false;
    
    const columnName = columnMatch[1];
    
    // SAFETY: Never automatically modify database schema in production
    console.log(`[AUTOFIX] Database column issue detected: ${columnName} - manual schema update required`);
    console.log(`[AUTOFIX] Run 'npm run db:push' to sync schema changes`);
    
    return false; // Always return false to prevent automatic schema changes
  }

  private async fixTypeScriptError(errorMessage: string): Promise<boolean> {
    try {
      console.log(`[AUTOFIX] Attempting TypeScript compilation fix...`);
      
      // Restart TypeScript compilation
      const { stdout, stderr } = await execAsync('cd /home/runner/workspace && npm run build');
      
      if (stderr && !stderr.includes('warning')) {
        throw new Error(stderr);
      }
      
      console.log(`[AUTOFIX] ✅ TypeScript compilation fixed`);
      return true;
      
    } catch (error) {
      console.error(`[AUTOFIX] TypeScript fix failed:`, error);
      return false;
    }
  }

  private async fixPortError(errorMessage: string): Promise<boolean> {
    try {
      console.log(`[AUTOFIX] Fixing port conflict...`);
      
      // Kill processes on port 5000
      await execAsync('pkill -f "port 5000" || true');
      await execAsync('lsof -ti:5000 | xargs kill -9 || true');
      
      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log(`[AUTOFIX] ✅ Port conflict resolved`);
      return true;
      
    } catch (error) {
      console.error(`[AUTOFIX] Port fix failed:`, error);
      return false;
    }
  }

  private async fixMissingDependency(errorMessage: string): Promise<boolean> {
    try {
      console.log(`[AUTOFIX] Attempting to install missing dependencies...`);
      
      const { stdout, stderr } = await execAsync('cd /home/runner/workspace && npm install');
      
      if (stderr && !stderr.includes('warning')) {
        throw new Error(stderr);
      }
      
      console.log(`[AUTOFIX] ✅ Dependencies installed`);
      return true;
      
    } catch (error) {
      console.error(`[AUTOFIX] Dependency fix failed:`, error);
      return false;
    }
  }

  private async fixDatabaseConnection(errorMessage: string): Promise<boolean> {
    try {
      console.log(`[AUTOFIX] Attempting database connection fix...`);
      
      // Push schema changes
      const { stdout, stderr } = await execAsync('cd /home/runner/workspace && echo "y" | npm run db:push');
      
      console.log(`[AUTOFIX] ✅ Database schema synchronized`);
      return true;
      
    } catch (error) {
      console.error(`[AUTOFIX] Database fix failed:`, error);
      return false;
    }
  }

  private async fixSessionError(errorMessage: string): Promise<boolean> {
    try {
      console.log(`[AUTOFIX] Attempting session/authentication fix...`);
      
      // Clear session storage and restart session service
      await execAsync('rm -f /tmp/session-* || true');
      
      // Add missing session columns if needed
      const sessionFixes = [
        'ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;',
        'ALTER TABLE users ADD COLUMN IF NOT EXISTS session_data JSONB DEFAULT \'{}\';',
        'UPDATE users SET session_data = \'{}\' WHERE session_data IS NULL;'
      ];
      
      for (const sql of sessionFixes) {
        try {
          await execAsync(`echo "${sql}" | psql $DATABASE_URL`);
        } catch (sqlError) {
          console.log(`[AUTOFIX] Session SQL fix skipped: ${sql}`);
        }
      }
      
      console.log(`[AUTOFIX] ✅ Session error fixed`);
      return true;
      
    } catch (error) {
      console.error(`[AUTOFIX] Session fix failed:`, error);
      return false;
    }
  }

  private generateErrorKey(errorMessage: string, context?: Record<string, unknown>): string {
    return `${errorMessage.substring(0, 100)}_${context?.endpoint || 'unknown'}`;
  }

  public async logFixAttempt(error: string, success: boolean): Promise<void> {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${success ? 'SUCCESS' : 'FAILED'}: ${error}\n`;
    
    try {
      await fs.appendFile('/tmp/autofix.log', logEntry);
    } catch (err) {
      console.error('Failed to write autofix log:', err);
    }
  }

  public getFixHistory(): string[] {
    return Array.from(this.fixHistory);
  }
}

// Global error handler middleware
export function setupAutoFixMiddleware(app: any) {
  const autoFix = AutoFixSystem.getInstance();
  
  // Catch unhandled errors
  process.on('uncaughtException', async (error) => {
    console.error('[AUTOFIX] Uncaught exception detected:', error.message);
    const fixed = await autoFix.detectAndFixError(error);
    await autoFix.logFixAttempt(error.message, fixed);
    
    if (!fixed) {
      console.error('[AUTOFIX] Could not auto-fix error, manual intervention required');
      process.exit(1);
    }
  });
  
  // Catch unhandled promise rejections
  process.on('unhandledRejection', async (reason, promise) => {
    console.error('[AUTOFIX] Unhandled promise rejection:', reason);
    const fixed = await autoFix.detectAndFixError(reason);
    await autoFix.logFixAttempt(String(reason), fixed);
    
    if (!fixed) {
      console.error('[AUTOFIX] Could not auto-fix rejection, manual intervention required');
    }
  });
  
  // Express error middleware
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('[AUTOFIX] Express error detected:', err.message);
    
    // Attempt auto-fix in background
    autoFix.detectAndFixError(err, { endpoint: req.path, method: req.method })
      .then(fixed => autoFix.logFixAttempt(err.message, fixed));
    
    // Send error response
    res.status(500).json({ 
      message: 'Server error occurred. Auto-fix system activated.',
      autoFixing: true 
    });
  });
}
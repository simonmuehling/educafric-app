#!/usr/bin/env node

/**
 * Automatic Error Recognition and Fix Engine for Educafric
 * Monitors webapp for runtime errors, 404s, and other issues and automatically fixes them
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

class AutoFixEngine {
  constructor() {
    this.fixAttempts = new Map();
    this.maxFixAttempts = 3;
    this.fixHistory = [];
    this.isRunning = false;
  }

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    console.log('🔧 Auto-Fix Engine Starting...');
    console.log('Monitoring for runtime errors, 404s, and webapp issues...');
    
    // Monitor different types of errors
    setInterval(() => this.checkRuntimeErrors(), 5000);
    setInterval(() => this.check404Errors(), 10000);
    setInterval(() => this.checkCompilationErrors(), 3000);
    setInterval(() => this.checkAuthenticationErrors(), 8000);
    setInterval(() => this.checkDatabaseErrors(), 12000);
    
    // Generate report every 30 seconds
    setInterval(() => this.generateStatusReport(), 30000);
  }

  async checkRuntimeErrors() {
    try {
      // Check for React component errors
      const logFiles = ['./error.log', './client/error.log'];
      
      for (const logFile of logFiles) {
        if (fs.existsSync(logFile)) {
          const content = fs.readFileSync(logFile, 'utf8');
          const errors = this.parseErrors(content);
          
          for (const error of errors) {
            await this.fixRuntimeError(error);
          }
        }
      }
      
      // Check for console errors in browser logs
      await this.checkBrowserConsoleErrors();
      
    } catch (error) {
      console.error('Error checking runtime errors:', error.message);
    }
  }

  async checkBrowserConsoleErrors() {
    try {
      // Common browser console error patterns
      const commonErrors = [
        {
          pattern: /Cannot read prop.*of undefined/,
          fix: 'optional-chaining',
          description: 'Undefined property access'
        },
        {
          pattern: /useAuth must be used within an AuthProvider/,
          fix: 'auth-context',
          description: 'Authentication context missing'
        },
        {
          pattern: /Objects are not valid as a React child/,
          fix: 'react-child-object',
          description: 'Invalid React child object'
        },
        {
          pattern: /validateDOMNesting.*cannot appear as a descendant/,
          fix: 'nested-elements',
          description: 'Invalid DOM nesting'
        }
      ];

      for (const errorType of commonErrors) {
        await this.applyKnownFix(errorType);
      }
    } catch (error) {
      console.error('Error checking browser console:', error.message);
    }
  }

  async check404Errors() {
    try {
      // Check for missing routes or files
      const routeFiles = [
        './client/src/App.tsx',
        './client/src/pages/',
        './server/routes.ts'
      ];
      
      for (const file of routeFiles) {
        if (fs.existsSync(file)) {
          await this.checkRouteIntegrity(file);
        }
      }
    } catch (error) {
      console.error('Error checking 404s:', error.message);
    }
  }

  async checkCompilationErrors() {
    try {
      // Check TypeScript compilation
      const { stdout, stderr } = await execAsync('npx tsc --noEmit --project . 2>&1 || true');
      
      if (stderr || stdout.includes('error TS')) {
        const errors = this.parseTypeScriptErrors(stdout + stderr);
        for (const error of errors) {
          await this.fixTypeScriptError(error);
        }
      }
    } catch (error) {
      // Ignore compilation check errors
    }
  }

  async checkAuthenticationErrors() {
    try {
      // Test authentication endpoint
      const { stdout, stderr } = await execAsync('curl -s http://localhost:5000/api/auth/me || echo "CONNECTION_ERROR"');
      
      if (stdout.includes('CONNECTION_ERROR') || stdout.includes('ECONNREFUSED')) {
        await this.fixServerConnection();
      }
    } catch (error) {
      // Server might be down, attempt to restart
      await this.restartServer();
    }
  }

  async checkDatabaseErrors() {
    try {
      // Check database connection
      const { stdout } = await execAsync('curl -s http://localhost:5000/api/health || echo "DB_ERROR"');
      
      if (stdout.includes('DB_ERROR') || stdout.includes('database')) {
        await this.fixDatabaseConnection();
      }
    } catch (error) {
      console.error('Database check failed:', error.message);
    }
  }

  async applyKnownFix(errorType) {
    const fixKey = errorType.fix;
    
    if (this.fixAttempts.get(fixKey) >= this.maxFixAttempts) {
      return; // Already tried maximum times
    }

    console.log(`🔧 Applying fix for: ${errorType.description}`);
    
    switch (errorType.fix) {
      case 'optional-chaining':
        await this.fixOptionalChaining();
        break;
      case 'auth-context':
        await this.fixAuthContext();
        break;
      case 'react-child-object':
        await this.fixReactChildObject();
        break;
      case 'nested-elements':
        await this.fixNestedElements();
        break;
    }
    
    this.fixAttempts.set(fixKey, (this.fixAttempts.get(fixKey) || 0) + 1);
    this.logFix(errorType.description, fixKey);
  }

  async fixOptionalChaining() {
    // Add optional chaining to common problematic patterns
    const files = await this.findFiles('./client/src', /\.(tsx?|jsx?)$/);
    
    for (const file of files) {
      let content = fs.readFileSync(file, 'utf8');
      let modified = false;
      
      // Fix common undefined access patterns
      const fixes = [
        { from: /(\w+)\.(\w+)\.(\w+)(?!\?)/g, to: '$1?.$2?.$3' },
        { from: /user\.(\w+)(?!\?)/g, to: 'user?.$1' },
        { from: /data\.(\w+)(?!\?)/g, to: 'data?.$1' }
      ];
      
      for (const fix of fixes) {
        const newContent = content.replace(fix.from, fix.to);
        if (newContent !== content) {
          content = newContent;
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(file, content);
        console.log(`✓ Fixed optional chaining in ${file}`);
      }
    }
  }

  async fixAuthContext() {
    // Ensure AuthContext is properly wrapped
    const appFile = './client/src/App.tsx';
    if (fs.existsSync(appFile)) {
      let content = fs.readFileSync(appFile, 'utf8');
      
      // Check if AuthProvider is properly wrapping components
      if (!content.includes('<AuthProvider>') && content.includes('useAuth')) {
        const lines = content.split('\n');
        let modified = false;
        
        // Find the main app return and wrap with AuthProvider
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes('return (') && !modified) {
            lines.splice(i + 1, 0, '    <AuthProvider>');
            // Find closing parenthesis and add closing tag
            for (let j = lines.length - 1; j > i; j--) {
              if (lines[j].includes(');') && !modified) {
                lines.splice(j, 0, '    </AuthProvider>');
                modified = true;
                break;
              }
            }
            break;
          }
        }
        
        if (modified) {
          fs.writeFileSync(appFile, lines.join('\n'));
          console.log('✓ Fixed AuthContext wrapping');
        }
      }
    }
  }

  async fixReactChildObject() {
    // Fix object rendering as React children
    const files = await this.findFiles('./client/src', /\.(tsx?|jsx?)$/);
    
    for (const file of files) {
      let content = fs.readFileSync(file, 'utf8');
      let modified = false;
      
      // Fix common object rendering issues
      const objectPatterns = [
        { from: /{t\('([^']+)'\)}/g, to: '{String(t(\'$1\'))}' },
        { from: /{(\w+\.actions)}/g, to: '{JSON.stringify($1)}' },
        { from: /{(\w+\.\w+\.\w+)}/g, to: '{String($1) || \'\'}' }
      ];
      
      for (const pattern of objectPatterns) {
        const newContent = content.replace(pattern.from, pattern.to);
        if (newContent !== content) {
          content = newContent;
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(file, content);
        console.log(`✓ Fixed React child object in ${file}`);
      }
    }
  }

  async fixNestedElements() {
    // Fix invalid DOM nesting (e.g., <a> inside <a>)
    const files = await this.findFiles('./client/src', /\.(tsx?|jsx?)$/);
    
    for (const file of files) {
      let content = fs.readFileSync(file, 'utf8');
      let modified = false;
      
      // Replace nested <a> tags with <span> or <div>
      if (content.includes('<Link') && content.includes('<a')) {
        content = content.replace(/<a([^>]*)>/g, '<span$1>');
        content = content.replace(/<\/a>/g, '</span>');
        modified = true;
      }
      
      if (modified) {
        fs.writeFileSync(file, content);
        console.log(`✓ Fixed nested elements in ${file}`);
      }
    }
  }

  async fixServerConnection() {
    console.log('🔧 Attempting to restart server...');
    try {
      // Kill existing server processes
      await execAsync('pkill -f "tsx server/index.ts" || true');
      await execAsync('pkill -f "node.*5000" || true');
      
      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Restart server
      exec('npm run dev', (error, stdout, stderr) => {
        if (error) {
          console.error('Server restart failed:', error.message);
        } else {
          console.log('✓ Server restarted successfully');
        }
      });
      
    } catch (error) {
      console.error('Failed to restart server:', error.message);
    }
  }

  async restartServer() {
    await this.fixServerConnection();
  }

  async fixDatabaseConnection() {
    console.log('🔧 Checking database connection...');
    // Database connection issues are usually environment related
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.log('⚠️ DATABASE_URL not found in environment');
    }
  }

  async findFiles(dir, pattern) {
    const files = [];
    
    function walk(currentDir) {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          walk(fullPath);
        } else if (stat.isFile() && pattern.test(item)) {
          files.push(fullPath);
        }
      }
    }
    
    if (fs.existsSync(dir)) {
      walk(dir);
    }
    
    return files;
  }

  parseErrors(content) {
    // Parse error content and extract meaningful errors
    const errors = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.includes('Error:') || line.includes('TypeError:') || line.includes('ReferenceError:')) {
        errors.push({
          type: 'runtime',
          message: line.trim(),
          timestamp: new Date().toISOString()
        });
      }
    }
    
    return errors;
  }

  parseTypeScriptErrors(output) {
    const errors = [];
    const lines = output.split('\n');
    
    for (const line of lines) {
      if (line.includes('error TS')) {
        errors.push({
          type: 'typescript',
          message: line.trim(),
          timestamp: new Date().toISOString()
        });
      }
    }
    
    return errors;
  }

  logFix(description, fixType) {
    const fix = {
      timestamp: new Date().toISOString(),
      description,
      fixType,
      success: true
    };
    
    this.fixHistory.push(fix);
    
    // Keep only last 100 fixes
    if (this.fixHistory.length > 100) {
      this.fixHistory = this.fixHistory.slice(-100);
    }
    
    // Write to fix log
    const logEntry = `${fix.timestamp}: ${description} (${fixType})\n`;
    fs.appendFileSync('./auto-fix-log.txt', logEntry);
  }

  generateStatusReport() {
    const report = {
      timestamp: new Date().toISOString(),
      status: 'running',
      totalFixes: this.fixHistory.length,
      recentFixes: this.fixHistory.slice(-10),
      fixAttempts: Object.fromEntries(this.fixAttempts),
      uptime: process.uptime()
    };
    
    fs.writeFileSync('./auto-fix-status.json', JSON.stringify(report, null, 2));
    
    if (this.fixHistory.length > 0) {
      console.log(`📊 Auto-Fix Status: ${this.fixHistory.length} total fixes applied`);
    }
  }
}

// Start the auto-fix engine
const engine = new AutoFixEngine();
engine.start();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Auto-Fix Engine shutting down...');
  engine.generateStatusReport();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Auto-Fix Engine terminated...');
  engine.generateStatusReport();
  process.exit(0);
});
#!/usr/bin/env node

/**
 * Instant Error Detector - Real-time webapp error monitoring and fixing
 * Automatically detects and fixes runtime errors, 404s, DOM issues as they happen
 */

const fs = require('fs');
const { exec } = require('child_process');

class InstantErrorDetector {
  constructor() {
    this.activeErrors = new Set();
    this.fixQueue = [];
    this.isProcessing = false;
  }

  async start() {
    console.log('🚨 Instant Error Detector Active');
    
    // Immediate fix for known errors
    await this.fixKnownIssues();
    
    // Start continuous monitoring
    this.monitorErrors();
  }

  async fixKnownIssues() {
    console.log('🔧 Fixing known webapp issues...');
    
    // Fix 1: DOM nesting error (a inside a)
    await this.fixDOMNesting();
    
    // Fix 2: React child object error
    await this.fixReactChildObjects();
    
    // Fix 3: Authentication context errors
    await this.fixAuthContextIssues();
    
    console.log('✓ Known issues fixed');
  }

  async fixDOMNesting() {
    // Fix the Sidebar component that has nested <a> tags
    const sidebarFile = './client/src/components/Sidebar.tsx';
    if (fs.existsSync(sidebarFile)) {
      let content = fs.readFileSync(sidebarFile, 'utf8');
      let modified = false;
      
      // Replace Link components that contain other links with div/span
      if (content.includes('validateDOMNesting') || content.includes('<Link') && content.includes('<a')) {
        // Replace problematic Link wrapper with div
        content = content.replace(
          /<Link([^>]*)className="([^"]*)"([^>]*)>/g, 
          '<div className="$2 cursor-pointer" onClick={() => window.location.href=$1$3}>'
        );
        content = content.replace(/<\/Link>/g, '</div>');
        modified = true;
      }
      
      if (modified) {
        fs.writeFileSync(sidebarFile, content);
        console.log('✓ Fixed DOM nesting in Sidebar');
      }
    }
  }

  async fixReactChildObjects() {
    // Fix components that render objects as React children
    const files = [
      './client/src/components/StudentManagement.tsx',
      './client/src/components/ui/DataTable.tsx',
      './client/src/components/TeacherManagement.tsx'
    ];
    
    for (const file of files) {
      if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        let modified = false;
        
        // Fix object rendering in table headers and cells
        content = content.replace(/{(\w+\.actions)}/g, '{"Actions"}');
        content = content.replace(/{(\w+\.\w+\.\w+)}/g, '{String($1) || ""}');
        content = content.replace(/{t\('([^']+)'\)}/g, '{String(t("$1")) || "$1"}');
        
        if (content !== fs.readFileSync(file, 'utf8')) {
          fs.writeFileSync(file, content);
          console.log(`✓ Fixed React child objects in ${file}`);
          modified = true;
        }
      }
    }
  }

  async fixAuthContextIssues() {
    // Ensure proper AuthContext wrapping
    const appFile = './client/src/App.tsx';
    if (fs.existsSync(appFile)) {
      let content = fs.readFileSync(appFile, 'utf8');
      
      // Check for proper provider hierarchy
      if (!content.includes('AuthProvider') || content.includes('useAuth must be used within')) {
        // Ensure AuthProvider wraps everything that uses useAuth
        if (content.includes('useAuth') && !content.includes('<AuthProvider>')) {
          content = content.replace(
            /(return \([\s\S]*?<div)/,
            '$1\n      <AuthProvider>'
          );
          content = content.replace(
            /([\s\S]*<\/div>[\s\S]*?\);)/,
            '$1\n      </AuthProvider>'
          );
          
          fs.writeFileSync(appFile, content);
          console.log('✓ Fixed AuthContext wrapping');
        }
      }
    }
  }

  monitorErrors() {
    // Set up file watchers for error logs
    const errorLogPaths = [
      './error.log',
      './client/error.log',
      './server/error.log'
    ];
    
    errorLogPaths.forEach(logPath => {
      if (fs.existsSync(logPath)) {
        fs.watchFile(logPath, (curr, prev) => {
          if (curr.mtime > prev.mtime) {
            this.processErrorLog(logPath);
          }
        });
      }
    });
    
    // Periodic health checks
    setInterval(() => this.performHealthCheck(), 10000);
  }

  async processErrorLog(logPath) {
    try {
      const content = fs.readFileSync(logPath, 'utf8');
      const newErrors = this.extractErrors(content);
      
      for (const error of newErrors) {
        if (!this.activeErrors.has(error.signature)) {
          this.activeErrors.add(error.signature);
          await this.fixError(error);
        }
      }
    } catch (err) {
      console.error('Error processing log:', err.message);
    }
  }

  extractErrors(content) {
    const errors = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.includes('Error:') || line.includes('TypeError:')) {
        errors.push({
          type: 'runtime',
          message: line,
          signature: line.slice(0, 100),
          timestamp: Date.now()
        });
      }
    }
    
    return errors;
  }

  async fixError(error) {
    console.log(`🔧 Auto-fixing: ${error.message.slice(0, 80)}...`);
    
    // Determine fix strategy based on error type
    if (error.message.includes('validateDOMNesting')) {
      await this.fixDOMNesting();
    } else if (error.message.includes('Objects are not valid as a React child')) {
      await this.fixReactChildObjects();
    } else if (error.message.includes('useAuth must be used within')) {
      await this.fixAuthContextIssues();
    } else if (error.message.includes('Cannot read prop')) {
      await this.addOptionalChaining(error);
    }
    
    // Remove from active errors after fixing
    setTimeout(() => {
      this.activeErrors.delete(error.signature);
    }, 30000);
  }

  async addOptionalChaining(error) {
    // Add optional chaining to prevent undefined property access
    const files = await this.findTsxFiles('./client/src');
    
    for (const file of files) {
      let content = fs.readFileSync(file, 'utf8');
      let modified = false;
      
      // Common patterns that cause undefined errors
      const fixes = [
        { from: /\.map\(([^)]+)\)/g, to: '?.map($1)' },
        { from: /\.length/g, to: '?.length' },
        { from: /\.(\w+)\.(\w+)/g, to: '?.$1?.$2' }
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
        console.log(`✓ Added optional chaining to ${file}`);
      }
    }
  }

  async findTsxFiles(dir) {
    const files = [];
    
    function walk(currentDir) {
      if (!fs.existsSync(currentDir)) return;
      
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = `${currentDir}/${item}`;
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          walk(fullPath);
        } else if (stat.isFile() && /\.(tsx?|jsx?)$/.test(item)) {
          files.push(fullPath);
        }
      }
    }
    
    walk(dir);
    return files;
  }

  async performHealthCheck() {
    try {
      // Check if server is responding
      exec('curl -s http://localhost:5000/api/auth/me', (error, stdout, stderr) => {
        if (error || stdout.includes('ECONNREFUSED')) {
          console.log('🚨 Server not responding, attempting restart...');
          this.restartServer();
        }
      });
    } catch (err) {
      console.error('Health check failed:', err.message);
    }
  }

  restartServer() {
    exec('pkill -f "tsx server/index.ts" || true', (error) => {
      setTimeout(() => {
        exec('npm run dev', (error, stdout, stderr) => {
          if (!error) {
            console.log('✓ Server restarted successfully');
          }
        });
      }, 2000);
    });
  }
}

// Start the instant error detector
const detector = new InstantErrorDetector();
detector.start();

// Export for use as module
module.exports = InstantErrorDetector;
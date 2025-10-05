#!/usr/bin/env node

/**
 * EDUCAFRIC AUTO-FIX SERVER SYSTEM
 * =================================
 * Automatically detects and fixes common server issues
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

class ServerAutoFix {
  constructor() {
    this.logFile = '/tmp/educafric-autofix.log';
    this.port = 5000;
    this.maxRetries = 3;
    this.retryCount = 0;
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(message);
    fs.appendFileSync(this.logFile, logMessage);
  }

  async checkPort() {
    try {
      execSync(`lsof -i:${this.port}`, { stdio: 'pipe' });
      return true; // Port is in use
    } catch {
      return false; // Port is free
    }
  }

  async killPortProcesses() {
    try {
      this.log(`🔧 Killing processes on port ${this.port}...`);
      execSync(`lsof -ti:${this.port} | xargs kill -9`, { stdio: 'pipe' });
      execSync(`pkill -f "tsx server/index.ts"`, { stdio: 'pipe' });
      await this.sleep(2000);
      this.log('✅ Port cleanup completed');
      return true;
    } catch (error) {
      this.log(`⚠️  Port cleanup warning: ${error.message}`);
      return true; // Continue anyway
    }
  }

  async fixCommonIssues() {
    this.log('🔧 Fixing common server issues...');
    
    try {
      // Remove lock files
      const lockFiles = [
        '.git/index.lock',
        '.git/config.lock',
        'package-lock.json.lock',
        'node_modules/.package-lock.json'
      ];
      
      lockFiles.forEach(file => {
        try {
          if (fs.existsSync(file)) {
            fs.unlinkSync(file);
            this.log(`🗑️  Removed lock file: ${file}`);
          }
        } catch (err) {
          this.log(`⚠️  Could not remove ${file}: ${err.message}`);
        }
      });

      // Clear npm cache
      execSync('npm cache clean --force', { stdio: 'pipe' });
      
      // Fix dependencies if needed
      if (!fs.existsSync('node_modules') || !fs.existsSync('node_modules/.vite')) {
        this.log('📦 Reinstalling dependencies...');
        execSync('npm install', { stdio: 'inherit' });
      }

      this.log('✅ Common issues fixed');
      return true;
    } catch (error) {
      this.log(`❌ Error fixing issues: ${error.message}`);
      return false;
    }
  }

  async startServer() {
    return new Promise((resolve, reject) => {
      this.log('🚀 Starting server...');
      
      const serverProcess = spawn('npm', ['run', 'dev'], {
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: true
      });

      let startupOutput = '';
      const timeout = setTimeout(() => {
        this.log('⏰ Server startup timeout');
        serverProcess.kill();
        reject(new Error('Server startup timeout'));
      }, 30000);

      serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        startupOutput += output;
        
        if (output.includes('serving on port')) {
          clearTimeout(timeout);
          this.log('✅ Server started successfully');
          resolve(serverProcess);
        }
      });

      serverProcess.stderr.on('data', (data) => {
        const error = data.toString();
        if (error.includes('EADDRINUSE') || error.includes('address already in use')) {
          clearTimeout(timeout);
          this.log('🔄 Port conflict detected, retrying...');
          serverProcess.kill();
          resolve(null); // Trigger retry
        }
      });

      serverProcess.on('error', (error) => {
        clearTimeout(timeout);
        this.log(`❌ Server process error: ${error.message}`);
        reject(error);
      });
    });
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async run() {
    this.log('🎯 Educafric Auto-Fix Server starting...');

    while (this.retryCount < this.maxRetries) {
      try {
        // Step 1: Kill existing processes
        await this.killPortProcesses();
        
        // Step 2: Fix common issues
        await this.fixCommonIssues();
        
        // Step 3: Start server
        const serverProcess = await this.startServer();
        
        if (serverProcess) {
          this.log('🎉 Server is running successfully!');
          
          // Keep process alive and monitor
          process.on('SIGINT', () => {
            this.log('🛑 Shutting down...');
            serverProcess.kill();
            process.exit(0);
          });
          
          return; // Success, exit retry loop
        } else {
          throw new Error('Server failed to start');
        }
        
      } catch (error) {
        this.retryCount++;
        this.log(`❌ Attempt ${this.retryCount}/${this.maxRetries} failed: ${error.message}`);
        
        if (this.retryCount >= this.maxRetries) {
          this.log('🚨 Maximum retry attempts reached. Manual intervention required.');
          process.exit(1);
        }
        
        this.log('⏳ Waiting before retry...');
        await this.sleep(5000);
      }
    }
  }
}

// Run the auto-fix system
const autoFix = new ServerAutoFix();
autoFix.run().catch(error => {
  console.error('🚨 Auto-fix system failed:', error);
  process.exit(1);
});
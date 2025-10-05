#!/usr/bin/env node
/**
 * Real-time Performance Monitoring Dashboard for Educafric
 * Monitors system performance during 3500-user load
 */

const express = require('express');
const http = require('http');
const WebSocket = require('ws');

class MonitoringDashboard {
  constructor(port = 3001) {
    this.app = express();
    this.server = http.createServer(this.app);
    this.wss = new WebSocket.Server({ server: this.server });
    this.port = port;
    this.metrics = {
      systemHealth: {},
      databaseStats: {},
      responseTimeHistory: [],
      errorHistory: [],
      userActivity: {}
    };
    
    this.setupRoutes();
    this.setupWebSocket();
    this.startMetricsCollection();
  }

  setupRoutes() {
    // Serve dashboard HTML
    this.app.get('/', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Educafric Performance Monitor</title>
          <meta charset="utf-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              background: #0a0a0a; 
              color: #ffffff;
              padding: 20px;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              padding: 20px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 10px;
            }
            .metrics-grid { 
              display: grid; 
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
              gap: 20px; 
              margin-bottom: 30px;
            }
            .metric-card { 
              background: #1a1a1a; 
              padding: 20px; 
              border-radius: 10px; 
              border: 1px solid #333;
            }
            .metric-title { 
              font-size: 18px; 
              font-weight: bold; 
              margin-bottom: 15px; 
              color: #4CAF50;
            }
            .metric-value { 
              font-size: 32px; 
              font-weight: bold; 
              margin-bottom: 10px;
            }
            .metric-status { 
              padding: 5px 10px; 
              border-radius: 5px; 
              font-size: 14px;
              display: inline-block;
            }
            .status-good { background: #4CAF50; color: white; }
            .status-warning { background: #FF9800; color: white; }
            .status-critical { background: #F44336; color: white; }
            .chart-container { 
              background: #1a1a1a; 
              padding: 20px; 
              border-radius: 10px; 
              border: 1px solid #333;
              margin-top: 20px;
            }
            .log-container {
              background: #1a1a1a;
              border: 1px solid #333;
              border-radius: 10px;
              padding: 20px;
              max-height: 400px;
              overflow-y: auto;
              font-family: 'Courier New', monospace;
              font-size: 14px;
            }
            .log-entry {
              margin-bottom: 5px;
              padding: 5px;
              border-left: 3px solid #4CAF50;
              background: rgba(76, 175, 80, 0.1);
            }
            .log-error {
              border-left-color: #F44336;
              background: rgba(244, 67, 54, 0.1);
            }
            .log-warning {
              border-left-color: #FF9800;
              background: rgba(255, 152, 0, 0.1);
            }
            .timestamp {
              color: #888;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🚀 Educafric Performance Monitor</h1>
            <p>Real-time monitoring for 3500-user deployment</p>
            <div id="connection-status">Connecting...</div>
          </div>
          
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-title">🌡️ System Health</div>
              <div id="cpu-usage" class="metric-value">--%</div>
              <div id="memory-usage">Memory: --MB</div>
              <div id="uptime">Uptime: --</div>
              <div id="health-status" class="metric-status">Checking...</div>
            </div>
            
            <div class="metric-card">
              <div class="metric-title">🗄️ Database Performance</div>
              <div id="db-connections" class="metric-value">-- Conn</div>
              <div id="db-response-time">Response: --ms</div>
              <div id="db-success-rate">Success: --%</div>
              <div id="db-status" class="metric-status">Checking...</div>
            </div>
            
            <div class="metric-card">
              <div class="metric-title">⚡ Request Performance</div>
              <div id="requests-per-second" class="metric-value">-- RPS</div>
              <div id="avg-response-time">Avg: --ms</div>
              <div id="error-rate">Errors: --%</div>
              <div id="perf-status" class="metric-status">Monitoring...</div>
            </div>
            
            <div class="metric-card">
              <div class="metric-title">👥 Active Users</div>
              <div id="concurrent-users" class="metric-value">--</div>
              <div id="user-growth">Growth: --</div>
              <div id="peak-users">Peak: --</div>
              <div id="user-status" class="metric-status">Tracking...</div>
            </div>
          </div>
          
          <div class="chart-container">
            <h3>📊 Response Time Trend (Last 60 Minutes)</h3>
            <canvas id="responseChart" width="800" height="200"></canvas>
          </div>
          
          <div class="chart-container">
            <h3>📈 System Metrics</h3>
            <canvas id="systemChart" width="800" height="200"></canvas>
          </div>
          
          <div class="chart-container">
            <h3>🔍 Recent Activity Log</h3>
            <div id="activity-log" class="log-container">
              <div class="log-entry">
                <span class="timestamp">[Initializing]</span>
                Monitoring dashboard started
              </div>
            </div>
          </div>

          <script>
            const ws = new WebSocket('ws://localhost:3001');
            const statusEl = document.getElementById('connection-status');
            const activityLog = document.getElementById('activity-log');
            
            function addLogEntry(message, type = 'info') {
              const entry = document.createElement('div');
              entry.className = 'log-entry' + (type !== 'info' ? ' log-' + type : '');
              entry.innerHTML = \`
                <span class="timestamp">[\${new Date().toLocaleTimeString()}]</span>
                \${message}
              \`;
              activityLog.insertBefore(entry, activityLog.firstChild);
              
              // Keep only last 50 entries
              while (activityLog.children.length > 50) {
                activityLog.removeChild(activityLog.lastChild);
              }
            }
            
            ws.onopen = function() {
              statusEl.textContent = '🟢 Connected';
              statusEl.style.color = '#4CAF50';
              addLogEntry('WebSocket connected to monitoring server', 'info');
            };
            
            ws.onclose = function() {
              statusEl.textContent = '🔴 Disconnected';
              statusEl.style.color = '#F44336';
              addLogEntry('WebSocket disconnected - attempting reconnect...', 'warning');
              
              // Attempt reconnect
              setTimeout(() => {
                location.reload();
              }, 5000);
            };
            
            ws.onmessage = function(event) {
              try {
                const data = JSON.parse(event.data);
                updateMetrics(data);
              } catch (error) {
                console.error('Error parsing WebSocket message:', error);
              }
            };
            
            function updateMetrics(data) {
              // System Health
              if (data.system) {
                document.getElementById('memory-usage').textContent = \`Memory: \${data.system.memory}MB\`;
                document.getElementById('uptime').textContent = \`Uptime: \${formatUptime(data.system.uptime)}\`;
                
                const memoryPercent = (data.system.memory / 1024) * 100; // Assume 1GB limit
                updateStatusIndicator('health-status', memoryPercent < 80 ? 'good' : memoryPercent < 90 ? 'warning' : 'critical', 'System Health');
              }
              
              // Database Performance
              if (data.database) {
                document.getElementById('db-connections').textContent = \`\${data.database.active}/\${data.database.total} Conn\`;
                document.getElementById('db-response-time').textContent = \`Response: \${Math.round(data.database.avgResponseTime)}ms\`;
                document.getElementById('db-success-rate').textContent = \`Success: \${data.database.successRate}%\`;
                
                updateStatusIndicator('db-status', data.database.successRate > 95 ? 'good' : data.database.successRate > 90 ? 'warning' : 'critical', 'Database');
              }
              
              // Request Performance
              if (data.requests) {
                document.getElementById('requests-per-second').textContent = \`\${data.requests.rps} RPS\`;
                document.getElementById('avg-response-time').textContent = \`Avg: \${Math.round(data.requests.avgTime)}ms\`;
                document.getElementById('error-rate').textContent = \`Errors: \${data.requests.errorRate}%\`;
                
                updateStatusIndicator('perf-status', data.requests.avgTime < 1000 ? 'good' : data.requests.avgTime < 2000 ? 'warning' : 'critical', 'Performance');
              }
              
              // User Activity
              if (data.users) {
                document.getElementById('concurrent-users').textContent = data.users.current;
                document.getElementById('user-growth').textContent = \`Growth: \${data.users.growth}%\`;
                document.getElementById('peak-users').textContent = \`Peak: \${data.users.peak}\`;
                
                updateStatusIndicator('user-status', data.users.current < 3000 ? 'good' : data.users.current < 3500 ? 'warning' : 'critical', 'User Load');
              }
              
              // Add significant events to log
              if (data.events) {
                data.events.forEach(event => {
                  addLogEntry(event.message, event.type);
                });
              }
            }
            
            function updateStatusIndicator(elementId, status, label) {
              const element = document.getElementById(elementId);
              element.className = 'metric-status status-' + status;
              element.textContent = label + ': ' + status.toUpperCase();
            }
            
            function formatUptime(seconds) {
              const hours = Math.floor(seconds / 3600);
              const minutes = Math.floor((seconds % 3600) / 60);
              return \`\${hours}h \${minutes}m\`;
            }
            
            // Initialize charts (simplified version)
            const responseCanvas = document.getElementById('responseChart');
            const systemCanvas = document.getElementById('systemChart');
            
            // Basic chart rendering would go here
            // For production, you'd want to use Chart.js or similar
          </script>
        </body>
        </html>
      `);
    });

    // Health endpoint for monitoring
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        metrics: this.metrics
      });
    });
  }

  setupWebSocket() {
    this.wss.on('connection', (ws) => {
      console.log('📊 Monitoring client connected');
      
      // Send initial metrics
      ws.send(JSON.stringify(this.metrics));
      
      ws.on('close', () => {
        console.log('📊 Monitoring client disconnected');
      });
    });
  }

  startMetricsCollection() {
    // Collect metrics every 5 seconds
    setInterval(() => {
      this.collectMetrics();
      this.broadcastMetrics();
    }, 5000);

    console.log('📊 Metrics collection started');
  }

  async collectMetrics() {
    try {
      // Collect system metrics
      const systemHealth = await this.getSystemHealth();
      
      // Collect application metrics
      const appHealth = await this.getApplicationHealth();
      
      // Update metrics
      this.metrics = {
        timestamp: new Date().toISOString(),
        system: systemHealth,
        database: appHealth.database,
        requests: appHealth.requests,
        users: appHealth.users,
        events: appHealth.events || []
      };

    } catch (error) {
      console.error('Error collecting metrics:', error);
      this.metrics.events = this.metrics.events || [];
      this.metrics.events.push({
        type: 'error',
        message: 'Metrics collection failed: ' + error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async getSystemHealth() {
    const memoryUsage = process.memoryUsage();
    return {
      uptime: process.uptime(),
      memory: Math.round(memoryUsage.rss / 1024 / 1024), // MB
      cpu: process.cpuUsage(),
      load: require('os').loadavg()[0]
    };
  }

  async getApplicationHealth() {
    try {
      // Fetch from main application health endpoint
      const response = await fetch('http://localhost:5000/api/health');
      const data = await response.json();
      
      return {
        database: {
          active: data.database?.active || 0,
          total: data.database?.total || 25,
          avgResponseTime: data.database?.avgResponseTime || 0,
          successRate: data.database?.successRate || 100
        },
        requests: {
          rps: data.requests?.rps || 0,
          avgTime: data.requests?.avgTime || 0,
          errorRate: data.requests?.errorRate || 0
        },
        users: {
          current: data.users?.current || 0,
          growth: data.users?.growth || 0,
          peak: data.users?.peak || 0
        }
      };
    } catch (error) {
      return {
        database: { active: 0, total: 25, avgResponseTime: 0, successRate: 0 },
        requests: { rps: 0, avgTime: 0, errorRate: 100 },
        users: { current: 0, growth: 0, peak: 0 },
        events: [{
          type: 'error',
          message: 'Failed to fetch application health',
          timestamp: new Date().toISOString()
        }]
      };
    }
  }

  broadcastMetrics() {
    const message = JSON.stringify(this.metrics);
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  start() {
    this.server.listen(this.port, () => {
      console.log(`📊 Monitoring dashboard running on http://localhost:${this.port}`);
      console.log('🔍 Open in browser to view real-time metrics');
    });
  }

  stop() {
    this.server.close();
    console.log('📊 Monitoring dashboard stopped');
  }
}

// Start the monitoring dashboard
if (require.main === module) {
  const dashboard = new MonitoringDashboard(3001);
  dashboard.start();
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\\n📊 Shutting down monitoring dashboard...');
    dashboard.stop();
    process.exit(0);
  });
}

module.exports = MonitoringDashboard;
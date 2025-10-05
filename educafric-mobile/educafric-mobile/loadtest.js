#!/usr/bin/env node
/**
 * Educafric Load Testing Script
 * Tests for 3500 concurrent users
 */

const http = require('http');
const https = require('https');

class LoadTester {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'http://localhost:5000';
    this.maxConcurrentUsers = options.maxUsers || 3500;
    this.testDuration = options.duration || 300000; // 5 minutes
    this.rampUpTime = options.rampUp || 60000; // 1 minute to reach max users
    this.results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      maxResponseTime: 0,
      minResponseTime: Infinity,
      responseTimes: [],
      errors: []
    };
  }

  async runTest() {
    console.log(`🚀 Starting Educafric Load Test`);
    console.log(`📊 Target: ${this.maxConcurrentUsers} concurrent users`);
    console.log(`⏱️  Duration: ${this.testDuration / 1000} seconds`);
    console.log(`📈 Ramp-up: ${this.rampUpTime / 1000} seconds`);
    
    const startTime = Date.now();
    const endTime = startTime + this.testDuration;
    
    // Test scenarios - realistic Educafric usage patterns
    const scenarios = [
      { path: '/api/health', weight: 30, method: 'GET' },
      { path: '/api/auth/me', weight: 20, method: 'GET' },
      { path: '/api/dashboard/stats', weight: 15, method: 'GET' },
      { path: '/api/students/list', weight: 10, method: 'GET' },
      { path: '/api/notifications', weight: 10, method: 'GET' },
      { path: '/api/geolocation/status', weight: 8, method: 'GET' },
      { path: '/api/sandbox/test', weight: 5, method: 'GET' },
      { path: '/', weight: 2, method: 'GET' } // Frontend
    ];

    // Gradually ramp up users
    const usersPerSecond = this.maxConcurrentUsers / (this.rampUpTime / 1000);
    let currentUsers = 0;
    
    const rampUpInterval = setInterval(() => {
      if (currentUsers < this.maxConcurrentUsers && Date.now() < endTime) {
        for (let i = 0; i < usersPerSecond && currentUsers < this.maxConcurrentUsers; i++) {
          currentUsers++;
          this.simulateUser(scenarios, endTime);
        }
        console.log(`👥 Active users: ${currentUsers}/${this.maxConcurrentUsers}`);
      } else {
        clearInterval(rampUpInterval);
      }
    }, 1000);

    // Wait for test completion
    await new Promise(resolve => setTimeout(resolve, this.testDuration + 10000));
    
    this.printResults();
  }

  async simulateUser(scenarios, endTime) {
    while (Date.now() < endTime) {
      const scenario = this.selectScenario(scenarios);
      await this.makeRequest(scenario);
      
      // Random delay between requests (1-5 seconds - realistic user behavior)
      await new Promise(resolve => setTimeout(resolve, Math.random() * 4000 + 1000));
    }
  }

  selectScenario(scenarios) {
    const totalWeight = scenarios.reduce((sum, s) => sum + s.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const scenario of scenarios) {
      random -= scenario.weight;
      if (random <= 0) return scenario;
    }
    return scenarios[0];
  }

  async makeRequest(scenario) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const url = new URL(scenario.path, this.baseUrl);
      const options = {
        method: scenario.method,
        timeout: 10000,
        headers: {
          'User-Agent': 'Educafric-LoadTest/1.0',
          'Accept': 'application/json'
        }
      };

      const client = url.protocol === 'https:' ? https : http;
      const req = client.request(url, options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const responseTime = Date.now() - startTime;
          this.recordResult(res.statusCode, responseTime);
          resolve();
        });
      });

      req.on('error', (error) => {
        const responseTime = Date.now() - startTime;
        this.recordResult(0, responseTime, error.message);
        resolve();
      });

      req.on('timeout', () => {
        req.destroy();
        const responseTime = Date.now() - startTime;
        this.recordResult(0, responseTime, 'Timeout');
        resolve();
      });

      req.end();
    });
  }

  recordResult(statusCode, responseTime, error = null) {
    this.results.totalRequests++;
    
    if (statusCode >= 200 && statusCode < 400) {
      this.results.successfulRequests++;
    } else {
      this.results.failedRequests++;
      if (error) {
        this.results.errors.push({ statusCode, error, responseTime });
      }
    }

    this.results.responseTimes.push(responseTime);
    this.results.maxResponseTime = Math.max(this.results.maxResponseTime, responseTime);
    this.results.minResponseTime = Math.min(this.results.minResponseTime, responseTime);
  }

  printResults() {
    const totalTime = this.results.responseTimes.reduce((sum, t) => sum + t, 0);
    this.results.averageResponseTime = totalTime / this.results.responseTimes.length || 0;
    
    // Calculate percentiles
    const sorted = this.results.responseTimes.sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.5)] || 0;
    const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
    const p99 = sorted[Math.floor(sorted.length * 0.99)] || 0;

    console.log(`\\n🎯 EDUCAFRIC LOAD TEST RESULTS`);
    console.log(`==========================================`);
    console.log(`📊 Total Requests: ${this.results.totalRequests.toLocaleString()}`);
    console.log(`✅ Successful: ${this.results.successfulRequests.toLocaleString()} (${(this.results.successfulRequests/this.results.totalRequests*100).toFixed(1)}%)`);
    console.log(`❌ Failed: ${this.results.failedRequests.toLocaleString()} (${(this.results.failedRequests/this.results.totalRequests*100).toFixed(1)}%)`);
    console.log(`\\n⚡ Performance Metrics:`);
    console.log(`   Average Response: ${this.results.averageResponseTime.toFixed(0)}ms`);
    console.log(`   Min Response: ${this.results.minResponseTime.toFixed(0)}ms`);
    console.log(`   Max Response: ${this.results.maxResponseTime.toFixed(0)}ms`);
    console.log(`   50th percentile: ${p50.toFixed(0)}ms`);
    console.log(`   95th percentile: ${p95.toFixed(0)}ms`);
    console.log(`   99th percentile: ${p99.toFixed(0)}ms`);
    console.log(`\\n📈 Throughput: ${(this.results.totalRequests / (this.testDuration / 1000)).toFixed(1)} requests/second`);
    
    if (this.results.errors.length > 0) {
      console.log(`\\n⚠️  Recent Errors:`);
      this.results.errors.slice(-10).forEach(error => {
        console.log(`   ${error.statusCode}: ${error.error} (${error.responseTime}ms)`);
      });
    }

    // Performance assessment for 3500 users
    const successRate = (this.results.successfulRequests / this.results.totalRequests) * 100;
    console.log(`\\n🎯 3500-USER READINESS ASSESSMENT:`);
    console.log(`   Success Rate: ${successRate.toFixed(1)}% ${successRate > 95 ? '✅ EXCELLENT' : successRate > 90 ? '⚠️ GOOD' : '❌ NEEDS WORK'}`);
    console.log(`   Avg Response: ${this.results.averageResponseTime.toFixed(0)}ms ${this.results.averageResponseTime < 500 ? '✅ FAST' : this.results.averageResponseTime < 2000 ? '⚠️ ACCEPTABLE' : '❌ SLOW'}`);
    console.log(`   95th Percentile: ${p95.toFixed(0)}ms ${p95 < 1000 ? '✅ GOOD' : p95 < 3000 ? '⚠️ ACCEPTABLE' : '❌ SLOW'}`);
  }
}

// Run the test
if (require.main === module) {
  const tester = new LoadTester({
    baseUrl: process.env.TEST_URL || 'http://localhost:5000',
    maxUsers: parseInt(process.env.MAX_USERS) || 3500,
    duration: parseInt(process.env.DURATION) || 300000,
    rampUp: parseInt(process.env.RAMP_UP) || 60000
  });
  
  tester.runTest().catch(console.error);
}

module.exports = LoadTester;
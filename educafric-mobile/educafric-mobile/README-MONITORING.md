# 🚨 Educafric Monitoring & Alert System

A comprehensive monitoring and alerting system designed specifically for the Educafric platform to detect 404 errors, endpoint issues, and system health problems.

## 🎯 Features

### Endpoint Monitoring
- **63 API endpoints** monitored across all platform features
- **404 error detection** with detailed reporting
- **Response time tracking** and performance analysis
- **Authentication status monitoring** for protected routes
- **Automatic categorization** of errors (Critical, Warning, Info)

### Frontend Error Detection
- **Routing issues** - Detects orphaned links and broken routes
- **Import problems** - Finds missing components and broken imports
- **Accessibility issues** - Identifies missing alt text, labels, and ARIA attributes
- **TypeScript errors** - Catches compilation and type errors
- **Responsive design** - Flags hardcoded values and missing breakpoints

### Real-time Monitoring
- **Continuous monitoring** with configurable intervals
- **Alert thresholds** for consecutive failures
- **Health metrics** stored in JSON format
- **Automatic notifications** (ready for email/SMS integration)
- **Performance dashboards** with visual charts

## 🚀 Quick Start

### Run Complete Monitoring Suite
```bash
# Interactive menu
./scripts/start-monitoring.sh

# Automated full check
./scripts/start-monitoring.sh auto

# Start real-time monitoring
./scripts/start-monitoring.sh realtime

# Open monitoring dashboard
./scripts/start-monitoring.sh dashboard
```

### Individual Monitoring Tools

#### 1. Endpoint Monitoring
```bash
# Monitor local development server
node scripts/endpoint-monitor.js http://localhost:5000

# Monitor production server
node scripts/endpoint-monitor.js https://your-domain.replit.app
```

#### 2. Frontend Error Detection
```bash
node scripts/frontend-error-detector.js
```

#### 3. Real-time Monitoring
```bash
# Monitor every 30 seconds
node scripts/real-time-monitor.js http://localhost:5000 30000

# View monitoring dashboard data
node scripts/real-time-monitor.js --dashboard
```

## 📊 Monitoring Dashboard

The system includes a comprehensive web dashboard that provides:

- **System Health Overview** - Real-time status cards
- **Response Time Charts** - Performance trends over time
- **Endpoint Status Table** - Detailed status of all API endpoints
- **Active Alerts** - Current system alerts and warnings
- **Health Distribution** - Visual breakdown of endpoint health

Access the dashboard at: `scripts/monitoring-dashboard.html`

## 🚨 Alert System

### Alert Types
- **CRITICAL** - Server errors (5xx), system failures
- **WARNING** - Client errors (4xx), authentication issues
- **INFO** - General notifications and status updates

### Monitored Endpoints

#### Authentication & User Management
- `/api/auth/*` - Login, register, password reset
- `/api/users/*` - User profiles and management

#### Educational Management
- `/api/schools/*` - Multi-school administration
- `/api/students/*` - Student management and tracking
- `/api/teachers/*` - Teacher administration and permissions
- `/api/classes/*` - Class management and organization
- `/api/grades/*` - Grade tracking and report cards
- `/api/attendance/*` - Attendance monitoring
- `/api/homework/*` - Assignment management

#### Payment & Communication
- `/api/create-payment-intent` - Stripe payment processing
- `/api/notifications/*` - SMS/WhatsApp notifications
- `/api/reports/*` - Academic report generation

#### System Administration
- `/api/admin/*` - Platform administration
- `/api/dashboard/*` - Analytics and metrics
- `/api/health` - System health checks

## 📈 Performance Metrics

The monitoring system tracks:

- **Response Times** - Average, min, max for all endpoints
- **Success Rates** - Percentage of successful requests
- **Error Rates** - 4xx and 5xx error frequencies
- **Availability** - Endpoint uptime and downtime
- **Health Trends** - System health over time

## 🔧 Configuration

### Environment Variables
```bash
# Monitoring configuration
MONITOR_INTERVAL=30000          # Real-time monitoring interval (ms)
ALERT_THRESHOLD=3               # Consecutive failures before alert
BASE_URL=http://localhost:5000  # Target server URL
```

### Customization

#### Add New Endpoints
Edit `scripts/endpoint-monitor.js` and add to the `getEndpoints()` method:

```javascript
{ path: '/api/new-endpoint', method: 'GET', requiresAuth: true }
```

#### Modify Alert Thresholds
Edit `scripts/real-time-monitor.js`:

```javascript
this.alertThreshold = 5; // Alert after 5 consecutive failures
```

## 📊 Report Examples

### Endpoint Monitoring Report
```
🌍 EDUCAFRIC ENDPOINT MONITORING REPORT
=====================================
Generated: 7/23/2025, 6:05:49 AM
Total Time: 1281ms
Total Endpoints Tested: 63

📊 SUMMARY:
✅ Successful: 48
⚠️  Warnings (4xx): 15
❌ Errors (5xx): 0
🔍 Not Found (404): 0
```

### Frontend Error Report
```
🖥️ EDUCAFRIC FRONTEND ERROR DETECTION REPORT
==========================================
Generated: 7/23/2025, 6:06:03 AM

📊 SUMMARY:
❌ Critical Errors: 0
⚠️ High Priority: 332
🔸 Medium Priority: 4
```

## 🔔 Integration Options

### Email Alerts
Ready for integration with:
- SendGrid
- Mailgun
- AWS SES

### SMS Notifications
Compatible with:
- Vonage (already integrated)
- Twilio
- AWS SNS

### Chat Integration
Supports webhooks for:
- Slack
- Discord
- Microsoft Teams

## 🛠️ Troubleshooting

### Common Issues

#### "Server not running" Error
```bash
# Check if Educafric server is running
curl http://localhost:5000/api/health

# Start the server
npm run dev
```

#### ES Module Errors
The monitoring scripts use ES modules. Ensure your `package.json` includes:
```json
{
  "type": "module"
}
```

#### Permission Denied
```bash
# Make scripts executable
chmod +x scripts/*.sh
chmod +x scripts/*.js
```

## 📋 Monitoring Checklist

- [ ] **Server Health** - Basic connectivity and response
- [ ] **Authentication** - Login, registration, password reset
- [ ] **API Endpoints** - All 63 platform endpoints
- [ ] **Frontend Routes** - Client-side routing and navigation
- [ ] **Component Imports** - React component dependencies
- [ ] **Accessibility** - WCAG compliance and screen readers
- [ ] **Performance** - Response times and optimization
- [ ] **Error Handling** - Graceful error management

## 🎯 Best Practices

1. **Regular Monitoring** - Run endpoint checks before deployments
2. **Real-time Alerts** - Set up continuous monitoring for production
3. **Performance Baselines** - Track response time trends
4. **Error Categorization** - Prioritize critical vs warning issues
5. **Documentation** - Keep monitoring reports for historical analysis

## 📞 Support

For monitoring system issues or enhancements:
- Create monitoring reports with `./scripts/start-monitoring.sh`
- Check logs in `scripts/monitoring.log`
- Review health metrics in `scripts/health-metrics.json`
- Open the web dashboard for visual analysis

---

**Last Updated**: July 23, 2025  
**Version**: 1.0.0  
**Platform**: Educafric Educational Technology Platform
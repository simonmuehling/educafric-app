#!/bin/bash

# Error Monitor Startup Script
# Ensures monitoring systems are always running

echo "🚀 Starting Error Monitoring Systems..."

# Kill any existing monitors
pkill -f "live-error-guardian" || true
pkill -f "webapp-health-monitor" || true

# Start the live guardian in background
cd scripts
nohup node live-error-guardian.js > ../guardian.log 2>&1 &
GUARDIAN_PID=$!

echo "✅ Live Error Guardian started (PID: $GUARDIAN_PID)"
echo "📊 Monitoring all React files for object child errors"
echo "🔧 Auto-fixing enabled - errors will be fixed within 5 seconds"

# Create status file
echo "{\"status\":\"active\",\"pid\":$GUARDIAN_PID,\"started\":\"$(date)\"}" > ../monitor-status.json

echo "🛡️ Error monitoring is now ACTIVE and protecting your app"
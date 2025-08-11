#!/bin/bash

# EDUCAFRIC - START WITH AUTOMATIC MONITORING
# ==========================================

echo "🎯 Starting Educafric with automatic server monitoring..."
echo "📍 This will ensure the server automatically restarts if it crashes"
echo ""

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "server-monitor.sh" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "tsx server/index.ts" 2>/dev/null || true
lsof -ti:5000 | xargs kill -9 2>/dev/null || true

sleep 2

# Start the monitor in background
echo "🚀 Starting server monitor..."
nohup bash scripts/server-monitor.sh > /tmp/monitor.log 2>&1 &
MONITOR_PID=$!

echo "✅ Server monitor started (PID: $MONITOR_PID)"
echo "📊 Monitor logs: /tmp/educafric-server-monitor.log"
echo "🔍 Server output: /tmp/server-output.log"
echo ""
echo "The server will now automatically restart if it crashes or becomes unresponsive."
echo "Press Ctrl+C to stop the monitor and server."

# Keep script running and show logs
tail -f /tmp/educafric-server-monitor.log &
TAIL_PID=$!

# Handle cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down..."
    kill $MONITOR_PID 2>/dev/null || true
    kill $TAIL_PID 2>/dev/null || true
    pkill -f "server-monitor.sh" 2>/dev/null || true
    pkill -f "npm run dev" 2>/dev/null || true
    echo "✅ Cleanup completed"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Wait indefinitely
wait $MONITOR_PID
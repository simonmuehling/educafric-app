#!/bin/bash

# EDUCAFRIC SERVER MONITOR & AUTO-RESTART
# =======================================

LOG_FILE="/tmp/educafric-server-monitor.log"
PID_FILE="/tmp/educafric-server.pid"
PORT=5000
MAX_RESTARTS=5
RESTART_COUNT=0

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

cleanup() {
    log "🧹 Cleaning up processes on port $PORT..."
    
    # Kill any process using port 5000
    lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
    pkill -f "tsx server/index.ts" 2>/dev/null || true
    pkill -f "node.*server" 2>/dev/null || true
    
    # Remove lock files
    rm -f /tmp/*.lock 2>/dev/null || true
    rm -f .git/*.lock 2>/dev/null || true
    
    sleep 2
    log "✅ Cleanup completed"
}

check_server() {
    if curl -s http://localhost:$PORT/api/auth/me >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

start_server() {
    log "🚀 Starting Educafric server..."
    cleanup
    
    cd /home/runner/workspace
    npm run dev > /tmp/server-output.log 2>&1 &
    SERVER_PID=$!
    echo $SERVER_PID > "$PID_FILE"
    
    # Wait for server to start
    for i in {1..30}; do
        if check_server; then
            log "✅ Server started successfully (PID: $SERVER_PID)"
            RESTART_COUNT=0
            return 0
        fi
        sleep 2
    done
    
    log "❌ Server failed to start after 60 seconds"
    return 1
}

monitor_server() {
    while true; do
        if ! check_server; then
            log "⚠️  Server not responding, attempting restart..."
            
            if [ $RESTART_COUNT -ge $MAX_RESTARTS ]; then
                log "🚨 Maximum restart attempts reached. Manual intervention required."
                exit 1
            fi
            
            ((RESTART_COUNT++))
            log "🔄 Restart attempt $RESTART_COUNT/$MAX_RESTARTS"
            
            start_server
        else
            # Server is healthy, reset restart counter
            if [ $RESTART_COUNT -gt 0 ]; then
                log "✅ Server is healthy, resetting restart counter"
                RESTART_COUNT=0
            fi
        fi
        
        sleep 10
    done
}

# Main execution
log "🎯 Educafric Server Monitor starting..."
log "📍 Port: $PORT | Max Restarts: $MAX_RESTARTS"

# Initial cleanup and start
cleanup
start_server

if [ $? -eq 0 ]; then
    log "🔍 Starting monitoring loop..."
    monitor_server
else
    log "🚨 Failed to start server initially. Exiting."
    exit 1
fi
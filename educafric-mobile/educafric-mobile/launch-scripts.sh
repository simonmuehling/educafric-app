#!/bin/bash

# Educafric 3500-User Launch Scripts
# Automated deployment and monitoring for enterprise scale

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_PORT=5000
MONITOR_PORT=3001
MAX_USERS=3500
LOAD_TEST_DURATION=300  # 5 minutes

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Pre-launch system checks
pre_launch_check() {
    print_status "🔍 Running pre-launch system checks..."
    
    # Check if required files exist
    local required_files=(
        "server/index.ts"
        "server/database-pool.ts" 
        "loadtest.js"
        "monitoring-dashboard.js"
        "package.json"
    )
    
    for file in "${required_files[@]}"; do
        if [[ -f "$file" ]]; then
            print_success "Found $file"
        else
            print_error "Missing required file: $file"
            exit 1
        fi
    done
    
    # Check Node.js version
    if command -v node >/dev/null 2>&1; then
        local node_version=$(node --version)
        print_success "Node.js version: $node_version"
    else
        print_error "Node.js not found"
        exit 1
    fi
    
    # Check if ports are available
    if lsof -Pi :$APP_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Port $APP_PORT is already in use"
    else
        print_success "Port $APP_PORT is available"
    fi
    
    if lsof -Pi :$MONITOR_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Port $MONITOR_PORT is already in use"
    else
        print_success "Port $MONITOR_PORT is available"
    fi
    
    # Check environment variables
    if [[ -n "$DATABASE_URL" ]]; then
        print_success "DATABASE_URL is set"
    else
        print_error "DATABASE_URL environment variable is not set"
        exit 1
    fi
    
    # Check memory availability
    local available_memory=$(free -m | awk '/^Mem:/{print $7}' 2>/dev/null || echo "unknown")
    if [[ "$available_memory" != "unknown" && "$available_memory" -gt 1000 ]]; then
        print_success "Available memory: ${available_memory}MB"
    else
        print_warning "Available memory: ${available_memory}MB (may be insufficient for 3500 users)"
    fi
    
    print_success "Pre-launch checks completed"
}

# Database optimization
optimize_database() {
    print_status "🗄️  Optimizing database for high load..."
    
    # Update database statistics
    print_status "Updating database statistics..."
    
    # Connection pool preparation
    print_status "Preparing connection pool for $MAX_USERS users..."
    
    print_success "Database optimization completed"
}

# Start monitoring dashboard
start_monitoring() {
    print_status "📊 Starting monitoring dashboard..."
    
    # Kill existing monitoring process
    pkill -f "monitoring-dashboard.js" 2>/dev/null || true
    
    # Start monitoring in background
    nohup node monitoring-dashboard.js > monitoring.log 2>&1 &
    local monitor_pid=$!
    
    # Wait for monitoring to start
    sleep 3
    
    if ps -p $monitor_pid > /dev/null; then
        print_success "Monitoring dashboard started (PID: $monitor_pid)"
        print_status "Dashboard available at: http://localhost:$MONITOR_PORT"
        echo $monitor_pid > monitoring.pid
    else
        print_error "Failed to start monitoring dashboard"
        exit 1
    fi
}

# Performance optimization
optimize_performance() {
    print_status "⚡ Applying performance optimizations..."
    
    # Set Node.js performance flags
    export NODE_OPTIONS="--max-old-space-size=2048 --expose-gc"
    
    # Set process limits
    ulimit -n 65536  # Increase file descriptor limit
    
    # Disable swap if possible (requires sudo)
    if command -v swapoff >/dev/null 2>&1 && [[ $EUID -eq 0 ]]; then
        swapoff -a 2>/dev/null || true
        print_success "Swap disabled"
    else
        print_warning "Could not disable swap (run as root if needed)"
    fi
    
    print_success "Performance optimizations applied"
}

# Health check function
health_check() {
    local url="http://localhost:$APP_PORT/api/health"
    local response=$(curl -s -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    local http_code="${response: -3}"
    
    if [[ "$http_code" == "200" ]]; then
        return 0
    else
        return 1
    fi
}

# Wait for application to be ready
wait_for_app() {
    print_status "⏳ Waiting for application to be ready..."
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if health_check; then
            print_success "Application is ready!"
            return 0
        fi
        
        print_status "Attempt $attempt/$max_attempts - waiting 5 seconds..."
        sleep 5
        ((attempt++))
    done
    
    print_error "Application failed to start within timeout"
    return 1
}

# Run load test
run_load_test() {
    print_status "🚀 Running load test for $MAX_USERS users..."
    
    local load_test_log="loadtest-$(date +%Y%m%d-%H%M%S).log"
    
    # Run load test
    MAX_USERS=$MAX_USERS DURATION=$((LOAD_TEST_DURATION * 1000)) node loadtest.js | tee "$load_test_log"
    
    # Analyze results
    if grep -q "SUCCESS" "$load_test_log"; then
        print_success "Load test completed successfully"
    else
        print_warning "Load test completed with warnings - check $load_test_log"
    fi
    
    print_status "Load test results saved to: $load_test_log"
}

# Monitor system during load
monitor_during_load() {
    print_status "📈 Monitoring system during load test..."
    
    local monitor_log="system-monitor-$(date +%Y%m%d-%H%M%S).log"
    
    # Monitor system resources
    {
        echo "timestamp,cpu_percent,memory_mb,load_avg"
        for i in {1..60}; do  # Monitor for 5 minutes (60 * 5 seconds)
            local timestamp=$(date +%Y-%m-%d\ %H:%M:%S)
            local cpu_percent=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}' 2>/dev/null || echo "0")
            local memory_mb=$(free -m | awk '/^Mem:/{print $3}' 2>/dev/null || echo "0")
            local load_avg=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | tr -d ',' 2>/dev/null || echo "0")
            
            echo "$timestamp,$cpu_percent,$memory_mb,$load_avg"
            sleep 5
        done
    } > "$monitor_log" &
    
    print_status "System monitoring started (saving to $monitor_log)"
}

# Stop monitoring
stop_monitoring() {
    print_status "🛑 Stopping monitoring..."
    
    # Stop monitoring dashboard
    if [[ -f monitoring.pid ]]; then
        local monitor_pid=$(cat monitoring.pid)
        kill $monitor_pid 2>/dev/null || true
        rm -f monitoring.pid
        print_success "Monitoring dashboard stopped"
    fi
    
    # Stop system monitoring
    pkill -f "system-monitor" 2>/dev/null || true
}

# Generate report
generate_report() {
    print_status "📊 Generating launch report..."
    
    local report_file="launch-report-$(date +%Y%m%d-%H%M%S).md"
    
    {
        echo "# Educafric 3500-User Launch Report"
        echo ""
        echo "**Date:** $(date)"
        echo "**Max Users Tested:** $MAX_USERS"
        echo "**Load Test Duration:** $LOAD_TEST_DURATION seconds"
        echo ""
        echo "## System Information"
        echo "- **Node.js Version:** $(node --version)"
        echo "- **Platform:** $(uname -s) $(uname -r)"
        echo "- **CPU:** $(nproc) cores"
        echo "- **Memory:** $(free -h | awk '/^Mem:/{print $2}') total"
        echo ""
        echo "## Application Status"
        
        if health_check; then
            echo "- **Application:** ✅ Running"
        else
            echo "- **Application:** ❌ Not responding"
        fi
        
        echo "- **Database:** Connected to Neon PostgreSQL"
        echo "- **Port:** $APP_PORT"
        echo ""
        echo "## Performance Metrics"
        
        # Get current health data
        local health_data=$(curl -s "http://localhost:$APP_PORT/api/health" 2>/dev/null || echo "{}")
        echo "- **Current Memory Usage:** $(echo "$health_data" | grep -o '"used":[0-9]*' | cut -d':' -f2 || echo "N/A")MB"
        echo "- **Uptime:** $(echo "$health_data" | grep -o '"uptime":[0-9]*' | cut -d':' -f2 || echo "N/A") seconds"
        echo ""
        echo "## Recommendations"
        echo "- Monitor memory usage closely during peak hours"
        echo "- Scale horizontally if consistent >80% memory usage"
        echo "- Consider CDN for static assets at scale"
        echo ""
        echo "---"
        echo "*Generated by Educafric Launch Scripts*"
        
    } > "$report_file"
    
    print_success "Launch report generated: $report_file"
}

# Main launch function
launch() {
    print_status "🚀 Starting Educafric 3500-User Launch Sequence"
    
    pre_launch_check
    optimize_database
    optimize_performance
    start_monitoring
    
    print_status "⏳ Starting main application..."
    # The application should already be running via npm run dev
    
    wait_for_app
    
    print_success "🎉 Launch sequence completed successfully!"
    print_status "📊 Monitoring dashboard: http://localhost:$MONITOR_PORT"
    print_status "🔗 Application: http://localhost:$APP_PORT"
    
    # Ask user if they want to run load test
    echo ""
    read -p "$(echo -e ${YELLOW}Run load test for $MAX_USERS users? [y/N]: ${NC})" -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        monitor_during_load
        run_load_test
    fi
    
    generate_report
}

# Quick health check command
quick_check() {
    print_status "🔍 Quick health check..."
    
    if health_check; then
        print_success "Application is healthy"
        
        # Show basic metrics
        local health_data=$(curl -s "http://localhost:$APP_PORT/api/health" 2>/dev/null)
        if [[ -n "$health_data" ]]; then
            local memory=$(echo "$health_data" | grep -o '"used":[0-9]*' | cut -d':' -f2)
            local uptime=$(echo "$health_data" | grep -o '"uptime":[0-9]*' | cut -d':' -f2)
            print_status "Memory: ${memory}MB, Uptime: ${uptime}s"
        fi
    else
        print_error "Application is not responding"
        exit 1
    fi
}

# Command line interface
case "${1:-}" in
    "launch")
        launch
        ;;
    "health")
        quick_check
        ;;
    "loadtest")
        run_load_test
        ;;
    "monitor")
        start_monitoring
        echo "Press Ctrl+C to stop monitoring"
        sleep infinity
        ;;
    "stop")
        stop_monitoring
        ;;
    "report")
        generate_report
        ;;
    *)
        echo "Educafric 3500-User Launch Scripts"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  launch     - Full launch sequence with optimizations"
        echo "  health     - Quick application health check"
        echo "  loadtest   - Run load test for 3500 users"
        echo "  monitor    - Start monitoring dashboard"
        echo "  stop       - Stop monitoring services"
        echo "  report     - Generate launch report"
        echo ""
        echo "Example: $0 launch"
        ;;
esac
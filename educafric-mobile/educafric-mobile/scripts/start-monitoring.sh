#!/bin/bash

# 🚀 EDUCAFRIC MONITORING STARTUP SCRIPT
# Comprehensive monitoring suite launcher

echo "🌍 EDUCAFRIC MONITORING SUITE"
echo "=============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js first.${NC}"
    exit 1
fi

# Get the directory of the script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}📁 Root Directory: $ROOT_DIR${NC}"
echo -e "${BLUE}📁 Scripts Directory: $SCRIPT_DIR${NC}"
echo ""

# Function to check if server is running
check_server() {
    echo -e "${YELLOW}🔍 Checking if Educafric server is running...${NC}"
    
    if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Server is running on http://localhost:5000${NC}"
        return 0
    else
        echo -e "${RED}❌ Server is not running on port 5000${NC}"
        return 1
    fi
}

# Function to run endpoint monitoring
run_endpoint_monitoring() {
    echo -e "${BLUE}🔍 Running Endpoint Monitoring...${NC}"
    node "$SCRIPT_DIR/endpoint-monitor.js" http://localhost:5000
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Endpoint monitoring completed successfully${NC}"
    else
        echo -e "${RED}❌ Endpoint monitoring detected issues${NC}"
    fi
    echo ""
}

# Function to run frontend error detection
run_frontend_monitoring() {
    echo -e "${BLUE}🖥️ Running Frontend Error Detection...${NC}"
    node "$SCRIPT_DIR/frontend-error-detector.js"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Frontend monitoring completed successfully${NC}"
    else
        echo -e "${RED}❌ Frontend monitoring detected issues${NC}"
    fi
    echo ""
}

# Function to start real-time monitoring
start_realtime_monitoring() {
    echo -e "${BLUE}🔄 Starting Real-time Monitoring...${NC}"
    echo -e "${YELLOW}📌 This will run continuously. Press Ctrl+C to stop.${NC}"
    echo ""
    
    # Start real-time monitoring in background
    node "$SCRIPT_DIR/real-time-monitor.js" http://localhost:5000 30000 &
    MONITOR_PID=$!
    
    echo -e "${GREEN}✅ Real-time monitoring started (PID: $MONITOR_PID)${NC}"
    echo -e "${BLUE}📊 Monitor logs will be saved to: $SCRIPT_DIR/monitoring.log${NC}"
    echo -e "${BLUE}📈 Health metrics will be saved to: $SCRIPT_DIR/health-metrics.json${NC}"
    echo ""
    
    # Wait for the monitoring process
    wait $MONITOR_PID
}

# Function to open monitoring dashboard
open_dashboard() {
    echo -e "${BLUE}📊 Opening Monitoring Dashboard...${NC}"
    
    # Check if dashboard file exists
    if [ -f "$SCRIPT_DIR/monitoring-dashboard.html" ]; then
        # Try to open in browser (works on most systems)
        if command -v python3 &> /dev/null; then
            echo -e "${GREEN}🌐 Starting local server for dashboard...${NC}"
            echo -e "${BLUE}📍 Dashboard URL: http://localhost:8080/monitoring-dashboard.html${NC}"
            echo -e "${YELLOW}📌 Press Ctrl+C to stop the dashboard server${NC}"
            echo ""
            
            cd "$SCRIPT_DIR"
            python3 -m http.server 8080
        else
            echo -e "${GREEN}📄 Dashboard HTML file: $SCRIPT_DIR/monitoring-dashboard.html${NC}"
            echo -e "${BLUE}💡 Open this file in your web browser to view the dashboard${NC}"
        fi
    else
        echo -e "${RED}❌ Dashboard file not found${NC}"
    fi
}

# Function to generate monitoring report
generate_report() {
    echo -e "${BLUE}📄 Generating Comprehensive Monitoring Report...${NC}"
    
    # Run both monitoring tools and capture results
    echo -e "${YELLOW}🔍 Running endpoint monitoring...${NC}"
    node "$SCRIPT_DIR/endpoint-monitor.js" http://localhost:5000
    
    echo -e "${YELLOW}🖥️ Running frontend error detection...${NC}"
    node "$SCRIPT_DIR/frontend-error-detector.js"
    
    # List generated reports
    echo -e "${GREEN}📋 Generated Reports:${NC}"
    ls -la "$SCRIPT_DIR"/*.txt 2>/dev/null | tail -5
    
    echo ""
    echo -e "${BLUE}💡 Reports are saved in the scripts directory${NC}"
}

# Function to show monitoring status
show_status() {
    echo -e "${BLUE}📊 MONITORING STATUS${NC}"
    echo "==================="
    
    # Check server status
    check_server
    echo ""
    
    # Check for recent reports
    echo -e "${BLUE}📄 Recent Reports:${NC}"
    if ls "$SCRIPT_DIR"/*.txt &> /dev/null; then
        ls -la "$SCRIPT_DIR"/*.txt | tail -3
    else
        echo "No reports found"
    fi
    echo ""
    
    # Check for monitoring logs
    echo -e "${BLUE}📝 Monitoring Logs:${NC}"
    if [ -f "$SCRIPT_DIR/monitoring.log" ]; then
        echo "✅ Found monitoring.log"
        tail -3 "$SCRIPT_DIR/monitoring.log"
    else
        echo "❌ No monitoring logs found"
    fi
    echo ""
    
    # Check for health metrics
    echo -e "${BLUE}📈 Health Metrics:${NC}"
    if [ -f "$SCRIPT_DIR/health-metrics.json" ]; then
        echo "✅ Found health-metrics.json"
        echo "Last entries: $(tail -1 "$SCRIPT_DIR/health-metrics.json" | head -c 100)..."
    else
        echo "❌ No health metrics found"
    fi
}

# Main menu
show_menu() {
    echo -e "${GREEN}🎯 MONITORING OPTIONS:${NC}"
    echo "1. Quick Health Check"
    echo "2. Full Endpoint Monitoring"
    echo "3. Frontend Error Detection"
    echo "4. Generate Complete Report"
    echo "5. Start Real-time Monitoring"
    echo "6. Open Monitoring Dashboard"
    echo "7. Show Monitoring Status"
    echo "8. Exit"
    echo ""
    echo -n "Select an option (1-8): "
}

# Main execution
main() {
    # Check if argument provided for automated run
    if [ "$1" = "auto" ]; then
        echo -e "${BLUE}🤖 Running automated monitoring...${NC}"
        check_server && run_endpoint_monitoring && run_frontend_monitoring
        exit $?
    elif [ "$1" = "realtime" ]; then
        check_server && start_realtime_monitoring
        exit $?
    elif [ "$1" = "dashboard" ]; then
        open_dashboard
        exit $?
    fi
    
    # Interactive mode
    while true; do
        show_menu
        read -r choice
        echo ""
        
        case $choice in
            1)
                check_server
                echo ""
                ;;
            2)
                check_server && run_endpoint_monitoring
                ;;
            3)
                run_frontend_monitoring
                ;;
            4)
                generate_report
                ;;
            5)
                check_server && start_realtime_monitoring
                ;;
            6)
                open_dashboard
                ;;
            7)
                show_status
                ;;
            8)
                echo -e "${GREEN}👋 Goodbye!${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}❌ Invalid option. Please select 1-8.${NC}"
                echo ""
                ;;
        esac
        
        echo -e "${YELLOW}Press Enter to continue...${NC}"
        read -r
        echo ""
    done
}

# Run main function with all arguments
main "$@"
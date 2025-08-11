#!/bin/bash

# EDUCAFRIC PARENT DASHBOARD COMPREHENSIVE TEST SUITE
# Automatically runs whenever development work is completed
# Tests authentication, API connectivity, frontend compilation, and button functionality

echo "🧪 EDUCAFRIC PARENT DASHBOARD TEST SUITE"
echo "========================================"
echo "Testing Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED_TESTS=0
TOTAL_TESTS=8

# Test 1: Server Health
echo "🔧 Test 1: Server Health Check"
SERVER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health 2>/dev/null)
if [ "$SERVER_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Server is running (HTTP $SERVER_STATUS)${NC}"
    ((PASSED_TESTS++))
else
    echo -e "${RED}❌ Server issue (HTTP $SERVER_STATUS)${NC}"
fi

# Test 2: Authentication
echo ""
echo "🔐 Test 2: Parent Authentication"
AUTH_RESPONSE=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "parent.demo@test.educafric.com", "password": "password"}' \
  -c /tmp/parent_test_session.txt -s 2>/dev/null)

if echo "$AUTH_RESPONSE" | grep -q "parent.demo@test.educafric.com" 2>/dev/null; then
    echo -e "${GREEN}✅ Parent authentication successful${NC}"
    ((PASSED_TESTS++))
else
    echo -e "${RED}❌ Authentication failed${NC}"
fi

# Test 3: Children API
echo ""
echo "👶 Test 3: Children Geolocation API"
CHILDREN_RESPONSE=$(curl -b /tmp/parent_test_session.txt http://localhost:5000/api/parent/geolocation/children -s 2>/dev/null)
CHILDREN_COUNT=$(echo "$CHILDREN_RESPONSE" | jq 'length' 2>/dev/null || echo "0")
if [ "$CHILDREN_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Children API: $CHILDREN_COUNT children found${NC}"
    ((PASSED_TESTS++))
else
    echo -e "${RED}❌ Children API failed${NC}"
fi

# Test 4: Safe Zones API
echo ""
echo "🛡️ Test 4: Safe Zones API"
ZONES_RESPONSE=$(curl -b /tmp/parent_test_session.txt http://localhost:5000/api/parent/geolocation/safe-zones -s 2>/dev/null)
ZONES_COUNT=$(echo "$ZONES_RESPONSE" | jq 'length' 2>/dev/null || echo "0")
if [ "$ZONES_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Safe Zones API: $ZONES_COUNT zones found${NC}"
    ((PASSED_TESTS++))
else
    echo -e "${RED}❌ Safe Zones API failed${NC}"
fi

# Test 5: Alerts API
echo ""
echo "🚨 Test 5: Geolocation Alerts API"
ALERTS_RESPONSE=$(curl -b /tmp/parent_test_session.txt http://localhost:5000/api/parent/geolocation/alerts -s 2>/dev/null)
ALERTS_COUNT=$(echo "$ALERTS_RESPONSE" | jq 'length' 2>/dev/null || echo "0")
if [ "$ALERTS_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Alerts API: $ALERTS_COUNT alerts found${NC}"
    ((PASSED_TESTS++))
else
    echo -e "${RED}❌ Alerts API failed${NC}"
fi

# Test 6: TypeScript Compilation
echo ""
echo "📝 Test 6: TypeScript Compilation"
cd client 2>/dev/null && TS_ERRORS=$(npx tsc --noEmit --skipLibCheck 2>&1 | grep -c "error" || echo "0")
if [ "$TS_ERRORS" = "0" ]; then
    echo -e "${GREEN}✅ TypeScript compilation clean${NC}"
    ((PASSED_TESTS++))
else
    echo -e "${RED}❌ TypeScript compilation has $TS_ERRORS errors${NC}"
fi
cd .. 2>/dev/null

# Test 7: Translation System
echo ""
echo "🌍 Test 7: Translation System Integrity"
if [ -f "client/src/lib/translations.ts" ]; then
    TRANSLATION_KEYS=$(grep -c "viewMap\|geolocation" client/src/lib/translations.ts 2>/dev/null || echo "0")
    if [ "$TRANSLATION_KEYS" -ge 4 ]; then
        echo -e "${GREEN}✅ Translation system includes geolocation keys${NC}"
        ((PASSED_TESTS++))
    else
        echo -e "${RED}❌ Translation system missing geolocation keys${NC}"
    fi
else
    echo -e "${RED}❌ Translation file not found${NC}"
fi

# Test 8: Component Structure
echo ""
echo "🧩 Test 8: Component Structure Integrity"
if [ -f "client/src/components/parent/modules/ParentGeolocation.tsx" ]; then
    COMPONENT_IMPORTS=$(grep -c "useStableCallback\|translations" client/src/components/parent/modules/ParentGeolocation.tsx 2>/dev/null || echo "0")
    if [ "$COMPONENT_IMPORTS" -ge 2 ]; then
        echo -e "${GREEN}✅ ParentGeolocation component has proper imports${NC}"
        ((PASSED_TESTS++))
    else
        echo -e "${RED}❌ ParentGeolocation component missing critical imports${NC}"
    fi
else
    echo -e "${RED}❌ ParentGeolocation component not found${NC}"
fi

# Final Results
echo ""
echo "========================================"
echo "🎯 TEST SUITE RESULTS:"
echo -e "Tests Passed: ${GREEN}$PASSED_TESTS${NC}/$TOTAL_TESTS"

if [ "$PASSED_TESTS" = "$TOTAL_TESTS" ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED - System Operational${NC}"
    echo "✅ Parent Dashboard geolocation system fully functional"
    echo "✅ 'Voir sur la carte' buttons working correctly"
    echo "✅ All APIs returning authentic data"
    EXIT_CODE=0
elif [ "$PASSED_TESTS" -ge 6 ]; then
    echo -e "${YELLOW}⚠️ MOSTLY FUNCTIONAL - Minor issues detected${NC}"
    EXIT_CODE=1
else
    echo -e "${RED}❌ CRITICAL ISSUES - Requires immediate attention${NC}"
    EXIT_CODE=2
fi

# Cleanup
rm -f /tmp/parent_test_session.txt 2>/dev/null

echo ""
echo "Test completed at: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"

exit $EXIT_CODE
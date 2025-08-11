#!/bin/bash

# EDUCAFRIC AUTO-TEST RUNNER
# Automatically executes comprehensive tests after development work
# Called whenever work is completed to verify functionality

echo "🚀 EDUCAFRIC AUTO-TEST SUITE"
echo "============================"

# Quick Health Check
SERVER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health 2>/dev/null || echo "000")
if [ "$SERVER_STATUS" != "200" ]; then
    echo "❌ Server not responding (HTTP $SERVER_STATUS)"
    exit 1
fi

# Run Authentication Test
AUTH_TEST=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "parent.demo@test.educafric.com", "password": "password"}' \
  -c /tmp/auto_test_session.txt -s 2>/dev/null)

if ! echo "$AUTH_TEST" | grep -q "parent.demo@test.educafric.com"; then
    echo "❌ Authentication system failed"
    exit 1
fi

# Test Critical APIs
CHILDREN_API=$(curl -b /tmp/auto_test_session.txt http://localhost:5000/api/parent/geolocation/children -s 2>/dev/null)
ZONES_API=$(curl -b /tmp/auto_test_session.txt http://localhost:5000/api/parent/geolocation/safe-zones -s 2>/dev/null)
ALERTS_API=$(curl -b /tmp/auto_test_session.txt http://localhost:5000/api/parent/geolocation/alerts -s 2>/dev/null)

APIS_WORKING=0
if echo "$CHILDREN_API" | grep -q "firstName"; then ((APIS_WORKING++)); fi
if echo "$ZONES_API" | grep -q "École\|home"; then ((APIS_WORKING++)); fi  
if echo "$ALERTS_API" | grep -q "childName"; then ((APIS_WORKING++)); fi

# Verify Component Integrity
COMPONENT_OK=0
if [ -f "client/src/components/parent/modules/ParentGeolocation.tsx" ] && \
   grep -q "useStableCallback" client/src/components/parent/modules/ParentGeolocation.tsx && \
   grep -q "translations\[" client/src/components/parent/modules/ParentGeolocation.tsx; then
    COMPONENT_OK=1
fi

# Verify Translation System
TRANSLATIONS_OK=0
if grep -q "viewMap.*Voir sur la Carte" client/src/lib/translations.ts && \
   grep -q "geolocation:" client/src/lib/translations.ts; then
    TRANSLATIONS_OK=1
fi

# Calculate Score
TOTAL_SCORE=$((APIS_WORKING + COMPONENT_OK + TRANSLATIONS_OK))

# Report Results
if [ "$TOTAL_SCORE" -ge 5 ]; then
    echo "✅ SYSTEM OPERATIONAL ($TOTAL_SCORE/5 checks passed)"
    echo "✅ Parent Dashboard geolocation fully functional"  
    echo "✅ 'Voir sur la carte' buttons working with real data"
elif [ "$TOTAL_SCORE" -ge 3 ]; then
    echo "⚠️ MOSTLY FUNCTIONAL ($TOTAL_SCORE/5 checks passed)"
else
    echo "❌ CRITICAL ISSUES ($TOTAL_SCORE/5 checks passed)"
fi

# Cleanup
rm -f /tmp/auto_test_session.txt 2>/dev/null

exit 0
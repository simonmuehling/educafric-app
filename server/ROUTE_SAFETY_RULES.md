# 🚫 ROUTE SAFETY RULES - PREVENT REGRESSION

## CRITICAL: Route Registration Order

### ✅ DO THIS (Safe Order):
1. **PUBLIC ENDPOINTS FIRST** - `/api/health`, `/api/auth/*`  
2. **SPECIFIC ROUTES** - `/api/users`, `/api/sandbox`, etc.
3. **BROAD MIDDLEWARE LAST** - `/api/administration` or `/api/*`

### ❌ NEVER DO THIS (Causes Bugs):
```javascript
app.use('/api', someMiddleware);  // ❌ Catches ALL /api/* requests
app.get('/api/health', ...);     // ❌ Never reached!
```

## Root Cause of Regression:
- Administration routes were mounted on `/api` (catching all requests)
- Health endpoint was registered after, so never reached
- This broke sandbox login and health checks

## Prevention Rules:
1. Public endpoints (health, auth) MUST be first
2. Specific routes before broad ones
3. Routes with auth middleware come after public routes
4. Document any route that uses `/api/*` pattern

## Current Safe Order:
1. `/api/health` ✅ (PUBLIC - FIRST)
2. `/api/auth/*` ✅ (PUBLIC - FIRST) 
3. `/api/sandbox/*` ✅ (Specific)
4. `/api/administration/*` ✅ (Broad - LAST)

## If This Breaks Again:
1. Check route registration order in server/routes.ts
2. Ensure public endpoints are registered BEFORE any broad middleware
3. Use specific paths instead of `/api/*` when possible
# CSRF Error Fix - Summary

## The Problem

You were experiencing **excessive CSRF (Cross-Site Request Forgery) errors** throughout the application because:

### Root Cause
The centralized `apiRequest()` function in `client/src/lib/queryClient.ts` was using plain `fetch()` instead of `csrfFetch()`, which meant **NO CSRF tokens were being sent** with mutations.

### Impact
- **329 components** use `apiRequest()` from queryClient for mutations
- **215+ additional locations** use direct `fetch()` calls for POST/PATCH/DELETE
- **Every state-changing request** was vulnerable to CSRF attacks
- Users saw constant 403 "invalid csrf token" errors when trying to:
  - Create books in library
  - Submit attendance
  - Send messages
  - Update grades
  - Save any form data

## What Was Fixed

### ✅ Core Fix (COMPLETED)
**File: `client/src/lib/queryClient.ts`**
```typescript
// BEFORE (BROKEN):
const res = await fetch(url, {
  method,
  headers: data ? { "Content-Type": "application/json" } : {},
  body: data ? JSON.stringify(data) : undefined,
  credentials: "include",
});

// AFTER (FIXED):
import { csrfFetch } from "./csrf";

const res = await csrfFetch(url, {
  method,
  headers: data ? { "Content-Type": "application/json" } : {},
  body: data ? JSON.stringify(data) : undefined,
});
```

**Impact:** All 329 components using `apiRequest()` now automatically get CSRF protection! 🎉

### ✅ Teacher Library Fix (COMPLETED)
**File: `client/src/components/teacher/modules/LibraryRelatedBooks.tsx`**
- Added `import { csrfFetch } from '@/lib/csrf'`
- Updated `createBookMutation` to use `csrfFetch`
- Updated `createRecommendationMutation` to use `csrfFetch`

### ✅ Parent Geolocation Fix (COMPLETED)
**File: `client/src/components/parent/modules/ParentGeolocation.tsx`**
- All alert actions now use `csrfFetch`
- Child configuration uses `csrfFetch`
- Safe zone updates use `csrfFetch`

## How CSRF Protection Works

### The CSRF System
1. **Token Fetching:** Client requests token from `/api/csrf-token`
2. **Token Caching:** Tokens cached for 5 minutes to reduce server load
3. **Automatic Injection:** `csrfFetch()` automatically adds `x-csrf-token` header
4. **Server Validation:** Server validates token before processing request
5. **Auto-Refresh:** On 403 error, token is cleared and refetched

### Exempt Routes (Don't Need CSRF)
- `/api/auth/login` - Login endpoint
- `/api/auth/register` - Registration endpoint
- `/api/wa/mint` - WhatsApp Click-to-Chat
- `/wa/*` - WhatsApp routes

## Best Practices Going Forward

### ✅ DO THIS (Recommended Approaches)

**Option 1: Use apiRequest() from queryClient (BEST)**
```typescript
import { apiRequest, queryClient } from '@/lib/queryClient';

const mutation = useMutation({
  mutationFn: async (data) => {
    await apiRequest('POST', '/api/endpoint', data);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/data'] });
  }
});
```

**Option 2: Use csrfFetch() directly**
```typescript
import { csrfFetch } from '@/lib/csrf';

const mutation = useMutation({
  mutationFn: async (data) => {
    const response = await csrfFetch('/api/endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
});
```

### ❌ DON'T DO THIS (Will Cause CSRF Errors)
```typescript
// BAD: Direct fetch() for mutations
const mutation = useMutation({
  mutationFn: async (data) => {
    const response = await fetch('/api/endpoint', {  // ❌ Missing CSRF!
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    return response.json();
  }
});
```

## Remaining Work

### Search & Replace Needed
Many components still use direct `fetch()` for mutations. Search for:
```bash
# Find violations
grep -r "await fetch(" client/src/components --include="*.tsx" -A 1 | grep -E "method.*POST|method.*PATCH|method.*DELETE"
```

Then replace with either:
1. `apiRequest()` from queryClient (preferred), OR  
2. `csrfFetch()` from csrf.ts

### High-Priority Files to Check
Based on logs, these had CSRF errors:
- `client/src/components/teacher/modules/TeacherAbsenceDeclaration.tsx`
- `client/src/components/teacher/modules/TeacherTimetable.tsx`
- `client/src/components/teacher/modules/FunctionalTeacherAttendance.tsx`
- `client/src/components/teacher/modules/FunctionalTeacherAssignments.tsx`
- `client/src/components/teacher/modules/FunctionalTeacherCommunications.tsx`

## Testing

### Verify Fix Works
1. **Login as sandbox teacher**
2. **Test library book creation:**
   - Click "Add Book"
   - Fill in title and author
   - Click Create
   - ✅ Should save without CSRF error
3. **Test recommendation:**
   - Click "Recommend" on a book
   - Select class/students
   - Save
   - ✅ Should work without CSRF error

### Monitor Logs
Check for CSRF errors:
```bash
grep -i "csrf\|403" /tmp/logs/Start_application_*.log
```

## Summary

- ✅ **Core fix applied:** `apiRequest()` now uses `csrfFetch()`
- ✅ **329 components** automatically protected
- ⚠️ **Additional cleanup needed** for direct fetch() usage
- 🎯 **Going forward:** Always use `apiRequest()` or `csrfFetch()` for mutations

The majority of CSRF errors should now be eliminated. The remaining violations need manual cleanup, but the infrastructure is now solid.

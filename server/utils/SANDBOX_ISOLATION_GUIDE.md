# SANDBOX ISOLATION IMPLEMENTATION GUIDE

## Critical Problem Solved

**Before:** Sandbox test data was leaking into production user accounts because queries only filtered by `schoolId`, not by sandbox status.

**After:** Complete database-level isolation using the `is_sandbox` column on the `schools` table.

---

## Database Schema

The `schools` table now has:
```typescript
isSandbox: boolean("is_sandbox").default(false).notNull()
```

- **TRUE** = Sandbox/demo school (IDs: 1-6, 15)
- **FALSE** = Real production school
- All existing sandbox schools have been marked with `is_sandbox = true`

---

## Using Sandbox Utilities

Import from `server/utils/sandboxUtils.ts`:

```typescript
import { 
  isSandboxSchool,           // Check if a school is sandbox
  isSandboxUserByEmail,      // Check if user email is sandbox pattern
  canUserAccessSchool,       // Verify user can access specific school
  getSandboxFilterCondition  // Get SQL filter condition
} from '../utils/sandboxUtils';
```

---

## Query Pattern: How to Fix Queries

### ❌ WRONG - Old Pattern (Causes Data Leakage)

```typescript
// BAD: Only filters by schoolId - sandbox and production data mix!
const students = await db
  .select()
  .from(studentsTable)
  .where(eq(studentsTable.schoolId, user.schoolId));
```

### ✅ CORRECT - New Pattern (Complete Isolation)

```typescript
import { isSandboxUserByEmail } from '../utils/sandboxUtils';
import { and, eq } from 'drizzle-orm';

// GOOD: Filter by BOTH schoolId AND sandbox status
const userIsSandbox = isSandboxUserByEmail(user.email);

const students = await db
  .select()
  .from(studentsTable)
  .where(
    and(
      eq(studentsTable.schoolId, user.schoolId),
      eq(schools.isSandbox, userIsSandbox)
    )
  );
```

### ✅ BEST - Using Join for Related Tables

```typescript
import { isSandboxUserByEmail } from '../utils/sandboxUtils';
import { and, eq } from 'drizzle-orm';

const userIsSandbox = isSandboxUserByEmail(user.email);

const students = await db
  .select({
    id: studentsTable.id,
    firstName: studentsTable.firstName,
    lastName: studentsTable.lastName,
    schoolName: schools.name
  })
  .from(studentsTable)
  .leftJoin(schools, eq(studentsTable.schoolId, schools.id))
  .where(
    and(
      eq(studentsTable.schoolId, user.schoolId),
      eq(schools.isSandbox, userIsSandbox) // CRITICAL: Filter by sandbox status
    )
  );
```

---

## Common Query Scenarios

### 1. Students Query
```typescript
const userIsSandbox = isSandboxUserByEmail(user.email);

const students = await db
  .select()
  .from(studentsTable)
  .leftJoin(schools, eq(studentsTable.schoolId, schools.id))
  .where(
    and(
      eq(studentsTable.schoolId, user.schoolId),
      eq(schools.isSandbox, userIsSandbox)
    )
  );
```

### 2. Classes Query
```typescript
const userIsSandbox = isSandboxUserByEmail(user.email);

const classes = await db
  .select()
  .from(classesTable)
  .leftJoin(schools, eq(classesTable.schoolId, schools.id))
  .where(
    and(
      eq(classesTable.schoolId, user.schoolId),
      eq(schools.isSandbox, userIsSandbox)
    )
  );
```

### 3. Teachers Query
```typescript
const userIsSandbox = isSandboxUserByEmail(user.email);

const teachers = await db
  .select()
  .from(users)
  .leftJoin(schools, eq(users.schoolId, schools.id))
  .where(
    and(
      eq(users.role, 'Teacher'),
      eq(users.schoolId, user.schoolId),
      eq(schools.isSandbox, userIsSandbox)
    )
  );
```

### 4. Bulletins/Grades Query
```typescript
const userIsSandbox = isSandboxUserByEmail(user.email);

const bulletins = await db
  .select()
  .from(bulletinComprehensive)
  .leftJoin(schools, eq(bulletinComprehensive.schoolId, schools.id))
  .where(
    and(
      eq(bulletinComprehensive.schoolId, user.schoolId),
      eq(bulletinComprehensive.term, currentTerm),
      eq(schools.isSandbox, userIsSandbox)
    )
  );
```

---

## Pre-Request Access Check

For sensitive operations, verify access before querying:

```typescript
import { canUserAccessSchool } from '../utils/sandboxUtils';

// Verify user can access this school
const hasAccess = await canUserAccessSchool(user.schoolId, user.email);
if (!hasAccess) {
  return res.status(403).json({ 
    error: 'Access denied - sandbox/production mismatch' 
  });
}

// Proceed with query...
```

---

## Testing Isolation

### Test 1: Sandbox User Cannot See Production Data
```typescript
// Login as sandbox user (sandbox@educafric.demo)
// Query for students - should ONLY see sandbox students
// Verify NO production students appear
```

### Test 2: Production User Cannot See Sandbox Data
```typescript
// Login as production user (user@realschool.com)
// Query for students - should ONLY see production students
// Verify NO sandbox students appear
```

### Test 3: School ID Verification
```typescript
// Verify sandbox schools (1-6, 15) have is_sandbox = true
// Verify all other schools have is_sandbox = false
```

---

## Files That Need Updates

All endpoints in these files that query by `schoolId` need the sandbox filter:

1. **server/routes.ts** - Main routes (HIGH PRIORITY)
   - Student endpoints
   - Teacher endpoints
   - Class endpoints
   - Grade/bulletin endpoints
   - Homework endpoints

2. **server/storage/*.ts** - Storage modules
   - studentStorage.ts
   - classStorage.ts
   - timetableStorage.ts
   - bulletinStorage.ts

3. **server/routes/api/*.ts** - API routes
   - parent.ts
   - transcripts.ts
   - master-sheets.ts

4. **server/services/*.ts** - Services that query schools
   - subscriptionService.ts
   - excelImportService.ts

---

## Migration Checklist

For each endpoint that queries school-related data:

- [ ] Import `isSandboxUserByEmail` from sandboxUtils
- [ ] Calculate `userIsSandbox` at start of endpoint
- [ ] Add `leftJoin` to schools table (if not already present)
- [ ] Add `eq(schools.isSandbox, userIsSandbox)` to WHERE clause
- [ ] Test with both sandbox and production users
- [ ] Verify data isolation is maintained

---

## Quick Reference

```typescript
// 1. Import utility
import { isSandboxUserByEmail } from '../utils/sandboxUtils';
import { and, eq } from 'drizzle-orm';

// 2. Check user status
const userIsSandbox = isSandboxUserByEmail(user.email);

// 3. Add to query
.leftJoin(schools, eq(table.schoolId, schools.id))
.where(
  and(
    eq(table.schoolId, user.schoolId),
    eq(schools.isSandbox, userIsSandbox) // <-- ADD THIS LINE
  )
)
```

---

## Support

For questions or issues with sandbox isolation, check:
- `server/utils/sandboxUtils.ts` - Utility functions
- `shared/schemas/schoolSchema.ts` - Schools table schema
- This guide - Implementation patterns

**Remember:** EVERY query that touches school-related data MUST filter by `is_sandbox` to maintain isolation.

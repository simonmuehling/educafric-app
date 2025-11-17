/**
 * SANDBOX ISOLATION UTILITIES
 * 
 * Critical utilities for maintaining complete database-level isolation
 * between sandbox (demo/test) schools and production schools.
 * 
 * NEVER mix sandbox and production data - this prevents data leakage.
 */

import { db } from "../db";
import { schools } from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * Check if a school is a sandbox school based on database flag
 * @param schoolId - School ID to check
 * @returns true if sandbox school, false if production school
 */
export async function isSandboxSchool(schoolId: number | null | undefined): Promise<boolean> {
  if (!schoolId) return false;
  
  try {
    const result = await db
      .select({ isSandbox: schools.isSandbox })
      .from(schools)
      .where(eq(schools.id, schoolId))
      .limit(1);
    
    return result[0]?.isSandbox ?? false;
  } catch (error) {
    console.error('[SANDBOX_CHECK] Error checking sandbox status:', error);
    return false;
  }
}

/**
 * Check if a user is a sandbox user based on email pattern
 * (Backward compatibility - prefer database flag when possible)
 * @param email - User email to check
 * @returns true if sandbox user email pattern
 */
export function isSandboxUserByEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  
  const sandboxPatterns = [
    '@test.educafric.com',
    '@educafric.demo',
    '@educafric.test',
    'sandbox@',
    'demo@',
    '.sandbox@',
    '.demo@',
    '.test@'
  ];
  
  return sandboxPatterns.some(pattern => email.includes(pattern));
}

/**
 * Get sandbox filter condition for queries
 * Real users should ONLY see production schools (isSandbox = false)
 * Sandbox users should ONLY see sandbox schools (isSandbox = true)
 * 
 * @param userIsSandbox - Whether the current user is a sandbox user
 * @returns SQL condition for filtering schools
 */
export function getSandboxFilterCondition(userIsSandbox: boolean) {
  return eq(schools.isSandbox, userIsSandbox);
}

/**
 * Verify user can access a specific school
 * Prevents sandbox users from accessing production schools and vice versa
 * 
 * @param schoolId - School to check
 * @param userEmail - User's email for sandbox detection
 * @returns true if access allowed, false if blocked
 */
export async function canUserAccessSchool(
  schoolId: number | null | undefined,
  userEmail: string | null | undefined
): Promise<boolean> {
  if (!schoolId || !userEmail) return false;
  
  const schoolIsSandbox = await isSandboxSchool(schoolId);
  const userIsSandbox = isSandboxUserByEmail(userEmail);
  
  // User and school must match in sandbox status
  const canAccess = schoolIsSandbox === userIsSandbox;
  
  if (!canAccess) {
    console.warn(
      `[SANDBOX_ISOLATION] Access blocked: User ${userEmail} (sandbox=${userIsSandbox}) ` +
      `attempted to access school ${schoolId} (sandbox=${schoolIsSandbox})`
    );
  }
  
  return canAccess;
}

/**
 * Known sandbox school IDs (for reference and seeding)
 */
export const SANDBOX_SCHOOL_IDS = [1, 2, 3, 4, 5, 6, 15] as const;

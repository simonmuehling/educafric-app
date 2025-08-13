/**
 * Phone Number Uniqueness Validation with Owner Exception System
 * Ensures unique phone numbers while allowing specific owner numbers to be exempt
 */

import { db } from "../db";
import { users } from "@shared/schema";
import { eq, and, ne, or } from "drizzle-orm";

// Owner/Platform Admin exception numbers - these can be used by multiple accounts
const OWNER_EXCEPTION_NUMBERS = [
  "+237600000000", // Primary owner number
  "+237600000001", // Commercial owner number  
  "237600000000",  // Without + prefix
  "237600000001"   // Without + prefix
];

/**
 * Normalize phone number for comparison
 */
function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  // Remove spaces, dashes, parentheses
  let normalized = phone.replace(/[\s\-\(\)]/g, '');
  // Add + if missing and starts with 237
  if (normalized.startsWith('237') && !normalized.startsWith('+')) {
    normalized = '+' + normalized;
  }
  return normalized;
}

/**
 * Check if a phone number is an owner exception
 */
function isOwnerExceptionNumber(phone: string): boolean {
  const normalized = normalizePhoneNumber(phone);
  return OWNER_EXCEPTION_NUMBERS.includes(normalized) || 
         OWNER_EXCEPTION_NUMBERS.includes(normalized.replace('+', ''));
}

/**
 * Check if phone number already exists for another user
 */
export async function checkPhoneUniqueness(
  phone: string, 
  excludeUserId?: number
): Promise<{ isUnique: boolean; conflictUserId?: number; message?: string }> {
  try {
    if (!phone || phone.trim() === '') {
      return { isUnique: true };
    }

    const normalizedPhone = normalizePhoneNumber(phone);
    
    // Owner exception numbers are always allowed
    if (isOwnerExceptionNumber(normalizedPhone)) {
      return { 
        isUnique: true, 
        message: 'Owner exception number - multiple uses allowed' 
      };
    }

    // Build query conditions
    let conditions: any[] = [
      or(
        eq(users.phone, normalizedPhone),
        eq(users.phone, normalizedPhone.replace('+', '')),
        eq(users.whatsappNumber, normalizedPhone),
        eq(users.whatsappNumber, normalizedPhone.replace('+', ''))
      )
    ];

    // Exclude current user if updating
    if (excludeUserId) {
      conditions.push(ne(users.id, excludeUserId));
    }

    const existingUser = await db
      .select({ id: users.id, email: users.email, phone: users.phone })
      .from(users)
      .where(and(...conditions))
      .limit(1);

    if (existingUser.length > 0) {
      return {
        isUnique: false,
        conflictUserId: existingUser[0].id,
        message: `Phone number already in use by user ${existingUser[0].email}`
      };
    }

    return { isUnique: true };
  } catch (error) {
    console.error('[PHONE_VALIDATION] Error checking phone uniqueness:', error);
    return {
      isUnique: false,
      message: 'Error validating phone number uniqueness'
    };
  }
}

/**
 * Validate phone number format (Cameroon format)
 */
export function validatePhoneFormat(phone: string): { isValid: boolean; message?: string } {
  if (!phone || phone.trim() === '') {
    return { isValid: true }; // Optional field
  }

  const normalized = normalizePhoneNumber(phone);
  
  // Cameroon phone number format: +237XXXXXXXXX (9 digits after country code)
  const cameroonPhoneRegex = /^\+237[6-9]\d{8}$/;
  
  if (!cameroonPhoneRegex.test(normalized)) {
    return {
      isValid: false,
      message: 'Invalid Cameroon phone number format. Should be +237XXXXXXXXX'
    };
  }

  return { isValid: true };
}

/**
 * Complete phone number validation (format + uniqueness)
 */
export async function validatePhoneNumber(
  phone: string, 
  excludeUserId?: number
): Promise<{ isValid: boolean; message?: string; conflictUserId?: number }> {
  
  // Check format first
  const formatCheck = validatePhoneFormat(phone);
  if (!formatCheck.isValid) {
    return formatCheck;
  }

  // Check uniqueness
  const uniquenessCheck = await checkPhoneUniqueness(phone, excludeUserId);
  if (!uniquenessCheck.isUnique) {
    return {
      isValid: false,
      message: uniquenessCheck.message,
      conflictUserId: uniquenessCheck.conflictUserId
    };
  }

  return { isValid: true };
}

/**
 * Get owner exception numbers for reference
 */
export function getOwnerExceptionNumbers(): string[] {
  return [...OWNER_EXCEPTION_NUMBERS];
}
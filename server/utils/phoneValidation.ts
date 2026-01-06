/**
 * Phone Number Uniqueness Validation with Owner Exception System
 * Ensures unique phone numbers while allowing specific owner numbers to be exempt
 */

import { db } from "../db";
import { users } from "@shared/schema";
import { eq, and, ne, or } from "drizzle-orm";

// Owner/Platform Admin exception numbers - these can be used by multiple accounts
const OWNER_EXCEPTION_NUMBERS = [
  "+41768017000",   // Primary owner number (Switzerland)
  "+237657004011",  // Commercial owner number (Cameroon)
  "41768017000",    // Without + prefix
  "237657004011"    // Without + prefix
];

/**
 * Normalize phone number for comparison
 * Only allows digits and optional + prefix
 */
function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  // Remove ALL non-digit characters except + at the start
  let normalized = phone.replace(/[^\d+]/g, '');
  // Ensure + only appears at the start
  if (normalized.includes('+')) {
    const plusIndex = normalized.indexOf('+');
    if (plusIndex > 0) {
      // Remove + if not at start
      normalized = normalized.replace(/\+/g, '');
    }
  }
  
  // Add + if missing for common international formats
  // Support common country codes: 237 (Cameroon), 41 (Switzerland), 33 (France), 
  // 1 (US/Canada), 44 (UK), 49 (Germany), 39 (Italy), 34 (Spain), etc.
  const commonCountryCodes = [
    '237', '41', '33', '1', '44', '49', '39', '34', '32', '31', '46', '47', '45', 
    '358', '354', '353', '43', '420', '421', '48', '36', '40', '381', '385', '386',
    '385', '359', '30', '351', '90', '7', '86', '81', '82', '91', '62', '60', '65',
    '66', '84', '856', '855', '95', '977', '880', '94', '92', '98', '964', '966',
    '971', '968', '965', '973', '974', '961', '963', '962', '970', '972', '218'
  ];
  
  for (const code of commonCountryCodes) {
    if (normalized.startsWith(code) && !normalized.startsWith('+')) {
      normalized = '+' + normalized;
      break;
    }
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
 * Validate international phone number format (supports all countries)
 * Accepts formats with or without + prefix (e.g., 237697445870 or +237697445870)
 */
export function validatePhoneFormat(phone: string): { isValid: boolean; message?: string; normalizedPhone?: string } {
  if (!phone || phone.trim() === '') {
    return { isValid: true }; // Optional field
  }

  const normalized = normalizePhoneNumber(phone);
  
  // Universal international phone number format: +[1-3 digit country code][4-15 digits]
  // This supports all international formats including:
  // +237XXXXXXXXX (Cameroon), +33XXXXXXXXX (France), +1XXXXXXXXXX (US/Canada), 
  // +44XXXXXXXXXX (UK), +41XXXXXXXXX (Switzerland), +49XXXXXXXXXX (Germany), etc.
  const internationalPhoneRegex = /^\+[1-9]\d{1,3}\d{4,15}$/;
  
  // Also accept format without + prefix for convenience (e.g., 237697445870)
  const withoutPlusRegex = /^[1-9]\d{1,3}\d{4,15}$/;
  
  if (!internationalPhoneRegex.test(normalized)) {
    // Try without + prefix
    const digitsOnly = normalized.replace(/\D/g, '');
    if (!withoutPlusRegex.test(digitsOnly)) {
      return {
        isValid: false,
        message: 'Format de numéro invalide. Utilisez le format: +237697445870 ou 237697445870'
      };
    }
    // Valid format without +, return the normalized version with +
    return { 
      isValid: true, 
      normalizedPhone: '+' + digitsOnly 
    };
  }

  // Ensure reasonable length (6-19 digits total including country code)
  const digitsOnly = normalized.replace(/\D/g, '');
  if (digitsOnly.length < 6 || digitsOnly.length > 19) {
    return {
      isValid: false,
      message: 'Le numéro de téléphone doit contenir entre 6 et 19 chiffres'
    };
  }

  return { isValid: true, normalizedPhone: normalized };
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

/**
 * Sanitize and normalize phone number for storage
 * Removes all non-digit characters except leading +
 * Returns null if phone is invalid
 */
export function sanitizePhoneForStorage(phone: string): string | null {
  if (!phone || phone.trim() === '') return null;
  
  // Remove ALL non-digit characters except +
  let sanitized = phone.replace(/[^\d+]/g, '');
  
  // Ensure + only appears at the start
  if (sanitized.includes('+')) {
    const firstPlus = sanitized.indexOf('+');
    if (firstPlus > 0) {
      sanitized = sanitized.replace(/\+/g, '');
    } else {
      // Remove any additional + signs after the first
      sanitized = '+' + sanitized.substring(1).replace(/\+/g, '');
    }
  }
  
  // Get digits only for length check
  const digitsOnly = sanitized.replace(/\+/g, '');
  
  // Must have at least 6 digits
  if (digitsOnly.length < 6) return null;
  
  // Add + prefix if starts with common country code
  if (!sanitized.startsWith('+') && digitsOnly.length >= 9) {
    sanitized = '+' + digitsOnly;
  }
  
  return sanitized;
}
// Shared configuration constants for both frontend and backend
// This ensures consistency across the entire application

/**
 * Feature flags for enabling/disabling premium features
 */
export const FEATURE_FLAGS = {
  // Temporarily disable premium subscription enforcement
  // Set to true when premium features are ready to be enforced
  PREMIUM_ENFORCEMENT_ENABLED: false,
  
  // Enable/disable specific feature gates
  ADVANCED_CLASS_MANAGEMENT: true, // Always available for now
  GEOLOCATION_TRACKING: true, // Always available for now
  ADVANCED_COMMUNICATIONS: true, // Always available for now
  ONLINE_CLASSES: true, // Always available for now
  ADVANCED_GRADE_MANAGEMENT: true, // Always available for now
} as const;

/**
 * Check if premium enforcement is currently active
 */
export function isPremiumEnforcementEnabled(): boolean {
  return FEATURE_FLAGS.PREMIUM_ENFORCEMENT_ENABLED;
}

/**
 * Check if a specific feature should be gated by premium subscription
 */
export function isFeatureGated(feature: keyof typeof FEATURE_FLAGS): boolean {
  if (!FEATURE_FLAGS.PREMIUM_ENFORCEMENT_ENABLED) {
    return false; // All features available when enforcement is disabled
  }
  return !FEATURE_FLAGS[feature];
}

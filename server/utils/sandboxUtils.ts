// Sandbox school detection utility
// Sandbox schools: IDs 1-6 and 15

/**
 * Checks if a school ID belongs to a sandbox/demo school
 * Sandbox schools get demo data, production schools get real database data
 */
export function isSandboxSchool(schoolId: number | null | undefined): boolean {
  if (!schoolId) return false;
  
  const sandboxSchoolIds = [1, 2, 3, 4, 5, 6, 15];
  return sandboxSchoolIds.includes(schoolId);
}

/**
 * Checks if a school ID belongs to a production school
 * Production schools should NEVER receive mock/demo data
 */
export function isProductionSchool(schoolId: number | null | undefined): boolean {
  if (!schoolId) return false;
  
  // Production schools are typically ID 10+
  return schoolId >= 10;
}

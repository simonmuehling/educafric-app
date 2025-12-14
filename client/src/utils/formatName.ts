/**
 * Format a name based on language conventions
 * - English: firstName lastName (John Smith)
 * - French: NOM Prénom (SMITH John) - formal convention
 * 
 * @param firstName - The first name
 * @param lastName - The last name
 * @param lang - The language ('fr' | 'en')
 * @param options - Additional formatting options
 * @returns Formatted name string
 */
export function formatName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  lang: 'fr' | 'en' = 'fr',
  options: {
    uppercaseLastName?: boolean;
    separator?: string;
  } = {}
): string {
  const first = (firstName || '').trim();
  const last = (lastName || '').trim();
  
  if (!first && !last) return '';
  if (!first) return last;
  if (!last) return first;
  
  const { uppercaseLastName = true, separator = ' ' } = options;
  
  if (lang === 'en') {
    return `${first}${separator}${last}`;
  }
  
  const formattedLast = uppercaseLastName ? last.toUpperCase() : last;
  return `${formattedLast}${separator}${first}`;
}

/**
 * Format a full name string (splits and reformats)
 * Assumes "FirstName LastName" input format
 * 
 * @param fullName - Full name as a single string
 * @param lang - The language ('fr' | 'en')
 * @returns Formatted name string
 */
export function formatFullName(
  fullName: string | null | undefined,
  lang: 'fr' | 'en' = 'fr'
): string {
  if (!fullName) return '';
  
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  
  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ');
  
  return formatName(firstName, lastName, lang);
}

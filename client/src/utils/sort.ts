/**
 * Centralized sorting utilities for consistent ordering across the application
 * - Text: Alphabetical (locale-aware, accent-insensitive)
 * - Numbers: Ascending
 * - Dates: Chronological (oldest first)
 * - Nulls/undefined: Always last
 */

const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
  ignorePunctuation: true
});

export function cmpTextAsc(a: string | null | undefined, b: string | null | undefined): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return collator.compare(a, b);
}

export function cmpTextDesc(a: string | null | undefined, b: string | null | undefined): number {
  return -cmpTextAsc(a, b);
}

export function cmpNumberAsc(a: number | null | undefined, b: number | null | undefined): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return a - b;
}

export function cmpNumberDesc(a: number | null | undefined, b: number | null | undefined): number {
  return -cmpNumberAsc(a, b);
}

export function cmpDateAsc(a: Date | string | null | undefined, b: Date | string | null | undefined): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  const dateA = a instanceof Date ? a.getTime() : new Date(a).getTime();
  const dateB = b instanceof Date ? b.getTime() : new Date(b).getTime();
  if (isNaN(dateA) && isNaN(dateB)) return 0;
  if (isNaN(dateA)) return 1;
  if (isNaN(dateB)) return -1;
  return dateA - dateB;
}

export function cmpDateDesc(a: Date | string | null | undefined, b: Date | string | null | undefined): number {
  return -cmpDateAsc(a, b);
}

export type SortType = 'text' | 'number' | 'date';

export function sortBy<T>(
  arr: T[],
  selector: (item: T) => string | number | Date | null | undefined,
  type: SortType = 'text',
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  const sorted = [...arr];
  
  sorted.sort((a, b) => {
    const valA = selector(a);
    const valB = selector(b);
    
    let result: number;
    switch (type) {
      case 'number':
        result = cmpNumberAsc(valA as number, valB as number);
        break;
      case 'date':
        result = cmpDateAsc(valA as Date | string, valB as Date | string);
        break;
      case 'text':
      default:
        result = cmpTextAsc(String(valA ?? ''), String(valB ?? ''));
    }
    
    return direction === 'desc' ? -result : result;
  });
  
  return sorted;
}

export function sortByMultiple<T>(
  arr: T[],
  selectors: Array<{
    selector: (item: T) => string | number | Date | null | undefined;
    type?: SortType;
    direction?: 'asc' | 'desc';
  }>
): T[] {
  const sorted = [...arr];
  
  sorted.sort((a, b) => {
    for (const { selector, type = 'text', direction = 'asc' } of selectors) {
      const valA = selector(a);
      const valB = selector(b);
      
      let result: number;
      switch (type) {
        case 'number':
          result = cmpNumberAsc(valA as number, valB as number);
          break;
        case 'date':
          result = cmpDateAsc(valA as Date | string, valB as Date | string);
          break;
        case 'text':
        default:
          result = cmpTextAsc(String(valA ?? ''), String(valB ?? ''));
      }
      
      if (direction === 'desc') result = -result;
      if (result !== 0) return result;
    }
    return 0;
  });
  
  return sorted;
}

export function sortOptions<T extends { label?: string; name?: string; value?: string }>(
  options: T[],
  labelKey: keyof T = 'label' as keyof T
): T[] {
  return sortBy(options, (item) => String(item[labelKey] ?? ''), 'text', 'asc');
}

export function sortStrings(arr: string[], direction: 'asc' | 'desc' = 'asc'): string[] {
  const sorted = [...arr];
  sorted.sort((a, b) => direction === 'asc' ? cmpTextAsc(a, b) : cmpTextDesc(a, b));
  return sorted;
}

export function sortNumbers(arr: number[], direction: 'asc' | 'desc' = 'asc'): number[] {
  const sorted = [...arr];
  sorted.sort((a, b) => direction === 'asc' ? a - b : b - a);
  return sorted;
}

export function detectType(value: unknown): SortType {
  if (value == null) return 'text';
  if (typeof value === 'number') return 'number';
  if (value instanceof Date) return 'date';
  if (typeof value === 'string') {
    if (!isNaN(Date.parse(value)) && /^\d{4}-\d{2}-\d{2}/.test(value)) return 'date';
    if (!isNaN(Number(value)) && value.trim() !== '') return 'number';
  }
  return 'text';
}

export function createComparator<T>(
  selector: (item: T) => string | number | Date | null | undefined,
  type: SortType = 'text',
  direction: 'asc' | 'desc' = 'asc'
): (a: T, b: T) => number {
  return (a: T, b: T) => {
    const valA = selector(a);
    const valB = selector(b);
    
    let result: number;
    switch (type) {
      case 'number':
        result = cmpNumberAsc(valA as number, valB as number);
        break;
      case 'date':
        result = cmpDateAsc(valA as Date | string, valB as Date | string);
        break;
      case 'text':
      default:
        result = cmpTextAsc(String(valA ?? ''), String(valB ?? ''));
    }
    
    return direction === 'desc' ? -result : result;
  };
}

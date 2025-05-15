/**
 * Format a number as currency (USD)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Date format types for consistent display throughout the application
 */
export type DateFormatType = 
  | 'date'           // March 1, 2023
  | 'dateShort'      // Mar 1, 2023
  | 'dateTime'       // March 1, 2023, 2:30 PM
  | 'dateTimeShort'  // Mar 1, 2023, 2:30 PM
  | 'dayDate'        // Monday, March 1, 2023
  | 'time'           // 2:30 PM
  | 'iso';           // 2023-03-01

/**
 * Options for date formatting
 */
export interface DateFormatOptions {
  type?: DateFormatType;
  fallback?: string;
  throwError?: boolean;
}

/**
 * Convert any date-like value to a Date object
 * Handles Firestore Timestamps, Date objects, ISO strings, and numbers
 */
export const parseDate = (value: any): Date | null => {
  if (!value) return null;
  
  try {
    // Case 1: Firestore Timestamp with toDate method
    if (value && typeof value.toDate === 'function') {
      return value.toDate();
    }
    
    // Case 2: Already a Date object
    if (value instanceof Date) {
      return value;
    }
    
    // Case 3: String date (like "2023-03-01" or ISO string)
    if (typeof value === 'string') {
      // If it's just a date without time (YYYY-MM-DD), append T00:00:00 to ensure consistent parsing
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        value = `${value}T00:00:00`;
      }
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }
    
    // Case 4: Timestamp number (milliseconds since epoch)
    if (typeof value === 'number') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }
    
    // Case 5: Object with seconds property (Firestore server timestamp format)
    if (value && typeof value === 'object' && 'seconds' in value) {
      // Convert seconds to milliseconds
      const milliseconds = value.seconds * 1000;
      // Add nanoseconds if available
      const date = new Date(milliseconds + (value.nanoseconds ? value.nanoseconds / 1000000 : 0));
      return isNaN(date.getTime()) ? null : date;
    }
    
    // Case 6: Handle potential serialized Firestore timestamps or other timestamp objects
    if (value && typeof value === 'object') {
      // Try to convert from various serialized formats
      if ('_seconds' in value && '_nanoseconds' in value) {
        const milliseconds = value._seconds * 1000;
        const date = new Date(milliseconds + (value._nanoseconds / 1000000));
        return isNaN(date.getTime()) ? null : date;
      }
      
      // If it has a timestamp property, try to use that
      if ('timestamp' in value) {
        return parseDate(value.timestamp);
      }
    }
  } catch (error) {
    console.error('Error parsing date:', error, value);
  }
  
  return null;
};

/**
 * Get format options based on format type
 */
const getFormatOptions = (type: DateFormatType): Intl.DateTimeFormatOptions => {
  switch (type) {
    case 'date':
      return {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
    case 'dateShort':
      return {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      };
    case 'dateTime':
      return {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      };
    case 'dateTimeShort':
      return {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      };
    case 'dayDate':
      return {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
    case 'time':
      return {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      };
    case 'iso':
      return {}; // Special case handled separately
    default:
      return {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
  }
};

/**
 * Format any date-like value to a consistently formatted string
 * @param value - Any date-like value (Date, Timestamp, string, number)
 * @param options - Formatting options
 * @returns Formatted date string or fallback value if date is invalid
 */
export const formatDate = (
  value: any, 
  options: DateFormatOptions = {}
): string => {
  const { type = 'date', fallback = 'N/A', throwError = false } = options;
  
  try {
    const dateObject = parseDate(value);
    
    if (!dateObject || isNaN(dateObject.getTime())) {
      console.warn(`Invalid date value or failed to parse: ${JSON.stringify(value)}`);
      if (throwError) {
        throw new RangeError('Invalid time value');
      }
      return fallback;
    }
    
    // Special case for ISO format
    if (type === 'iso') {
      return dateObject.toISOString().split('T')[0];
    }
    
    const formatOptions = getFormatOptions(type);
    return new Intl.DateTimeFormat('en-US', formatOptions).format(dateObject);
  } catch (error) {
    console.error('Error formatting date:', error, value);
    if (throwError) {
      throw error;
    }
    return fallback;
  }
};

/**
 * Format a time (hours and minutes)
 * @deprecated Use formatDate with type='time' instead
 */
export const formatTime = (time: Date): string => {
  return formatDate(time, { type: 'time' });
};

/**
 * Validate if a date string is valid
 * @param dateString - Date string to validate (YYYY-MM-DD format)
 * @returns Boolean indicating if the date is valid
 */
export const isValidDate = (dateString: string): boolean => {
  if (!dateString) return false;
  
  // For HTML date inputs (YYYY-MM-DD format)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const date = new Date(`${dateString}T00:00:00`);
    return !isNaN(date.getTime());
  }
  
  // For other date formats
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Calculate minimum allowed date based on order details
 * @param cakeCategories - Categories of cakes in the order
 * @param isCustomOrder - Whether this is a custom order
 * @returns Date object representing the minimum allowed date
 */
export const calculateMinDate = (
  cakeCategories: string[] = [], 
  isCustomOrder: boolean = false
): Date => {
  const today = new Date();

  // Default minimum lead time (48 hours for standard orders)
  let daysToAdd = 2;

  // Custom orders always require at least 7 days (1 week) lead time
  if (isCustomOrder) {
    daysToAdd = 7;
  } 
  // Wedding cakes require 21 days (3 weeks) minimum
  else if (cakeCategories.includes('wedding')) {
    daysToAdd = 21;
  } 
  // Check for celebration cakes (require 7 days)
  else if (cakeCategories.includes('celebration')) {
    daysToAdd = Math.max(daysToAdd, 7);
  }

  // Add the required days
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + daysToAdd);

  // If the date falls on a Sunday, move to Monday
  if (minDate.getDay() === 0) { // Sunday
    minDate.setDate(minDate.getDate() + 1);
  }

  return minDate;
};

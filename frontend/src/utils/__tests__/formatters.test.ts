import {
  formatCurrency,
  formatDate,
  parseDate,
  isValidDate,
  calculateMinDate,
  // DateFormatType is used as a type in the code, not needed to be imported explicitly
} from '../formatters';
import { describe, it, expect } from '@jest/globals';

describe('formatCurrency', () => {
  it('formats currency correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
    expect(formatCurrency(0)).toBe('$0.00');
    expect(formatCurrency(1000)).toBe('$1,000.00');
  });
});

describe('parseDate', () => {
  it('parses Date objects', () => {
    const date = new Date('2023-05-15T12:30:00');
    const parsed = parseDate(date);
    expect(parsed instanceof Date).toBe(true);
    expect(parsed?.getTime()).toBe(date.getTime());
  });

  it('parses ISO date strings', () => {
    const parsed = parseDate('2023-05-15T12:30:00');
    expect(parsed instanceof Date).toBe(true);
    expect(parsed?.toISOString()).toContain('2023-05-15');
  });

  it('parses YYYY-MM-DD date strings', () => {
    const parsed = parseDate('2023-05-15');
    expect(parsed instanceof Date).toBe(true);
    expect(parsed?.toISOString()).toContain('2023-05-15');
  });

  it('handles null/undefined gracefully', () => {
    expect(parseDate(null)).toBe(null);
    expect(parseDate(undefined)).toBe(null);
  });

  it('handles invalid dates', () => {
    expect(parseDate('not-a-date')).toBe(null);
  });
});

describe('formatDate', () => {
  const testDate = new Date('2023-05-15T12:30:00');
  
  it('formats with default settings', () => {
    const formatted = formatDate(testDate);
    expect(formatted).toContain('May 15, 2023');
  });

  it('formats as short date', () => {
    const formatted = formatDate(testDate, { type: 'dateShort' });
    expect(formatted).toContain('May 15, 2023');
  });

  it('formats with time', () => {
    const formatted = formatDate(testDate, { type: 'dateTime' });
    expect(formatted).toContain('May 15, 2023');
    // Note: Time portion check is omitted due to timezone concerns in tests
  });

  it('formats with weekday', () => {
    const formatted = formatDate(testDate, { type: 'dayDate' });
    expect(formatted).toContain('Monday, May 15, 2023');
  });

  it('uses fallback for invalid dates', () => {
    const formatted = formatDate('invalid-date', { fallback: 'Not available' });
    expect(formatted).toBe('Not available');
  });

  it('formats as ISO', () => {
    const formatted = formatDate(testDate, { type: 'iso' });
    expect(formatted).toBe('2023-05-15');
  });
});

describe('isValidDate', () => {
  it('validates correct date strings', () => {
    expect(isValidDate('2023-05-15')).toBe(true);
  });

  it('rejects invalid date strings', () => {
    expect(isValidDate('2023-13-45')).toBe(false);
    expect(isValidDate('')).toBe(false);
    expect(isValidDate('not-a-date')).toBe(false);
  });
});

describe('calculateMinDate', () => {
  it('calculates default lead time (2 days)', () => {
    const result = calculateMinDate();
    const today = new Date();
    const expected = new Date(today);
    expected.setDate(today.getDate() + 2);
    
    // If the expected date is a Sunday, it should move to Monday
    if (expected.getDay() === 0) {
      expected.setDate(expected.getDate() + 1);
    }
    
    // Compare dates (ignoring time)
    const resultDateStr = result.toISOString().split('T')[0];
    const expectedDateStr = expected.toISOString().split('T')[0];
    expect(resultDateStr).toBe(expectedDateStr);
  });

  it('calculates custom order lead time (7 days)', () => {
    const result = calculateMinDate([], true);
    const today = new Date();
    const expected = new Date(today);
    expected.setDate(today.getDate() + 7);
    
    // If the expected date is a Sunday, it should move to Monday
    if (expected.getDay() === 0) {
      expected.setDate(expected.getDate() + 1);
    }
    
    // Compare dates (ignoring time)
    const resultDateStr = result.toISOString().split('T')[0];
    const expectedDateStr = expected.toISOString().split('T')[0];
    expect(resultDateStr).toBe(expectedDateStr);
  });

  it('calculates wedding cake lead time (21 days)', () => {
    const result = calculateMinDate(['wedding']);
    const today = new Date();
    const expected = new Date(today);
    expected.setDate(today.getDate() + 21);
    
    // If the expected date is a Sunday, it should move to Monday
    if (expected.getDay() === 0) {
      expected.setDate(expected.getDate() + 1);
    }
    
    // Compare dates (ignoring time)
    const resultDateStr = result.toISOString().split('T')[0];
    const expectedDateStr = expected.toISOString().split('T')[0];
    expect(resultDateStr).toBe(expectedDateStr);
  });
});

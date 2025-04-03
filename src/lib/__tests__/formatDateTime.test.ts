import { describe, it, expect } from 'vitest';
import { formatDateTime, formatDisplayDate, formatDisplayTime } from '../formatDateTime';

describe('date formatting', () => {
  it('should format date-time string correctly', () => {
    const input = '05-02-2025 09:00';
    const result = formatDateTime(input);
    expect(result).toBe('2025-02-05 09:00:00');
  });

  it('should format display date correctly', () => {
    const input = '2025-02-05 09:00:00';
    const result = formatDisplayDate(input);
    expect(result).toBe('05 February 2025');
  });

  it('should format display time correctly', () => {
    const input = '2025-02-05 09:00:00';
    const result = formatDisplayTime(input);
    expect(result).toBe('09:00');
  });

  it('should handle invalid date input', () => {
    expect(() => formatDateTime('invalid-date')).toThrow('Invalid date');
    expect(formatDisplayDate('invalid-date')).toBe('');
    expect(formatDisplayTime('invalid-date')).toBe('');
  });

  it('should handle empty input', () => {
    expect(() => formatDateTime('')).toThrow('Date/time value is missing');
    expect(formatDisplayDate('')).toBe('');
    expect(formatDisplayTime('')).toBe('');
  });

  it('should handle undefined input', () => {
    expect(() => formatDateTime(undefined)).toThrow('Date/time value is missing');
    expect(formatDisplayDate('')).toBe('');
    expect(formatDisplayTime('')).toBe('');
  });

  it('should handle Date input', () => {
    let input = new Date(2024, 1, 1, 9, 0, 0); // 1st February 2024
    expect(formatDateTime(input)).toBe('2024-02-01 09:00:00');
    expect(formatDisplayDate(input)).toBe('01 February 2024');
    expect(formatDisplayTime(input)).toBe('09:00');
  });
}); 
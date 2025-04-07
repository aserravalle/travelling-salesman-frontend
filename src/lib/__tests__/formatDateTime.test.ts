import { describe, it, expect } from 'vitest';
import { readDateTime, formatDisplayDate, formatDisplayTime } from '../formatDateTime';

describe('date formatting', () => {
  it('dd-MM-YYYY', () => {
    const input = '05-02-2025 09:00';
    testCase(input);
  });

  it('can parse API result', () => {
    const input = "2025-02-05T09:00:00";
    testCase(input);
  });

  it('YYYY-MM-ddTHH:MM:ssZ', () => {
    const input = new Date(2025,1,5,9,0,0).toISOString();
    testCase(input);
  });

  it('dd MM YYYY', () => {
    const input = '05 02 2025 09:00';
    testCase(input);
  });

  it('dd.MM.YYYY', () => {
    const input = '05.02.2025 09:00';
    testCase(input);
  });

  it('dd/MM/YYYY', () => {
    const input = '05/02/2025 09:00';
    testCase(input);
  });

  it('YYYY-MM-dd', () => {
    const input = '2025-02-05 09:00:00';
    testCase(input);
  });

  it('YYYY.MM.dd', () => {
    const input = '2025.02.05 09:00:00';
    testCase(input);
  });

  it('YYYY MM dd', () => {
    const input = '2025 02 05 09:00:00';
    testCase(input);
  });

  it('YYYY/MM/dd', () => {
    const input = '2025/02/05 09:00:00';
    testCase(input);
  });

  it('should handle invalid date input', () => {
    expect(() => readDateTime('invalid-date')).toThrow('Invalid date');
    expect(formatDisplayDate('invalid-date')).toBe('');
    expect(formatDisplayTime('invalid-date')).toBe('');
  });

  it('should handle empty input', () => {
    expect(() => readDateTime('')).toThrow('Date/time value is missing');
    expect(formatDisplayDate('')).toBe('');
    expect(formatDisplayTime('')).toBe('');
  });

  it('should handle undefined input', () => {
    expect(() => readDateTime(undefined)).toThrow('Date/time value is missing');
    expect(formatDisplayDate('')).toBe('');
    expect(formatDisplayTime('')).toBe('');
  });
}); 

function testCase(input: string) {
  const readInput = readDateTime(input);
  expect(readInput).toBe('2025-02-05 09:00:00');
  expect(formatDisplayDate(readInput)).toBe('05 February 2025');
  expect(formatDisplayTime(readInput)).toBe('09:00');

  expect(formatDisplayDate(input)).toBe('05 February 2025');
  expect(formatDisplayTime(input)).toBe('09:00');
}

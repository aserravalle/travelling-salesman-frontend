import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseFile } from '@/lib/fileParser';
import { Job, Salesman } from '@/types/types';
import { readFileForTest } from './testHelpers';
import path from 'path';

// Mock Papa Parse
vi.mock('papaparse', () => ({
  default: {
    parse: vi.fn()
  }
}));

// Mock XLSX
vi.mock('xlsx', () => ({
  read: vi.fn(),
  utils: {
    sheet_to_json: vi.fn()
  }
}));

describe('fileParser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('parse', () => {
    it('should parse jobs_constrained.csv data correctly', async () => {
      const filePath = path.join(process.cwd(), 'test', '03_jobs_constrained.csv');
      const rawData = await readFileForTest(filePath);

      const result = parseFile(rawData.data);
      
      expect(result.type).toBe('job');
      expect(result.data).toHaveLength(51);
      expect(result.errors).toHaveLength(0);
      
      // Check first parsed job
      const firstJob = result.data[0] as Job;
      expect(firstJob).toHaveProperty('job_id', '01');
      expect(firstJob).toHaveProperty('location');
      expect(firstJob.location).toHaveProperty('latitude', 40.711);
      expect(firstJob.location).toHaveProperty('longitude', -74.015);
      expect(firstJob).toHaveProperty('duration_mins', 90);
      expect(firstJob.date).toMatch(/^2025-02-05/);
      expect(firstJob.entry_time).toMatch(/^2025-02-05 09:00/);
      expect(firstJob.exit_time).toMatch(/^2025-02-05 11:30/);
    });

    it('should parse salesmen.csv data correctly', async () => {
      const filePath = path.join(process.cwd(), 'test', '01_salesmen.csv');
      const rawData = await readFileForTest(filePath);

      const result = parseFile(rawData.data);
      
      expect(result.type).toBe('salesman');
      expect(result.data).toHaveLength(10);
      expect(result.errors).toHaveLength(0);
      
      // Check first parsed salesman
      const firstSalesman = result.data[0] as Salesman;
      expect(firstSalesman).toHaveProperty('salesman_id', '101');
      expect(firstSalesman).toHaveProperty('location');
      expect(firstSalesman.location).toHaveProperty('latitude', 40.727);
      expect(firstSalesman.location).toHaveProperty('longitude', -73.95);
      expect(firstSalesman.start_time).toMatch(/^2025-02-05 09:00/);
      expect(firstSalesman.end_time).toMatch(/^2025-02-05 17:00/);
    });

    it('should parse job data correctly', () => {
      const mockData = [{
        job_id: '1',
        date: '05-02-2025 09:00',
        latitude: '40.7128',
        longitude: '-74.006',
        duration_mins: '60',
        entry_time: '05-02-2025 09:00',
        exit_time: '05-02-2025 12:00'
      }];

      const result = parseFile(mockData);
      
      expect(result.type).toBe('job');
      expect(result.data).toHaveLength(1);
      expect(result.errors).toHaveLength(0);
      
      const job = result.data[0] as Job;
      expect(job).toHaveProperty('job_id', '1');
      expect(job.location).toHaveProperty('latitude', 40.7128);
      expect(job.location).toHaveProperty('longitude', -74.006);
      expect(job).toHaveProperty('duration_mins', 60);
    });

    it('should handle missing required fields', () => {
      const mockData = [{
        job_id: '1',
        date: '05-02-2025 09:00',
        latitude: '40.7128',
        longitude: '-74.006',
        duration_mins: '60',
        entry_time: '05-02-2025 09:00'
        // Missing exit_time
      }];

      const result = parseFile(mockData);
      
      expect(result.type).toBe('job');
      expect(result.data).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('Missing required field');
    });

    it('should handle invalid location coordinates', () => {
      const mockData = [{
        job_id: '1',
        date: '05-02-2025 09:00',
        latitude: 'invalid',
        longitude: '-74.006',
        duration_mins: '60',
        entry_time: '05-02-2025 09:00',
        exit_time: '05-02-2025 12:00'
      }];

      const result = parseFile(mockData);
      
      expect(result.type).toBe('job');
      expect(result.data).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('Invalid location coordinates');
    });

    it('should handle empty data', () => {
      const result = parseFile([]);
      
      expect(result.type).toBe('unknown');
      expect(result.data).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe('No data to parse');
    });
  });
});
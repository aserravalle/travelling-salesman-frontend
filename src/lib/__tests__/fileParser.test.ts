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
      const firstJob = result.data[0] as any;
      expect(firstJob).toHaveProperty('job_id', '01');
      expect(firstJob).toHaveProperty('location', [40.711, -74.015]);
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
      const firstSalesman = result.data[0] as any;
      expect(firstSalesman).toHaveProperty('salesman_id', '101');
      expect(firstSalesman).toHaveProperty('home_location', [40.727, -73.95]);
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
      
      const job = result.data[0];
      expect(job).toHaveProperty('job_id', '1');
      expect(job).toHaveProperty('location', [40.7128, -74.006]);
      expect(job).toHaveProperty('duration_mins', 60);
    });

    it('should parse salesman data correctly', () => {
      const mockData = [{
        salesman_id: '101',
        home_latitude: '40.7128',
        home_longitude: '-74.006',
        start_time: '05-02-2025 09:00',
        end_time: '05-02-2025 17:00'
      }];

      const result = parseFile(mockData);
      
      expect(result.type).toBe('salesman');
      expect(result.data).toHaveLength(1);
      expect(result.errors).toHaveLength(0);
      
      const salesman = result.data[0];
      expect(salesman).toHaveProperty('salesman_id', '101');
      expect(salesman).toHaveProperty('home_location', [40.7128, -74.006]);
    });

    it('should handle empty data', () => {
      const result = parseFile([]);
      
      expect(result.type).toBe('unknown');
      expect(result.data).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe('No data to parse');
    });

    it('should parse salesmen data correctly', () => {
      const rawData = [{
        salesman_id: '101',
        home_latitude: '40.727',
        home_longitude: '-73.95',
        start_time: '05-02-2025 9:00',
        end_time: '05-02-2025 17:00'
      }];

      const result = parseFile(rawData);
      expect(result.type).toBe('salesman');
      expect(result.errors).toHaveLength(0);
      expect(result.data).toHaveLength(1);

      const salesman = result.data[0] as Salesman;
      expect(salesman.salesman_id).toBe('101');
      expect(salesman.home_location).toEqual([40.727, -73.95]);
      expect(salesman.start_time).toBe('2025-02-05 09:00:00');
      expect(salesman.end_time).toBe('2025-02-05 17:00:00');
    });

    it('should parse jobs data correctly', () => {
      const rawData = [{
        job_id: '01',
        date: '05-02-2025 9:00',
        latitude: '40.711',
        longitude: '-74.015',
        duration_mins: '90',
        entry_time: '05-02-2025 9:00',
        exit_time: '05-02-2025 19:00'
      }];

      const result = parseFile(rawData);
      expect(result.type).toBe('job');
      expect(result.errors).toHaveLength(0);
      expect(result.data).toHaveLength(1);

      const job = result.data[0] as Job;
      expect(job.job_id).toBe('01');
      expect(job.location).toEqual([40.711, -74.015]);
      expect(job.duration_mins).toBe(90);
      expect(job.date).toBe('2025-02-05 09:00:00');
      expect(job.entry_time).toBe('2025-02-05 09:00:00');
      expect(job.exit_time).toBe('2025-02-05 19:00:00');
    });

    it('should handle invalid coordinates', () => {
      const rawData = [{
        salesman_id: '101',
        home_latitude: 'invalid',
        home_longitude: '-73.95',
        start_time: '05-02-2025 9:00',
        end_time: '05-02-2025 17:00'
      }];

      const result = parseFile(rawData);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('Invalid home location coordinates');
    });

    it('should handle missing required fields', () => {
      const rawData = [{
        salesman_id: '101',
        home_latitude: '40.727',
        home_longitude: '-73.95',
        start_time: '',
        end_time: '05-02-2025 17:00'
      }];

      const result = parseFile(rawData);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('Missing required field');
    });
  });
});
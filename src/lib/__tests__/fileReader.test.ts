import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFile } from '../fileReader';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import path from 'path';
import { readFileForTest } from './testHelpers';

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

describe('fileReader', () => {
  describe('Reading Mock Files', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });
  
    it('should read CSV files', async () => {
      const mockFile = new File([''], 'test.csv', { type: 'text/csv' });
      const mockData = [
        { job_id: '1', date: '2025-02-05', latitude: '40.7128', longitude: '-74.006' }
      ];
  
      // Mock Papa Parse response
      (Papa.parse as any).mockImplementation((file, config) => {
        config.complete({
          data: mockData,
          errors: [],
          meta: { fields: Object.keys(mockData[0]) }
        });
      });
  
      const result = await readFile(mockFile);
      
      expect(result.data).toEqual(mockData);
      expect(result.errors).toHaveLength(0);
      expect(Papa.parse).toHaveBeenCalledWith(mockFile, expect.any(Object));
    });
  
    it('should read Excel files', async () => {
      // Create a mock Excel file with actual data
      const mockData = [
        { job_id: '1', date: '2025-02-05', latitude: '40.7128', longitude: '-74.006', duration_mins: '90', entry_time: '2025-02-05 09:00', exit_time: '2025-02-05 19:00' }
      ];
  
      // Mock the FileReader
      const mockArrayBuffer = new ArrayBuffer(8);
      const mockFileReader = {
        readAsArrayBuffer: vi.fn(),
        onload: null as any,
        onerror: null as any,
        result: mockArrayBuffer
      };
      global.FileReader = vi.fn(() => mockFileReader) as any;
  
      // Mock XLSX
      const mockWorksheet = {
        '!ref': 'A1:G1',
        '!dimensions': { r: 1, c: 7 },
        A1: { v: 'job_id', t: 's' },
        B1: { v: 'date', t: 's' },
        C1: { v: 'latitude', t: 's' },
        D1: { v: 'longitude', t: 's' },
        E1: { v: 'duration_mins', t: 's' },
        F1: { v: 'entry_time', t: 's' },
        G1: { v: 'exit_time', t: 's' },
        A2: { v: '1', t: 's' },
        B2: { v: '2025-02-05', t: 's' },
        C2: { v: '40.7128', t: 'n' },
        D2: { v: '-74.006', t: 'n' },
        E2: { v: '90', t: 'n' },
        F2: { v: '2025-02-05 09:00', t: 's' },
        G2: { v: '2025-02-05 19:00', t: 's' }
      };
  
      const mockWorkbook = {
        SheetNames: ['Sheet1'],
        Sheets: {
          Sheet1: mockWorksheet
        }
      };
  
      (XLSX.read as any).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as any).mockReturnValue(mockData);
  
      const mockFile = new File([''], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Trigger the FileReader onload event
      setTimeout(() => {
        mockFileReader.onload?.({ target: mockFileReader });
      }, 0);
  
      const result = await readFile(mockFile);
      
      expect(result.data).toEqual(mockData);
      expect(result.errors).toHaveLength(0);
      expect(result.debug).toEqual({
        sheetName: 'Sheet1',
        range: 'A1:G1',
        dimensions: { r: 1, c: 7 }
      });
      expect(XLSX.read).toHaveBeenCalledWith(mockArrayBuffer, { type: 'array' });
      expect(XLSX.utils.sheet_to_json).toHaveBeenCalledWith(mockWorksheet);
    });
  
    it('should handle invalid file types', async () => {
      const mockFile = new File([''], 'test.txt', { type: 'text/plain' });
      const result = await readFile(mockFile);
      
      expect(result.data).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe('Unsupported file format');
    });
  });

  describe('Reading Real CSVs', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });
  
    it('should read jobs_constrained.csv correctly', async () => {
      const filePath = path.join(process.cwd(), 'test', '03_jobs_constrained.csv');
      const result = await readFileForTest(filePath);
      
      expect(result.data).toBeDefined();
      expect(result.data.length).toBe(51);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe('1 empty row was skipped');
  
      // Check first job structure
      const firstJob = result.data[0];
      expect(firstJob).toHaveProperty('job_id', '01');
      expect(firstJob).toHaveProperty('date', '05-02-2025 9:00');
      expect(firstJob).toHaveProperty('latitude', '40.711');
      expect(firstJob).toHaveProperty('longitude', '-74.015');
      expect(firstJob).toHaveProperty('duration_mins', '90');
      expect(firstJob).toHaveProperty('entry_time', '05-02-2025 9:00');
      expect(firstJob).toHaveProperty('exit_time', '05-02-2025 11:30');
    });
  
    it('should read salesmen.csv correctly', async () => {
      const filePath = path.join(process.cwd(), 'test', '01_salesmen.csv');
      const result = await readFileForTest(filePath);
      
      expect(result.data).toBeDefined();
      expect(result.data.length).toBe(10);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe('1 empty row was skipped');
  
      // Check first salesman structure
      const firstSalesman = result.data[0];
      expect(firstSalesman).toHaveProperty('salesman_id', '101');
      expect(firstSalesman).toHaveProperty('home_latitude', '40.727');
      expect(firstSalesman).toHaveProperty('home_longitude', '-73.95');
      expect(firstSalesman).toHaveProperty('start_time', '05-02-2025 9:00');
      expect(firstSalesman).toHaveProperty('end_time', '05-02-2025 17:00');
    });
  }); 
});

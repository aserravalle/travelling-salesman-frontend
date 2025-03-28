import { describe, it, expect, vi, beforeEach } from 'vitest';
import { convertResponseToTableRows, exportTableToCSV, downloadCSV } from '@/lib/tableConverter';
import { RosterResponse, Location } from '@/types/types';
import Papa from 'papaparse';

// Mock Papa Parse
vi.mock('papaparse', () => ({
  default: {
    unparse: vi.fn()
  }
}));

// Mock document methods
const mockCreateElement = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
const mockClick = vi.fn();
const mockSetAttribute = vi.fn();

vi.stubGlobal('document', {
  createElement: mockCreateElement,
  body: {
    appendChild: mockAppendChild,
    removeChild: mockRemoveChild
  }
});

vi.stubGlobal('URL', {
  createObjectURL: vi.fn()
});

describe('tableConverter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset document mocks
    mockCreateElement.mockReturnValue({
      click: mockClick,
      setAttribute: mockSetAttribute
    });
  });

  describe('convertResponseToTableRows', () => {
    it('should convert assigned jobs correctly', () => {
      const mockResponse: RosterResponse = {
        message: 'Success',
        jobs: {
          '101': [{
            job_id: '1',
            client_name: 'Test Client',
            date: '2025-02-05',
            location: { latitude: 40.7128, longitude: -74.006 } as Location,
            duration_mins: 60,
            entry_time: '2025-02-05 09:00:00',
            exit_time: '2025-02-05 10:00:00',
            start_time: '2025-02-05 09:00:00',
            salesman_id: '101'
          }]
        },
        unassigned_jobs: []
      };

      const result = convertResponseToTableRows(mockResponse);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        job_id: '1',
        date: '2025-02-05',
        latitude: undefined,
        longitude: undefined,
        duration_mins: 60,
        entry_time: '2025-02-05 09:00:00',
        exit_time: '2025-02-05 10:00:00',
        assignment_status: 'Assigned',
        salesman_id: '101',
        start_time: '2025-02-05 09:00:00'
      });
    });

    it('should convert unassigned jobs correctly', () => {
      const mockResponse: RosterResponse = {
        message: 'Success',
        jobs: {},
        unassigned_jobs: [{
          job_id: '2',
          client_name: 'Test Client',
          date: '2025-02-05',
          location: { latitude: 40.7128, longitude: -74.006 } as Location,
          duration_mins: 60,
          entry_time: '2025-02-05 09:00:00',
          exit_time: '2025-02-05 10:00:00',
          start_time: null,
          salesman_id: null
        }]
      };

      const result = convertResponseToTableRows(mockResponse);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        job_id: '2',
        date: '2025-02-05',
        latitude: 40.7128,
        longitude: -74.006,
        duration_mins: 60,
        entry_time: '2025-02-05 09:00:00',
        exit_time: '2025-02-05 10:00:00',
        assignment_status: 'Unassigned',
        salesman_id: null,
        start_time: null
      });
    });
  });

  describe('exportTableToCSV', () => {
    it('should convert table data to CSV format', () => {
      const mockData = [
        { id: 1, name: 'Test 1' },
        { id: 2, name: 'Test 2' }
      ];
      
      const mockCSV = 'id,name\n1,Test 1\n2,Test 2';
      (Papa.unparse as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockCSV);

      const result = exportTableToCSV(mockData);
      
      expect(Papa.unparse).toHaveBeenCalledWith(mockData);
      expect(result).toBe(mockCSV);
    });
  });

  describe('downloadCSV', () => {
    it('should create and trigger download of CSV file', () => {
      const mockData = 'test,csv,data';
      const mockFilename = 'test.csv';
      const mockUrl = 'blob:test-url';
      
      (URL.createObjectURL as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockUrl);

      downloadCSV(mockData, mockFilename);

      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockSetAttribute).toHaveBeenCalledWith('download', mockFilename);
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
    });
  });
}); 
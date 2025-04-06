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
        location: {
          "latitude": 40.7128,
          "longitude": -74.006,
        },
        duration_mins: 60,
        entry_time: '2025-02-05 09:00:00',
        exit_time: '2025-02-05 10:00:00',
        assignment_status: 'Assigned',
        client_name: "Test Client",
        salesman_id: '101',
        "salesman_name": undefined,
        start_time: '2025-02-05 09:00:00'
      });
    });

    it('should convert unassigned jobs correctly', () => {
      const mockResponse: RosterResponse = {
        message: 'Success',
        jobs: {},
        unassigned_jobs: [{
          job_id: '2',
          date: '2025-02-05',
          location: { latitude: 40.7128, longitude: -74.006 } as Location,
          duration_mins: 60,
          entry_time: '2025-02-05 09:00:00',
          exit_time: '2025-02-05 10:00:00',
        }]
      };

      const result = convertResponseToTableRows(mockResponse);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        job_id: '2',
        date: '2025-02-05',
        location: {
          "latitude": 40.7128,
          "longitude": -74.006,
        },
        duration_mins: 60,
        entry_time: '2025-02-05 09:00:00',
        exit_time: '2025-02-05 10:00:00',
        assignment_status: 'Unassigned',
        salesman_id: null,
        start_time: null
      });
    });

    it('should convert a roster response into table rows', () => {
      const mockResponse: RosterResponse = {
        jobs: {
          '1': [
            {
              job_id: 'job1',
              date: '2023-01-01',
              location: { address: '123 Main St', latitude: 40.7128, longitude: -74.006 },
              duration_mins: 60,
              entry_time: '09:00',
              exit_time: '10:00',
              start_time: '09:00',
              client_name: 'Client A',
              salesman_id: '101',
              salesman_name: 'Salesman A'
            }
          ]
        },
        unassigned_jobs: [
          {
            job_id: 'job2',
            date: '2023-01-02',
            location: { address: '456 Elm St', latitude: 34.0522, longitude: -118.2437 },
            duration_mins: 30,
            entry_time: '11:00',
            exit_time: '11:30',
            client_name: 'Client B'
          }
        ],
        message: 'Success'
      };

      const result = convertResponseToTableRows(mockResponse);

      expect(result).toEqual([
        {
          job_id: 'job1',
          date: '2023-01-01',
          location: { address: '123 Main St', latitude: 40.7128, longitude: -74.006 },
          duration_mins: 60,
          entry_time: '09:00',
          exit_time: '10:00',
          assignment_status: 'Assigned',
          salesman_id: '1',
          start_time: '09:00',
          client_name: 'Client A',
          salesman_name: 'Salesman A'
        },
        {
          job_id: 'job2',
          date: '2023-01-02',
          location: { address: '456 Elm St', latitude: 34.0522, longitude: -118.2437 },
          duration_mins: 30,
          entry_time: '11:00',
          exit_time: '11:30',
          assignment_status: 'Unassigned',
          salesman_id: null,
          start_time: null,
          client_name: 'Client B'
        }
      ]);
    });
  });

  describe('exportTableToCSV', () => {
    it('should convert table data to CSV format', () => {
      const mockData = [
        {
          job_id: 'job2',
          date: '2023-01-02',
          location: { address: '456 Elm St', latitude: 34.0522, longitude: -118.2437 },
          duration_mins: 30,
          entry_time: '11:00',
          exit_time: '11:30',
          assignment_status: 'Unassigned',
          salesman_id: null,
          start_time: null,
          client_name: 'Client B'
        }
      ];
      
      const mockCSV = 'id,name\n1,Test 1\n2,Test 2';
      (Papa.unparse as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockCSV);

      const result = exportTableToCSV(mockData);

      // hack to get the location
      const processedRows = mockData.map(row => ({
        ...row,
        address: row.location?.address || '',
        latitude: row.location?.latitude || null,
        longitude: row.location?.longitude || null,
        location: undefined
      }));
        
      expect(Papa.unparse).toHaveBeenCalledWith(processedRows);
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

    it('should trigger a download of the CSV file', () => {
      const mockData = 'mocked_csv_data';
      const mockFilename = 'test.csv';
      const createElementSpy = vi.spyOn(document, 'createElement');
      const appendChildSpy = vi.spyOn(document.body, 'appendChild');
      const removeChildSpy = vi.spyOn(document.body, 'removeChild');
      const mockClick = vi.fn();

      createElementSpy.mockReturnValue({
        setAttribute: vi.fn(),
        click: mockClick,
        href: '',
      } as unknown as HTMLAnchorElement);

      downloadCSV(mockData, mockFilename);

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(appendChildSpy).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
    });
  });
});
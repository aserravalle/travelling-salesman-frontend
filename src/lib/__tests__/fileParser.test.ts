import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseFile } from '@/lib/fileParser';
import { Job, Salesman } from '@/types/types';
import { readFileForTest } from './testHelpers';
import path from 'path';
import fs from 'fs';
import { ReadResult } from '../fileReader';

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
    describe('Parse from CSV', () => {
      it('should parse jobs_constrained.csv data correctly', async () => {
        const fileName = '01_jobs_constrained.csv';
        const filePath = path.join(process.cwd(), 'test', fileName);
        const rawData = await readFileForTest(filePath);

        const result = parseFile(rawData.data, fileName);
        
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
        const fileName = '01_salesmen.csv';
        const filePath = path.join(process.cwd(), 'test', fileName);
        const rawData = await readFileForTest(filePath);

        const result = parseFile(rawData.data, fileName);
        
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
    });

    describe('Parse from mock data', () => {
      it('should parse job data correctly', () => {
        const mockData = [{
          job_id: '1',
          date: '05-02-2025 09:00',
          address: '123 Main St, New York, NY 10001',
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
        expect(job.location).toEqual({
          address: '123 Main St, New York, NY 10001',
          latitude: 40.7128,
          longitude: -74.006
        });
        expect(job).toHaveProperty('duration_mins', 60);
        expect(job).toHaveProperty('entry_time', '2025-02-05 09:00:00');
        expect(job).toHaveProperty('exit_time', '2025-02-05 12:00:00');
      });

      it('should combine address data', () => {
        const mockData = [{
          job_id: '1',
          date: '05-02-2025 09:00',
          latitude: '40.7128',
          longitude: '-74.006',
          duration_mins: '60',
          entry_time: '05-02-2025 09:00',
          exit_time: '05-02-2025 12:00',

          address: '123 Main St',
          postcode: '10001',
          city: 'New York',
          province: 'NY',
          country: 'USA',
        }];
  
        const result = parseFile(mockData);
        
        expect(result.type).toBe('job');
        expect(result.data).toHaveLength(1);
        expect(result.errors).toHaveLength(0);
  
        const job = result.data[0] as Job;
        expect(job).toHaveProperty('job_id', '1');
        expect(job.location).toEqual({
          address: '123 Main St, 10001, New York, NY, USA',
          latitude: 40.7128,
          longitude: -74.006
        });
      });

      it('should handle different location types', () => {
        const mockData = [
          {
            job_id: '1',
            date: '05-02-2025 09:00',
            address: '123 Main St, New York, NY 10001',
            latitude: undefined,
            longitude: undefined,
            duration_mins: '60',
            entry_time: '05-02-2025 09:00',
            exit_time: '05-02-2025 12:00'
          }, // address, no coordinates
          {
            job_id: '1',
            date: '05-02-2025 09:00',
            latitude: '40.7128',
            longitude: '-74.006',
            duration_mins: '60',
            entry_time: '05-02-2025 09:00',
            exit_time: '05-02-2025 12:00'
          }, // coordinates, no address
          {
            job_id: '1',
            date: '05-02-2025 09:00',
            address: '123 Main St, New York, NY 10001',
            longitude: '-74.006',
            duration_mins: '60',
            entry_time: '05-02-2025 09:00',
            exit_time: '05-02-2025 12:00'
          }, // address, incomplete coordinates
        ];
  
        const result = parseFile(mockData);
        
        expect(result.type).toBe('job');
        expect(result.data).toHaveLength(3);
        expect(result.errors).toHaveLength(0);
        
        let job = result.data[0] as Job;
        expect(job).toHaveProperty('job_id', '1');
        expect(job.location).toHaveProperty('address', '123 Main St, New York, NY 10001');
        expect(job.location).toHaveProperty('latitude', undefined);
        expect(job.location).toHaveProperty('longitude', undefined);
        expect(job).toHaveProperty('duration_mins', 60);
        expect(job).toHaveProperty('entry_time', '2025-02-05 09:00:00');
        expect(job).toHaveProperty('exit_time', '2025-02-05 12:00:00');
        
        job = result.data[1] as Job;
        expect(job).toHaveProperty('job_id', '1');
        expect(job.location).toHaveProperty('latitude', 40.7128);
        expect(job.location).toHaveProperty('longitude', -74.006);
        expect(job.location).toHaveProperty('address', undefined);
        expect(job).toHaveProperty('duration_mins', 60);
        expect(job).toHaveProperty('entry_time', '2025-02-05 09:00:00');
        expect(job).toHaveProperty('exit_time', '2025-02-05 12:00:00');
        
        job = result.data[2] as Job;
        expect(job).toHaveProperty('job_id', '1');
        expect(job.location).toHaveProperty('address', '123 Main St, New York, NY 10001');
        expect(job.location).toHaveProperty('latitude', undefined);
        expect(job.location).toHaveProperty('longitude', undefined);
        expect(job).toHaveProperty('duration_mins', 60);
        expect(job).toHaveProperty('entry_time', '2025-02-05 09:00:00');
        expect(job).toHaveProperty('exit_time', '2025-02-05 12:00:00');
      });
    });

    describe('Handle errors in parsing data', () => {

      it('should handle invalid location coordinates in job data', () => {
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
        expect(result.errors[0].message).toContain('Row 1: Location must have either an address or valid coordinates');
      });

      it('should handle invalid location coordinates in salesman data', () => {
        const mockData = [{
          salesman_id: '1',
          date: '05-02-2025 09:00',
          latitude: 'invalid',
          longitude: '-74.006',
        }];
  
        const result = parseFile(mockData);
        
        expect(result.type).toBe('salesman');
        expect(result.data).toHaveLength(0);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].message).toContain('Row 1: Location must have either an address or valid coordinates');
      });
  
      it('should handle empty data', () => {
        const result = parseFile([]);
        
        expect(result.type).toBe('unknown');
        expect(result.data).toHaveLength(0);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].message).toBe('No data to parse');
      });
      
      it('should handle missing required job fields', () => {
        const mockData = [{
          job_id: '1',
          latitude: '40.7128',
          longitude: '-74.006',
          // Missing entry_time, exit_time, duration_mins
        }];
  
        const result = parseFile(mockData);
        
        expect(result.type).toBe('job');
        expect(result.data).toHaveLength(1);
        expect(result.errors).toHaveLength(0);
        
        const job = result.data[0] as Job;
        expect(job).toHaveProperty('duration_mins', 60);
        let today = new Date().toISOString().split('T')[0];
        expect(job).toHaveProperty('entry_time', `${today} 09:00:00`);
        expect(job).toHaveProperty('exit_time', `${today} 23:00:00`);
      });

      it('should handle missing required salesman fields', () => {
        const mockData = [{
          salesman_id: '1',
          date: '05-02-2025 09:00',
          address: '123 Main St, New York, NY 10001',
          // Missing start_time, end_time
        }];
  
        const result = parseFile(mockData);
        
        expect(result.type).toBe('salesman');
        expect(result.data).toHaveLength(1);
        expect(result.errors).toHaveLength(0);
        
        const salesman = result.data[0] as Salesman;
        expect(salesman).toHaveProperty('salesman_id', '1');
        let today = new Date().toISOString().split('T')[0];
        expect(salesman).toHaveProperty('start_time', `${today} 09:00:00`);
        expect(salesman).toHaveProperty('end_time', `${today} 18:00:00`);
      });

      it('should handle missing location', () => {
        const mockData = [{
          job_id: '1',
          date: '05-02-2025 09:00',
          latitude: '40.7128',
          duration_mins: '60',
          entry_time: '05-02-2025 09:00',
          exit_time: '05-02-2025 12:00'
        }];
  
        const result = parseFile(mockData);
        
        expect(result.type).toBe('job');
        expect(result.data).toHaveLength(0);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].message).toContain('Row 1: Location must have either an address or valid coordinates');
      });
    });
  });
});

describe('parseJobRow with description-based times', () => {
  it('should parse times from description when regular columns are missing', () => {
    const mockData = [{
      job_id: '1',
      date: '05-02-2025 09:00',
      address: '123 Main St, New York, NY 10001',
      latitude: '40.7128',
      longitude: '-74.006',
      duration_mins: '60',
      description: 'Enlace externo:  Enlace:  -      Salida:  Hora de salida: 08:40     Entrada:  Fecha: 05-02-2025 14:00  Huéspedes:  2  Opciones:  -  Indicaciones:'
    }];

    const result = parseFile(mockData);
    
    expect(result.type).toBe('job');
    expect(result.data).toHaveLength(1);
    expect(result.errors).toHaveLength(0);

    const job = result.data[0] as Job;
    expect(job).toHaveProperty('entry_time', '2025-02-05 08:40:00');
    expect(job).toHaveProperty('exit_time', '2025-02-05 14:00:00');
  });

  it('should prefer description times over regular columns when both exist', () => {
    const mockData = [{
      job_id: '1',
      date: '05-02-2025 09:00',
      address: '123 Main St, New York, NY 10001',
      latitude: '40.7128',
      longitude: '-74.006',
      duration_mins: '60',
      entry_time: '05-02-2025 09:00',
      exit_time: '05-02-2025 12:00',
      description: 'Enlace externo:  Enlace:  -      Salida:  Hora de salida: 08:40     Entrada:  Fecha: 05-02-2025 14:00  Huéspedes:  2  Opciones:  -  Indicaciones:'
    }];

    const result = parseFile(mockData);
    
    expect(result.type).toBe('job');
    expect(result.data).toHaveLength(1);
    expect(result.errors).toHaveLength(0);

    const job = result.data[0] as Job;
    expect(job).toHaveProperty('entry_time', '2025-02-05 08:40:00');
    expect(job).toHaveProperty('exit_time', '2025-02-05 14:00:00');
  });

  it('should handle description with only exit time', () => {
    const mockData = [{
      job_id: '1',
      date: '05-02-2025 09:00',
      address: '123 Main St, New York, NY 10001',
      latitude: '40.7128',
      longitude: '-74.006',
      duration_mins: '60',
      description: 'Enlace externo:  Enlace:  -      Salida:  Hora de salida: 11:00     Entrada:  Fecha: -  Huéspedes:  -  Opciones:  -  Indicaciones:  LARGA ESTANCIA 25 NOCHES'
    }];

    const result = parseFile(mockData);
    
    expect(result.type).toBe('job');
    expect(result.data).toHaveLength(1);
    expect(result.errors).toHaveLength(0);

    const job = result.data[0] as Job;
    const today = new Date().toISOString().split('T')[0];
    expect(job).toHaveProperty('entry_time', `2025-02-05 11:00:00`); // Uses default from handleMissingJobData
    expect(job).toHaveProperty('exit_time', `2025-02-05 23:00:00`);
  });

  it('should handle description with only entry time', () => {
    const mockData = [{
      job_id: '1',
      date: '05-02-2025 09:00',
      address: '123 Main St, New York, NY 10001',
      latitude: '40.7128',
      longitude: '-74.006',
      duration_mins: '60',
      description: 'Enlace externo:  Enlace:  -      Salida:  Hora de salida: -     Entrada:  Fecha: 28-03-2025 14:00  Huéspedes:  2  Opciones:  -  Indicaciones:'
    }];

    const result = parseFile(mockData);
    
    expect(result.type).toBe('job');
    expect(result.data).toHaveLength(1);
    expect(result.errors).toHaveLength(0);

    const job = result.data[0] as Job;
    const today = new Date().toISOString().split('T')[0];
    expect(job).toHaveProperty('entry_time', `2025-02-05 09:00:00`);
    expect(job).toHaveProperty('exit_time', `2025-02-05 14:00:00`); // Uses default from handleMissingJobData
  });

  it('should handle description with no time information', () => {
    const mockData = [{
      job_id: '1',
      date: '05-02-2025 09:00',
      address: '123 Main St, New York, NY 10001',
      latitude: '40.7128',
      longitude: '-74.006',
      duration_mins: '60',
      description: 'Enlace externo:  Enlace:  -      Salida:  Hora de salida: -     Entrada:  Fecha: -  Huéspedes:  2  Opciones:  -  Indicaciones:'
    }];

    const result = parseFile(mockData);
    
    expect(result.type).toBe('job');
    expect(result.data).toHaveLength(1);
    expect(result.errors).toHaveLength(0);

    const job = result.data[0] as Job;
    const today = new Date().toISOString().split('T')[0];
    expect(job).toHaveProperty('entry_time', `2025-02-05 09:00:00`);
    expect(job).toHaveProperty('exit_time', `2025-02-05 23:00:00`);
  });

  it('should handle multiple jobs with different description formats', () => {
    const mockData = [
      {
        job_id: '1',
        date: '05-02-2025 09:00',
        address: '123 Main St, New York, NY 10001',
        latitude: '40.7128',
        longitude: '-74.006',
        duration_mins: '60',
        description: 'Enlace externo:  Enlace:  -      Salida:  Hora de salida: 08:40     Entrada:  Fecha: 28-03-2025 14:00  Huéspedes:  2  Opciones:  -  Indicaciones:'
      },
      {
        job_id: '2',
        date: '05-02-2025 09:00',
        address: '456 Oak St, New York, NY 10002',
        latitude: '40.7129',
        longitude: '-74.007',
        duration_mins: '60',
        description: 'Enlace externo:  Enlace:  -      Salida:  Hora de salida: 11:00     Entrada:  Fecha: -  Huéspedes:  -  Opciones:  -  Indicaciones:  LARGA ESTANCIA 25 NOCHES'
      }
    ];

    const result = parseFile(mockData);
    
    expect(result.type).toBe('job');
    expect(result.data).toHaveLength(2);
    expect(result.errors).toHaveLength(0);

    const today = new Date().toISOString().split('T')[0];
    
    const job1 = result.data[0] as Job;
    expect(job1).toHaveProperty('entry_time', '2025-02-05 08:40:00');
    expect(job1).toHaveProperty('exit_time', '2025-02-05 14:00:00');

    const job2 = result.data[1] as Job;
    expect(job2).toHaveProperty('entry_time', `2025-02-05 11:00:00`);
    expect(job2).toHaveProperty('exit_time', `2025-02-05 23:00:00`);
  });
});

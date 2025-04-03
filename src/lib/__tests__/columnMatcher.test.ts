import { describe, it, expect } from 'vitest';
import { determineDatasetType, matchColumns, type MatchResult } from '../columnMatcher';

describe('columnMatcher', () => {
  describe('Matching columns with pre determined types', () => {
    it('should identify job dataset with exact column names', () => {
      const columns = ['job_id', 'date', 'latitude', 'longitude', 'duration_mins', 'entry_time', 'exit_time'];
      const result = matchColumns(columns, 'job');
      
      expect(result.type).toBe('job');
      expect(result.columnMatches).toEqual({
        job_id: 'job_id',
        date: 'date',
        latitude: 'latitude',
        longitude: 'longitude',
        duration_mins: 'duration_mins',
        entry_time: 'entry_time',
        exit_time: 'exit_time'
      });
    });

    it('should identify salesman dataset with exact column names', () => {
      const columns = ['salesman_id', 'latitude', 'longitude', 'start_time', 'end_time'];
      const result = matchColumns(columns, 'salesman');
      
      expect(result.columnMatches).toEqual({
        salesman_id: 'salesman_id',
        latitude: 'latitude',
        longitude: 'longitude',
        start_time: 'start_time',
        end_time: 'end_time'
      });
      expect(result.type).toBe('salesman');
    });

    it('should identify job dataset with alternative column names', () => {
      const columns = ['jobid', 'delivery_date', 'lat', 'long', 'minutes', 'window_start', 'window_end'];
      const result = matchColumns(columns, 'job');
      
      expect(result.type).toBe('job');
      expect(result.columnMatches).toEqual({
        job_id: 'jobid',
        date: 'delivery_date',
        latitude: 'lat',
        longitude: 'long',
        duration_mins: 'minutes',
        entry_time: 'window_start',
        exit_time: 'window_end'
      });
    });

    it('should identify salesman dataset with alternative column names', () => {
      const columns = ['employee_id', 'lat', 'lng', 'shift_start', 'shift_end'];
      const result = matchColumns(columns, 'salesman');
      
      expect(result.columnMatches).toEqual({
        salesman_id: 'employee_id',
        latitude: 'lat',
        longitude: 'lng',
        start_time: 'shift_start',
        end_time: 'shift_end'
      });
      expect(result.type).toBe('salesman');
    });

    it('should handle case-insensitive matching', () => {
      const columns = ['JOB_ID', 'DATE', 'LATITUDE', 'LONGITUDE', 'DURATION_MINS', 'ENTRY_TIME', 'EXIT_TIME'];
      const result = matchColumns(columns, 'job');
      
      expect(result.type).toBe('job');
      expect(result.columnMatches).toEqual({
        job_id: 'JOB_ID',
        date: 'DATE',
        latitude: 'LATITUDE',
        longitude: 'LONGITUDE',
        duration_mins: 'DURATION_MINS',
        entry_time: 'ENTRY_TIME',
        exit_time: 'EXIT_TIME'
      });
    });

    it('should handle columns with extra spaces and special characters', () => {
      const columns = ['job-id', 'delivery date', 'lat_coordinate', 'long_coordinate', 'duration (mins)', 'entry-time', 'exit-time'];
      const result = matchColumns(columns, 'job');
      
      expect(result.columnMatches).toEqual({
        job_id: 'job-id',
        date: 'delivery date',
        latitude: 'lat_coordinate',
        longitude: 'long_coordinate',
        duration_mins: 'duration (mins)',
        entry_time: 'entry-time',
        exit_time: 'exit-time'
      });
      expect(result.type).toBe('job');
    });

    it('should handle Spanish job column names', () => {
      // Es.	Inicio	Fin	Duración	Tarea	Tipo	CP	Descripción	Provincia	Dirección	Población	País
      let columns = ['Inicio', 'Fin', 'Duración', 'Tarea', 'Tipo', 'CP', 'Descripción', 'Provincia', 'Dirección', 'Población', 'País'];
      let result = matchColumns(columns, 'job');
      
      expect(result.type).toBe('job');
      expect(result.columnMatches).toEqual({
        address: 'Dirección',
        city: 'Población',
        client_name: 'Tarea',
        country: 'País',
        description: 'Descripción',
        duration_mins: 'Duración',
        postcode: 'CP',
        province: 'Provincia',
      });
    });

    it('should handle Spanish salesman column names', () => {
      // ID	Nombre completo	Tipo	Departamento	Dirección	Población	Provincia	País	Fecha creación
      let columns = ['ID', 'Nombre completo', 'Dirección'];
      let result = matchColumns(columns, 'salesman');
      
      expect(result.type).toBe('salesman');
      expect(result.columnMatches).toEqual({
        salesman_id: 'ID',
        salesman_name: 'Nombre completo',
        address: 'Dirección',
      });
    });
  });

  describe('Matching dataset type', () => {
    it('should handle Spanish job data set types dataset name', () => {
      let result = determineDatasetType([], "04_planificación_20250328.csv")
      expect(result).toBe('job');

      result = determineDatasetType([], "REPASAT - Panel - Planificación (3).xlsx")
      expect(result).toBe('job');
    });

    it('should handle Spanish salesman data set types dataset name', () => {
      let result = determineDatasetType([], "04_empleados_20250328.csv")
      expect(result).toBe('salesman');

      result = determineDatasetType([], "REPASAT - Admin - Empleados.xlsx")
      expect(result).toBe('salesman');
    });

    it('should identify job files by name', () => {
      const columns = ['ID', 'Name', 'Address'];
      
      // Test various job file name patterns
      const jobFileNames = [
        'jobs.xlsx',
        'service_tasks.csv',
        'delivery_plan.xlsx',
        'task_list_2024.xlsx',
        'services_schedule.csv',
        'deliveries_q1.xlsx'
      ];

      jobFileNames.forEach(fileName => {
        const result = determineDatasetType(columns, fileName);
        expect(result).toBe('job');
      });
    });

    it('should identify salesman files by name', () => {
      const columns = ['ID', 'Name', 'Address'];
      
      // Test various salesman file name patterns
      const salesmanFileNames = [
        'salesmen.xlsx',
        'employees.csv',
        'staff_list.xlsx',
        'technicians_schedule.csv',
        'empleados_activos.xlsx',
        'empleadas_turno.xlsx'
      ];

      salesmanFileNames.forEach(fileName => {
        const result = determineDatasetType(columns, fileName);
        expect(result).toBe('salesman');
      });
    });

    it('should handle mixed case file names', () => {
      const columns = ['ID', 'Name', 'Address'];
      
      const mixedCaseFiles = [
        'Jobs_List.xlsx',
        'SALESMEN_2024.csv',
        'Service-Tasks.xlsx',
        'EMPLOYEES_ACTIVE.csv',
        'Delivery_Schedule.xlsx',
        'TECHNICIANS_ROSTER.csv'
      ];

      mixedCaseFiles.forEach(fileName => {
        const result = determineDatasetType(columns, fileName);
        expect(result).toBe(fileName.toLowerCase().includes('job') || 
                          fileName.toLowerCase().includes('task') || 
                          fileName.toLowerCase().includes('service') || 
                          fileName.toLowerCase().includes('delivery') ? 'job' : 'salesman');
      });
    });

    it('should handle file names with special characters and spaces', () => {
      const columns = ['ID', 'Name', 'Address'];
      
      const specialCharFiles = [
        'jobs-list-2024.xlsx',
        'salesmen_roster_2024.csv',
        'service.tasks.xlsx',
        'employees (active).csv',
        'delivery_schedule_2024.xlsx',
        'technicians-roster.csv'
      ];

      specialCharFiles.forEach(fileName => {
        const result = determineDatasetType(columns, fileName);
        expect(result).toBe(fileName.toLowerCase().includes('job') || 
                          fileName.toLowerCase().includes('task') || 
                          fileName.toLowerCase().includes('service') || 
                          fileName.toLowerCase().includes('delivery') ? 'job' : 'salesman');
      });
    });

    it('should handle file names with multiple keywords', () => {
      const columns = ['ID', 'Name', 'Address'];
      
      const multiKeywordFiles = [
        'jobs_and_tasks_2024.xlsx',
        'salesmen_and_technicians.csv',
        'service_delivery_tasks.xlsx',
        'employees_and_staff.csv',
        'delivery_jobs_schedule.xlsx',
        'technicians_and_employees.csv'
      ];

      multiKeywordFiles.forEach(fileName => {
        const result = determineDatasetType(columns, fileName);
        expect(result).toBe(fileName.toLowerCase().includes('job') || 
                          fileName.toLowerCase().includes('task') || 
                          fileName.toLowerCase().includes('service') || 
                          fileName.toLowerCase().includes('delivery') ? 'job' : 'salesman');
      });
    });

    it('should return unknown for ambiguous file names', () => {
      const columns = ['ID', 'Name', 'Address'];
      
      const ambiguousFiles = [
        'schedule.xlsx',
        'roster.csv',
        'list.xlsx',
        'data.csv',
        'report.xlsx'
      ];

      ambiguousFiles.forEach(fileName => {
        const result = determineDatasetType(columns, fileName);
        expect(result).toBe('unknown');
      });
    });
  });
});
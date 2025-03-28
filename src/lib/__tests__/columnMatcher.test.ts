import { describe, it, expect } from 'vitest';
import { matchColumns, type MatchResult } from '@/lib/columnMatcher';

describe('columnMatcher', () => {
  it('should identify job dataset with exact column names', () => {
    const columns = ['job_id', 'date', 'latitude', 'longitude', 'duration_mins', 'entry_time', 'exit_time'];
    const result = matchColumns(columns);
    
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
    const result = matchColumns(columns);
    
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
    const result = matchColumns(columns);
    
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
    const result = matchColumns(columns);
    
    expect(result.columnMatches).toEqual({
      salesman_id: 'employee_id',
      latitude: 'lat',
      longitude: 'lng',
      start_time: 'shift_start',
      end_time: 'shift_end'
    });
    expect(result.type).toBe('salesman');
  });

  it('should return unknown type for ambiguous columns', () => {
    const columns = ['id', 'name', 'address', 'phone'];
    const result = matchColumns(columns);
    
    expect(result.type).toBe('unknown');
  });

  it('should handle empty column list', () => {
    const columns: string[] = [];
    const result = matchColumns(columns);
    
    expect(result.type).toBe('unknown');
    expect(result.columnMatches).toEqual({});
  });

  it('should handle case-insensitive matching', () => {
    const columns = ['JOB_ID', 'DATE', 'LATITUDE', 'LONGITUDE', 'DURATION_MINS', 'ENTRY_TIME', 'EXIT_TIME'];
    const result = matchColumns(columns);
    
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
    const result = matchColumns(columns);
    
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
});
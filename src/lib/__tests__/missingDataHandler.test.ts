import {
  resetIdCounters,
  inferJobId,
  inferSalesmanId,
  buildLocation,
  handleMissingJobData,
  handleMissingSalesmanData
} from '../rowParser/missingDataHandler';
import { describe, it, expect, beforeEach } from 'vitest';

describe('missingDataHandler', () => {
  beforeEach(() => {
    resetIdCounters();
  });

  it('inferJobId generates sequential job IDs', () => {
    expect(inferJobId()).toBe('1');
    expect(inferJobId()).toBe('2');
  });

  it('inferSalesmanId generates sequential salesman IDs', () => {
    expect(inferSalesmanId()).toBe('101');
    expect(inferSalesmanId()).toBe('102');
  });

  it('buildLocation constructs a location object with coordinates', () => {
    const row = { latitude: '40.7128', longitude: '-74.0060' };
    const columnMatches = { latitude: 'latitude', longitude: 'longitude' };
    const location = buildLocation(row, columnMatches);
    expect(location).toEqual({
      address: undefined,
      latitude: 40.7128,
      longitude: -74.006
    });
  });

  it('buildLocation constructs a location object with an address', () => {
    const row = { street: '123 Main St', city: 'New York', state: 'NY' };
    const columnMatches = {
      street: 'street',
      city: 'city',
      state: 'state'
    };
    const location = buildLocation(row, columnMatches);
    expect(location.address).toBe('123 Main St, New York, NY');
  });

  it('handleMissingJobData fills in missing job data', () => {
    const row = {};
    const columnMatches = {};
    const defaults = handleMissingJobData(row, columnMatches);
    expect(defaults).toEqual({
      job_id: '1',
      date: expect.any(String),
      entry_time: expect.any(String),
      exit_time: expect.any(String),
      duration_mins: 60
    });
  });

  it('handleMissingSalesmanData fills in missing salesman data', () => {
    const row = {};
    const columnMatches = {};
    const defaults = handleMissingSalesmanData(row, columnMatches);
    expect(defaults).toEqual({
      salesman_id: '101',
      start_time: expect.any(String),
      end_time: expect.any(String)
    });
  });

  it('handleMissingJobData does not overwrite existing job data', () => {
    const row = { job_id: '123', date: '2023-01-01', duration_mins: 30 };
    const columnMatches = { job_id: 'job_id', date: 'date', duration_mins: 'duration_mins' };
    const defaults = handleMissingJobData(row, columnMatches);

    let today = new Date().toISOString().split('T')[0];
    expect(defaults).toHaveProperty('entry_time', `${today} 09:00:00`);
    expect(defaults).toHaveProperty('exit_time', `${today} 23:00:00`);
  });

  it('handleMissingSalesmanData does not overwrite existing salesman data', () => {
    const row = { salesman_id: '456', start_time: '09:00' };
    const columnMatches = { salesman_id: 'salesman_id', start_time: 'start_time' };
    const defaults = handleMissingSalesmanData(row, columnMatches);

    let today = new Date().toISOString().split('T')[0];
    expect(defaults).toHaveProperty('end_time', `${today} 18:00:00`);
  });
});

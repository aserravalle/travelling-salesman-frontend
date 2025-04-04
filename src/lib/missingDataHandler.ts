import { Job, Salesman, Location } from '@/types/types';
import { readDateTime } from './formatDateTime';
import { ADDRESS_COLUMN_MAPPINGS } from './columnMappings/addressMappings';

// Default working hours
const DEFAULT_SALESMAN_START_TIME = 9;
const DEFAULT_SALESMAN_END_TIME = 18;
const DEFAULT_JOB_ENTRY_TIME = 9;
const DEFAULT_JOB_EXIT_TIME = 23;
const DEFAULT_JOB_DURATION = 60;

// Get today's date in YYYY-MM-DD format
function getTodayDate(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

// Create a default time for today
function getDefaultTime(hour: number): string {
  const today = new Date();
  today.setHours(hour, 0, 0, 0);
  return readDateTime(today.toISOString());
}

// Reset ID counters for each new file
let nextJobId = 1;
let nextSalesmanId = 101;

export function resetIdCounters(): void {
  nextJobId = 1;
  nextSalesmanId = 101;
}

// Infer a job ID based on the current count
export function inferJobId(): string {
  return String(nextJobId++);
}

// Infer a salesman ID based on the current count
export function inferSalesmanId(): string {
  return String(nextSalesmanId++);
}

// Build a complete location object from available data
export function buildLocation(
  row: any,
  columnMatches: { [key: string]: string }
): Location {
  const location: Location = {
    address: undefined,
    latitude: undefined,
    longitude: undefined
  };

  // Try to get coordinates first
  if (columnMatches.latitude && columnMatches.longitude) {
    const lat = parseFloat(row[columnMatches.latitude]);
    const lng = parseFloat(row[columnMatches.longitude]);
    if (!isNaN(lat) && !isNaN(lng)) {
      location.latitude = lat;
      location.longitude = lng;
    }
  }

  // Build address string from available address fields using ADDRESS_COLUMN_MAPPINGS
  const addressParts: string[] = [];
  for (const [field, possibleColumns] of Object.entries(ADDRESS_COLUMN_MAPPINGS)) {
    for (const column of possibleColumns) {
      if (columnMatches[column] && row[columnMatches[column]]) {
        addressParts.push(String(row[columnMatches[column]]));
        break;
      }
    }
  }

  if (addressParts.length > 0) {
    location.address = addressParts.join(', ');
  }

  return location;
}

// Handle missing data for a job row
export function handleMissingJobData(
  row: any,
  columnMatches: { [key: string]: string }
): Partial<Job> {
  const defaults: Partial<Job> = {};

  // Handle missing ID
  if (!columnMatches.job_id) {
    defaults.job_id = inferJobId();
  }

  // Handle missing date
  if (!columnMatches.date) {
    defaults.date = getTodayDate();
  }

  // Handle missing times
  if (!columnMatches.entry_time) {
    defaults.entry_time = getDefaultTime(DEFAULT_JOB_ENTRY_TIME);
  }
  if (!columnMatches.exit_time) {
    defaults.exit_time = getDefaultTime(DEFAULT_JOB_EXIT_TIME);
  }

  // Handle missing duration
  if (!columnMatches.duration_mins) {
    defaults.duration_mins = DEFAULT_JOB_DURATION;
  }

  return defaults;
}

// Handle missing data for a salesman row
export function handleMissingSalesmanData(
  row: any,
  columnMatches: { [key: string]: string }
): Partial<Salesman> {
  const defaults: Partial<Salesman> = {};

  // Handle missing ID
  if (!columnMatches.salesman_id || !row[columnMatches.salesman_id]) {
    defaults.salesman_id = inferSalesmanId();
  }

  // Handle missing times
  if (!columnMatches.start_time || !row[columnMatches.start_time]) {
    defaults.start_time = getDefaultTime(DEFAULT_SALESMAN_START_TIME);
  }
  if (!columnMatches.end_time || !row[columnMatches.end_time]) {
    defaults.end_time = getDefaultTime(DEFAULT_SALESMAN_END_TIME);
  }

  return defaults;
} 
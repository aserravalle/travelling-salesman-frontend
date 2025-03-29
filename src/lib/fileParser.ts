import { Job, Salesman, Location } from '@/types/types';
import { 
  matchColumns, 
  type DatasetType, 
  type MatchResult, 
  determineDatasetType, 
  findBestColumnMatch 
} from './columnMatcher';
import { formatDateTime } from './formatDateTime';
import { 
  ADDRESS_COLUMN_MAPPINGS,
  JOB_COLUMN_MAPPINGS,
  SALESMAN_COLUMN_MAPPINGS
} from './columnMappings';
import {
  buildLocation,
  handleMissingJobData,
  handleMissingSalesmanData,
  resetIdCounters
} from './missingDataHandler';

export interface ParseError {
  row?: number;
  column?: string;
  message: string;
  details?: any; // For additional error context
}

export interface ParseResult<T> {
  data: T[];
  type: DatasetType;
  skippedRows: number;
  errors: ParseError[];
}

// Parse raw data into typed objects
export const parseFile = (rawData: any[], fileName: string = ''): ParseResult<Job | Salesman> => {
  console.log('[FileParser] Starting data parsing:', {
    rowCount: rawData.length,
    firstRow: rawData[0],
    fileName
  });

  if (!rawData.length) { return noDataToParse() };

  // Reset ID counters for the new file
  resetIdCounters();

  const columns = Object.keys(rawData[0]);
  console.debug('[FileParser] Detected columns:', columns);

  // Determine the dataset type using file name and basic checks
  let type = determineDatasetType(columns, fileName);
  
  if (type != 'job' && type != 'salesman') { 
    if (type === 'unknown') { return unknownDataSetType() }
    if (type === 'missingLocation') { return missingLocationType() }
    if (type === 'missingRequiredJobFields') { return missingRequiredJobFieldsType() }
    if (type === 'missingRequiredSalesmanFields') { return missingRequiredSalesmanFieldsType() }
   }

  const errors: ParseError[] = [];
  const parsedData: (Job | Salesman)[] = [];
  let skippedRows = 0;

  const parseRow = type === 'job' ? parseJobRow : parseSalesmanRow;

  for (let i = 0; i < rawData.length; i++) {
    try {
      const row = rawData[i];
      console.debug(`[FileParser] Processing row ${i + 1}:`, row);
      
      const matchResult = matchColumns(Object.keys(row), type);
      const parsedRow = parseRow(row, matchResult, i);
      parsedData.push(parsedRow);
      console.debug(`[FileParser] Successfully parsed ${type}:`, parsedRow);
    } catch (error) {
      skippedRows++;
      console.error(`[FileParser] Error parsing row ${i + 1}:`, {
        row: rawData[i],
        error
      });

      errors.push({
        row: i + 1,
        message: error instanceof Error ? error.message : 'Unknown error parsing row',
        details: {
          row: rawData[i],
          error
        }
      });
    }
  }

  console.log('[FileParser] Parsing complete:', {
    type,
    totalRows: rawData.length,
    parsedRows: parsedData.length,
    skippedRows,
    errorCount: errors.length
  });

  return {
    data: parsedData as any[],
    type,
    skippedRows,
    errors
  };

  function unknownDataSetType(): ParseResult<Job | Salesman> {
    console.error('[FileParser] Unable to identify dataset type:', {
      columns
    });
    return {
      data: [],
      type: 'unknown',
      skippedRows: 0,
      errors: [{
        message: `Unable to identify dataset type.`,
        details: { columns }
      }]
    };
  }

  function missingLocationType(): ParseResult<Job | Salesman> {
    console.error('[FileParser] Missing location in dataset:', {
      columns
    });
    return {
      data: [],
      type: 'missingLocation',
      skippedRows: 0,
      errors: [{
        message: `Missing location in dataset.`,
        details: { columns }
      }]
    };
  }

  function missingRequiredSalesmanFieldsType(): ParseResult<Salesman> {
    const matches = findBestColumnMatch(columns, SALESMAN_COLUMN_MAPPINGS);
    const hasSalesmanRequiredFields = !!(matches.start_time && matches.end_time);
    
    const missingFields = [];
    if (!hasSalesmanRequiredFields) {
      if (!matches.start_time) missingFields.push('start_time');
      if (!matches.end_time) missingFields.push('end_time');
    }

    console.error('[FileParser] Missing required fields in Salesman dataset:', {
      missingFields,
      columnMatches: matches
    });

    return {
      data: [],
      type: 'missingRequiredSalesmanFields',
      skippedRows: 0,
      errors: [{
        message: `Missing required Salesman fields: ${missingFields.join(', ')}`,
        details: {
          missingFields,
          columnMatches: matches
        }
      }]
    };
  }

  function missingRequiredJobFieldsType(): ParseResult<Job | Salesman> {
    const matches = findBestColumnMatch(columns, JOB_COLUMN_MAPPINGS);
    const hasJobRequiredFields = !!(matches.entry_time && matches.exit_time && matches.duration_mins);
    
    const missingFields = [];
    if (!hasJobRequiredFields) {
      if (!matches.entry_time) missingFields.push('entry_time');
      if (!matches.exit_time) missingFields.push('exit_time');
      if (!matches.duration_mins) missingFields.push('duration_mins');
    }

    console.error('[FileParser] Missing required Job fields:', {
      missingFields,
      columnMatches: matches
    });

    return {
      data: [],
      type: 'missingRequiredJobFields',
      skippedRows: 0,
      errors: [{
        message: `Missing required Job fields: ${missingFields.join(', ')}`,
        details: {
          missingFields,
          columnMatches: matches
        }
      }]
    };
  }

  function noDataToParse(): ParseResult<Job | Salesman> {
    console.warn('[FileParser] No data to parse');
    return {
      data: [],
      type: 'unknown',
      skippedRows: 0,
      errors: [{
        message: 'No data to parse'
      }]
    };
  }
};

// Track ID counters for inference
let nextJobId = 1;
let nextSalesmanId = 101;

export function parseTimesFromDescription(description: string): { entry_time?: string; exit_time?: string } {
  const result: { entry_time?: string; exit_time?: string } = {};
  
  const exitMatch = description.match(/Entrada:\s*Fecha:\s*(\d{2}-\d{2}-\d{4}\s+\d{2}:\d{2})/);
  if (exitMatch) {
    result.exit_time = exitMatch[1];
  }

  const entryMatch = description.match(/Salida:\s*Hora de salida:\s*(\d{2}:\d{2})/);
  if (entryMatch) {
    const date = exitMatch ? exitMatch[1].split(' ')[0] : new Date().toISOString().split('T')[0];
    result.entry_time = `${date} ${entryMatch[1]}`;
  }
  
  return result;
}

function parseJobRow(row: any, matchResult: MatchResult, rowIndex: number): Job {
  const { columnMatches } = matchResult;
  
  try {
    console.log(`[FileParser] Parsing job row ${rowIndex + 1}:`, {
      row,
      columnMatches
    });

    // Handle missing data
    const defaults = handleMissingJobData(row, columnMatches);
    
    // Build location from available data
    const location = buildLocation(row, columnMatches);
    let date = defaults.date || formatDateTime(row[columnMatches.date]);

    // Try to get times from description if available
    let { entry_time, exit_time } = getEntryAndExitTime(defaults, date);

    const job: Job = {
      job_id: defaults.job_id || String(row[columnMatches.job_id]),
      client_name: String(row[columnMatches.client_name]),
      date,
      location,
      duration_mins: defaults.duration_mins || parseDuration(),
      entry_time,
      exit_time
    };

    validateRequiredFields(job, rowIndex);
    return job;
  } catch (error) {
    throw new Error(`Row ${rowIndex + 1}: ${error instanceof Error ? error.message : 'Invalid data'}`);
  }

  function parseDuration(): number {
    const durationValue = row[columnMatches.duration_mins];
    
    // If it's already a number, return it
    if (typeof durationValue === 'number') {
      return durationValue;
    }
    
    // If it's a string that's just a number, parse it
    if (/^\d+$/.test(durationValue)) {
      return parseInt(durationValue);
    }
    
    // Handle time format (e.g., "2h:00m" or "1h:30m")
    const timeMatch = durationValue.match(/(\d+)h:(\d+)m/);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      return (hours * 60) + minutes;
    }
    
    // If we can't parse it, throw an error
    throw new Error(`Invalid duration format: ${durationValue}`);
  }

  function getEntryAndExitTime(defaults: Partial<Job>, date: string) {
    let entry_time = defaults.entry_time || formatDateTime(row[columnMatches.entry_time]);
    let exit_time = defaults.exit_time || formatDateTime(row[columnMatches.exit_time]);

    if (row[columnMatches.description]) {
      const timesFromDesc = parseTimesFromDescription(row[columnMatches.description]);
      if (timesFromDesc.entry_time) entry_time = formatDateTime(timesFromDesc.entry_time);
      if (timesFromDesc.exit_time) exit_time = formatDateTime(timesFromDesc.exit_time);
    }

    // Ensure entry_time uses the same date as the job
    const newDate = date.split(' ')[0];
    if (entry_time) {
      const time = entry_time.split(' ')[1];
      entry_time = `${newDate} ${time}`;
    }
    if (exit_time) {
      const time = exit_time.split(' ')[1];
      exit_time = `${newDate} ${time}`;

      // If exit is before entry, set exit to end of day
      if (entry_time && exit_time < entry_time) {
        exit_time = `${newDate} 23:59:00`;
      }
    }
    return { entry_time, exit_time };
  }
}

function parseSalesmanRow(row: any, matchResult: MatchResult, rowIndex: number): Salesman {
  const { columnMatches } = matchResult;
  
  try {
    console.debug(`[FileParser] Parsing salesman row ${rowIndex + 1}:`, {
      row,
      columnMatches
    });

    // Handle missing data
    const defaults = handleMissingSalesmanData(row, columnMatches);
    
    // Build location from available data
    const location = buildLocation(row, columnMatches);

    const salesman: Salesman = {
      salesman_id: defaults.salesman_id || String(row[columnMatches.salesman_id]),
      salesman_name: String(row[columnMatches.salesman_name]),
      location,
      start_time: defaults.start_time || formatDateTime(row[columnMatches.start_time]),
      end_time: defaults.end_time || formatDateTime(row[columnMatches.end_time])
    };

    validateRequiredFields(salesman, rowIndex);
    return salesman;
  } catch (error) {
    throw new Error(`Row ${rowIndex + 1}: ${error instanceof Error ? error.message : 'Invalid data'}`);
  }
}

function validateRequiredFields<T>(obj: T, rowIndex: number): void {
  console.debug(`[FileParser] Validating fields for row ${rowIndex + 1}:`, obj);

  for (const [key, value] of Object.entries(obj)) {
    // Special handling for location validation
    if (key === 'location') {
      const location = value as Location;
      if (!location.address && (!location.latitude || !location.longitude)) {
        console.error(`[FileParser] Invalid location in row ${rowIndex + 1}:`, {
          location
        });
        throw new Error('Location must have either an address or valid coordinates');
      }
      continue;
    }

    // Regular field validation
    if (value === undefined || value === null || value === '') {
      console.error(`[FileParser] Missing required field in row ${rowIndex + 1}:`, {
        field: key,
        value
      });
      throw new Error(`Missing required field ${key}`);
    }
  }
}

// Export parseDuration for testing
export function parseDurationValue(durationValue: any): number {
  // If it's already a number, return it
  if (typeof durationValue === 'number') {
    return durationValue;
  }
  
  // If it's a string that's just a number, parse it
  if (/^\d+$/.test(durationValue)) {
    return parseInt(durationValue);
  }
  
  // Handle time format (e.g., "2h:00m" or "1h:30m")
  const timeMatch = durationValue.match(/(\d+)h:(\d+)m/);
  if (timeMatch) {
    const hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    return (hours * 60) + minutes;
  }
  
  // If we can't parse it, throw an error
  throw new Error(`Invalid duration format: ${durationValue}`);
}
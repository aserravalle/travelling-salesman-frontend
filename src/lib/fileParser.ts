import { Job, Salesman, Location } from '@/types/types';
import { ColumnMatch, matchColumns, type DatasetType, type MatchResult } from './columnMatcher';
import { formatDateTime } from './formatDateTime';

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
export const parseFile = (rawData: any[]): ParseResult<Job | Salesman> => {
  console.log('[FileParser] Starting data parsing:', {
    rowCount: rawData.length,
    firstRow: rawData[0]
  });

  if (!rawData.length) { return noDataToParse() };

  const matchResult = matchColumnsInData(rawData[0]);

  const errors: ParseError[] = [];
  const parsedData: (Job | Salesman)[] = [];
  let skippedRows = 0;

  if (matchResult.type === 'unknown') { return unknownDataSetType() }
  if (matchResult.type === 'missingLocation') { return missingLocationType() }
  if (matchResult.type === 'missingRequiredJobFields') { return missingRequiredJobFieldsType() }
  if (matchResult.type === 'missingRequiredSalesmanFields') { return missingRequiredSalesmanFieldsType() }

  const parseRow = matchResult.type === 'job' ? parseJobRow : parseSalesmanRow;

  for (let i = 0; i < rawData.length; i++) {
    try {
      const row = rawData[i];
      console.debug(`[FileParser] Processing row ${i + 1}:`, row);
      
      const parsedRow = parseRow(row, matchResult, i);
      parsedData.push(parsedRow);
      console.debug(`[FileParser] Successfully parsed ${matchResult.type}:`, parsedRow);
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
    type: matchResult.type,
    totalRows: rawData.length,
    parsedRows: parsedData.length,
    skippedRows,
    errorCount: errors.length
  });

  return {
    data: parsedData as any[],
    type: matchResult.type,
    skippedRows,
    errors
  };

  function matchColumnsInData(headerRow: any) {
    const columns = Object.keys(headerRow);
    console.debug('[FileParser] Detected columns:', columns);

    const matchResult = matchColumns(columns);
    console.debug('[FileParser] Column matching result:', {
      type: matchResult.type,
      matches: matchResult.columnMatches
    });
    return matchResult;
  }

  function unknownDataSetType(): ParseResult<Job | Salesman> {
    console.error('[FileParser] Unable to identify dataset type:', {
      requiredColumns: Object.keys(matchResult.columnMatches)
    });
    return {
      data: [],
      type: 'unknown',
      skippedRows: 0,
      errors: [{
        message: `Unable to identify dataset type.`,
        details: matchResult
      }]
    };
  }

  function missingLocationType(): ParseResult<Job | Salesman> {
    console.error('[FileParser] Missing location in dataset:', {
      requiredColumns: Object.keys(matchResult.columnMatches)
    });
    return {
      data: [],
      type: 'missingLocation',
      skippedRows: 0,
      errors: [{
        message: `Missing location in dataset.`,
        details: matchResult
      }]
    };
  }

  function missingRequiredSalesmanFieldsType(): ParseResult<Salesman> {
    const hasSalesmanRequiredFields = !!(matchResult.columnMatches.start_time && matchResult.columnMatches.end_time);
    
    const missingFields = [];
    if (!hasSalesmanRequiredFields) {
      if (!matchResult.columnMatches.start_time) missingFields.push('start_time');
      if (!matchResult.columnMatches.end_time) missingFields.push('end_time');
    }

    console.error('[FileParser] Missing required fields in Salesman dataset:', {
      missingFields,
      columnMatches: matchResult.columnMatches
    });

    return {
      data: [],
      type: 'missingRequiredSalesmanFields',
      skippedRows: 0,
      errors: [{
        message: `Missing required Salesman fields: ${missingFields.join(', ')}`,
        details: {
          missingFields,
          columnMatches: matchResult.columnMatches
        }
      }]
    };
  }

  function missingRequiredJobFieldsType(): ParseResult<Job | Salesman> {
    const hasJobRequiredFields = !!(matchResult.columnMatches.entry_time && matchResult.columnMatches.exit_time && matchResult.columnMatches.duration_mins);
    
    const missingFields = [];
    if (!hasJobRequiredFields) {
      if (!matchResult.columnMatches.entry_time) missingFields.push('entry_time');
      if (!matchResult.columnMatches.exit_time) missingFields.push('exit_time');
      if (!matchResult.columnMatches.duration_mins) missingFields.push('duration_mins');
    }

    console.error('[FileParser] Missing required Job fields:', {
      missingFields,
      columnMatches: matchResult.columnMatches
    });

    return {
      data: [],
      type: 'missingRequiredJobFields',
      skippedRows: 0,
      errors: [{
        message: `Missing required Job fields: ${missingFields.join(', ')}`,
        details: {
          missingFields,
          columnMatches: matchResult.columnMatches
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


function parseJobRow(row: any, matchResult: MatchResult, rowIndex: number): Job {
  const { columnMatches } = matchResult;
  
  try {
    console.debug(`[FileParser] Parsing job row ${rowIndex + 1}:`, {
      row,
      columnMatches
    });

    const location = parseLocation(columnMatches, row, rowIndex);

    const duration = parseInt(row[columnMatches.duration_mins]);
    if (isNaN(duration)) {
      console.error(`[FileParser] Invalid duration in row ${rowIndex + 1}:`, {
        duration,
        raw: row[columnMatches.duration_mins]
      });
      throw new Error('Invalid duration');
    }

    const job: Job = {
      job_id: String(row[columnMatches.job_id]),
      client_name: String(row[columnMatches.client_name]),
      date: formatDateTime(row[columnMatches.date]),
      location,
      duration_mins: duration,
      entry_time: formatDateTime(row[columnMatches.entry_time]),
      exit_time: formatDateTime(row[columnMatches.exit_time])
    };

    validateRequiredFields(job, rowIndex);
    return job;
  } catch (error) {
    console.error(`[FileParser] Error parsing job row ${rowIndex + 1}:`, {
      row,
      error
    });
    throw new Error(`Row ${rowIndex + 1}: ${error instanceof Error ? error.message : 'Invalid data'}`);
  }
}

function parseSalesmanRow(row: any, matchResult: MatchResult, rowIndex: number): Salesman {
  const { columnMatches } = matchResult;
  
  try {
    console.debug(`[FileParser] Parsing salesman row ${rowIndex + 1}:`, {
      row,
      columnMatches
    });

    const location = parseLocation(columnMatches, row, rowIndex);

    const salesman: Salesman = {
      salesman_id: String(row[columnMatches.salesman_id]),
      salesman_name: String(row[columnMatches.salesman_name]),
      location,
      start_time: formatDateTime(row[columnMatches.start_time]),
      end_time: formatDateTime(row[columnMatches.end_time])
    };

    validateRequiredFields(salesman, rowIndex);
    return salesman;
  } catch (error) {
    console.error(`[FileParser] Error parsing salesman row ${rowIndex + 1}:`, {
      row,
      error
    });
    throw new Error(`Row ${rowIndex + 1}: ${error instanceof Error ? error.message : 'Invalid data'}`);
  }
}

function parseLocation(columnMatches: ColumnMatch, row: any, rowIndex: number): Location {
  // Helper function to check if a column exists and has a value
  const hasValue = (colName: string) => colName && row[colName];

  // Parse coordinates if both are available
  if (hasValue(columnMatches.latitude) && hasValue(columnMatches.longitude)) {
    const latitude = parseFloat(row[columnMatches.latitude]);
    const longitude = parseFloat(row[columnMatches.longitude]);

    if (!isNaN(latitude) && !isNaN(longitude)) {
      // If we have valid coordinates, return location with coordinates
      const location: Location = { latitude, longitude };
      
      // Optionally add address if available
      if (hasValue(columnMatches.address)) {
        location.address = row[columnMatches.address];
      }
      
      return location;
    } else if (!hasValue(columnMatches.address)) {
      console.error(`[FileParser] Invalid coordinates in row ${rowIndex + 1}:`, {
        latitude,
        longitude,
        rawLat: row[columnMatches.latitude],
        rawLng: row[columnMatches.longitude]
      });
    }
  }

  // If we have an address but no valid coordinates, return address-only location
  if (hasValue(columnMatches.address)) {
    return { address: row[columnMatches.address] };
  }

  // If we get here, we have no valid location data
  throw new Error(`No valid location data found in row ${rowIndex + 1}`);
}

function validateRequiredFields<T>(obj: T, rowIndex: number): void {
  console.debug(`[FileParser] Validating fields for row ${rowIndex + 1}:`, obj);

  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null || value === '') {
      console.error(`[FileParser] Missing required field in row ${rowIndex + 1}:`, {
        field: key,
        value
      });
      throw new Error(`Row ${rowIndex + 1}: Missing required field ${key}`);
    }
  }
}
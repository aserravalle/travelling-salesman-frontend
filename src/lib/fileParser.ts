import { Job, Salesman, JobTableRow, RosterResponse } from '@/types/types';
import { matchColumns, type DatasetType, type MatchResult } from './columnMatcher';
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

  if (!rawData.length) {
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

  const columns = Object.keys(rawData[0]);
  console.log('[FileParser] Detected columns:', columns);

  const matchResult = matchColumns(columns);
  console.log('[FileParser] Column matching result:', {
    type: matchResult.type,
    matches: matchResult.columnMatches
  });

  const errors: ParseError[] = [];
  const parsedData: (Job | Salesman)[] = [];
  let skippedRows = 0;

  if (matchResult.type === 'unknown') {
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

  for (let i = 0; i < rawData.length; i++) {
    try {
      const row = rawData[i];
      console.debug(`[FileParser] Processing row ${i + 1}:`, row);
      
      if (matchResult.type === 'job') {
        const job = parseJobRow(row, matchResult, i);
        parsedData.push(job);
        console.debug(`[FileParser] Successfully parsed job:`, job);
      } else {
        const salesman = parseSalesmanRow(row, matchResult, i);
        parsedData.push(salesman);
        console.debug(`[FileParser] Successfully parsed salesman:`, salesman);
      }
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
};

function parseJobRow(row: any, matchResult: MatchResult, rowIndex: number): Job {
  const { columnMatches } = matchResult;
  
  try {
    console.debug(`[FileParser] Parsing job row ${rowIndex + 1}:`, {
      row,
      columnMatches
    });

    const latitude = parseFloat(row[columnMatches.latitude]);
    const longitude = parseFloat(row[columnMatches.longitude]);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      console.error(`[FileParser] Invalid coordinates in row ${rowIndex + 1}:`, {
        latitude,
        longitude,
        rawLat: row[columnMatches.latitude],
        rawLng: row[columnMatches.longitude]
      });
      throw new Error('Invalid location coordinates');
    }

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
      date: formatDateTime(row[columnMatches.date]),
      location: [latitude, longitude],
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

    const latitude = parseFloat(row[columnMatches.home_latitude]);
    const longitude = parseFloat(row[columnMatches.home_longitude]);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      console.error(`[FileParser] Invalid home coordinates in row ${rowIndex + 1}:`, {
        latitude,
        longitude,
        rawLat: row[columnMatches.home_latitude],
        rawLng: row[columnMatches.home_longitude]
      });
      throw new Error('Invalid home location coordinates');
    }

    const salesman: Salesman = {
      salesman_id: String(row[columnMatches.salesman_id]),
      home_location: [latitude, longitude],
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

// Convert assignment response to table rows
export const convertResponseToTableRows = (response: RosterResponse): JobTableRow[] => {
  console.log('[FileParser] Converting response to table rows:', response);
  
  const rows: JobTableRow[] = [];
  
  // Process assigned jobs
  Object.entries(response.jobs).forEach(([salesman_id, jobs]) => {
    jobs.forEach(job => {
      rows.push({
        job_id: job.job_id,
        date: job.date,
        latitude: job.location[0],
        longitude: job.location[1],
        duration_mins: job.duration_mins,
        entry_time: job.entry_time,
        exit_time: job.exit_time,
        assignment_status: 'Assigned',
        salesman_id: salesman_id,
        start_time: job.start_time,
      });
    });
  });
  
  // Process unassigned jobs
  response.unassigned_jobs.forEach(job => {
    rows.push({
      job_id: job.job_id,
      date: job.date,
      latitude: job.location[0],
      longitude: job.location[1],
      duration_mins: job.duration_mins,
      entry_time: job.entry_time,
      exit_time: job.exit_time,
      assignment_status: 'Unassigned',
      salesman_id: null,
      start_time: null,
    });
  });

  console.log('[FileParser] Conversion complete:', {
    totalRows: rows.length,
    assignedJobs: rows.filter(r => r.assignment_status === 'Assigned').length,
    unassignedJobs: rows.filter(r => r.assignment_status === 'Unassigned').length
  });
  
  return rows;
};

// Convert table data to CSV
export const exportTableToCSV = (rows: any[]): string => {
  console.log('[FileParser] Exporting table data to CSV:', {
    rowCount: rows.length
  });
  return Papa.unparse(rows);
};

// Download data as CSV file
export const downloadCSV = (data: string, filename: string): void => {
  console.log('[FileParser] Downloading CSV file:', {
    filename,
    dataSize: data.length
  });

  const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
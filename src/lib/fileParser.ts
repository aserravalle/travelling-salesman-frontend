import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Job, Salesman, JobTableRow } from '@/types/types';
import { RosterResponse } from "@/types/roster";
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

export interface ReadResult {
  data: any[];
  fileName: string;
  errors: ParseError[];
  debug?: any; // For additional debug information
}

interface ReadFileResult {
  rawData: any[];
  errors: ParseError[];
  debug: any;
}

async function tryReadCsv(file: File): Promise<ReadFileResult> {
  console.log('[FileParser] Processing CSV file');
  const result = await new Promise<Papa.ParseResult<any>>((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        console.log('[FileParser] CSV parsing complete:', {
          rowCount: results.data.length,
          fields: results.meta.fields,
          errors: results.errors
        });
        resolve(results);
      },
      error: (error) => {
        console.error('[FileParser] CSV parsing error:', error);
        reject(error);
      }
    });
  });

  const errors = result.errors.map(err => ({
    row: err.row,
    message: err.message,
    details: err
  }));

  return {
    rawData: result.data,
    errors,
    debug: { csvMeta: result.meta }
  };
}

async function tryReadExcel(file: File): Promise<ReadFileResult> {
  console.log('[FileParser] Processing Excel file');
  const data = await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
    reader.onerror = (e) => {
      console.error('[FileParser] Excel file read error:', e);
      reject(e);
    };
    reader.readAsArrayBuffer(file);
  });

  const workbook = XLSX.read(data, { type: 'array' });
  console.log('[FileParser] Excel workbook loaded:', {
    sheets: workbook.SheetNames,
    props: workbook.Props
  });

  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const debug = {
    sheetName: workbook.SheetNames[0],
    range: worksheet['!ref'],
    dimensions: worksheet['!dimensions']
  };

  const rawData = XLSX.utils.sheet_to_json(worksheet);
  console.log('[FileParser] Excel data converted to JSON:', {
    rowCount: rawData.length,
    sampleRow: rawData[0]
  });

  return {
    rawData,
    errors: [],
    debug
  };
}

// Read file and return raw data
export const readFile = async (file: File): Promise<ReadResult> => {
  console.log(`[FileParser] Reading file: ${file.name} (${file.type}, ${file.size} bytes)`);
  
  try {
    let result: ReadFileResult;

    if (file.name.endsWith('.csv')) {
      result = await tryReadCsv(file);
    } 
    else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      result = await tryReadExcel(file);
    } 
    else {
      const error = new Error('Unsupported file format');
      console.error('[FileParser] Unsupported format:', file.type);
      throw error;
    }

    // Filter out empty rows
    const validRows = result.rawData.filter(row => {
      const hasValues = Object.values(row).some(value => 
        value !== null && value !== undefined && value !== ''
      );
      if (!hasValues) {
        console.debug('[FileParser] Skipping empty row:', row);
      }
      return hasValues;
    });

    const skippedRows = result.rawData.length - validRows.length;
    if (skippedRows > 0) {
      console.warn(`[FileParser] Skipped ${skippedRows} empty rows`);
      result.errors.push({
        message: `${skippedRows} empty row${skippedRows > 1 ? 's were' : ' was'} skipped`,
        details: { skippedRows }
      });
    }

    console.log('[FileParser] File processing complete:', {
      fileName: file.name,
      totalRows: result.rawData.length,
      validRows: validRows.length,
      skippedRows,
      errorCount: result.errors.length
    });

    return {
      data: validRows,
      fileName: file.name,
      errors: result.errors,
      debug: result.debug
    };
  } catch (error) {
    console.error('[FileParser] File processing error:', {
      fileName: file.name,
      error
    });

    return {
      data: [],
      fileName: file.name,
      errors: [{
        message: error instanceof Error ? error.message : 'Unknown error occurred while reading file',
        details: error
      }]
    };
  }
};

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
    score: matchResult.job_score,
    matches: matchResult.columnMatches
  });

  const errors: ParseError[] = [];
  const parsedData: (Job | Salesman)[] = [];
  let skippedRows = 0;

  if (matchResult.type === 'unknown' || matchResult.job_score < 0.5) {
    console.error('[FileParser] Unable to identify dataset type:', {
      score: matchResult.job_score,
      requiredColumns: matchResult.type === 'job' ? 
        Object.keys(matchResult.columnMatches) : 
        Object.keys(matchResult.columnMatches)
    });

    return {
      data: [],
      type: 'unknown',
      skippedRows: 0,
      errors: [{
        message: `Unable to identify dataset type. Match score: ${matchResult.job_score}`,
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
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Job, Salesman, RosterResponse, JobTableRow } from '@/types';
import { format, parse as parseDate, isValid } from 'date-fns';
import { matchColumns, type DatasetType, type MatchResult } from './columnMatcher';

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

// Read file and return raw data
export const readFile = async (file: File): Promise<ReadResult> => {
  console.log(`[FileParser] Reading file: ${file.name} (${file.type}, ${file.size} bytes)`);
  
  try {
    let rawData: any[] = [];
    let errors: ParseError[] = [];
    let debug: any = {};

    if (file.name.endsWith('.csv')) {
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

      rawData = result.data;
      debug.csvMeta = result.meta;
      
      if (result.errors.length > 0) {
        console.warn('[FileParser] CSV parse errors:', result.errors);
        errors = result.errors.map(err => ({
          row: err.row,
          message: err.message,
          details: err
        }));
      }
    } 
    else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
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
      debug.excelMeta = {
        sheetName: workbook.SheetNames[0],
        range: worksheet['!ref'],
        dimensions: worksheet['!dimensions']
      };

      rawData = XLSX.utils.sheet_to_json(worksheet);
      console.log('[FileParser] Excel data converted to JSON:', {
        rowCount: rawData.length,
        sampleRow: rawData[0]
      });
    } 
    else {
      const error = new Error('Unsupported file format');
      console.error('[FileParser] Unsupported format:', file.type);
      throw error;
    }

    // Filter out empty rows
    const validRows = rawData.filter(row => {
      const hasValues = Object.values(row).some(value => 
        value !== null && value !== undefined && value !== ''
      );
      if (!hasValues) {
        console.debug('[FileParser] Skipping empty row:', row);
      }
      return hasValues;
    });

    const skippedRows = rawData.length - validRows.length;
    if (skippedRows > 0) {
      console.warn(`[FileParser] Skipped ${skippedRows} empty rows`);
      errors.push({
        message: `${skippedRows} empty row${skippedRows > 1 ? 's were' : ' was'} skipped`,
        details: { skippedRows }
      });
    }

    console.log('[FileParser] File processing complete:', {
      fileName: file.name,
      totalRows: rawData.length,
      validRows: validRows.length,
      skippedRows,
      errorCount: errors.length
    });

    return {
      data: validRows,
      fileName: file.name,
      errors,
      debug
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
    score: matchResult.score,
    matches: matchResult.columnMatches
  });

  const errors: ParseError[] = [];
  const parsedData: (Job | Salesman)[] = [];
  let skippedRows = 0;

  if (matchResult.type === 'unknown' || matchResult.score < 0.5) {
    console.error('[FileParser] Unable to identify dataset type:', {
      score: matchResult.score,
      requiredColumns: matchResult.type === 'job' ? 
        Object.keys(matchResult.columnMatches) : 
        Object.keys(matchResult.columnMatches)
    });

    return {
      data: [],
      type: 'unknown',
      skippedRows: 0,
      errors: [{
        message: `Unable to identify dataset type. Match score: ${matchResult.score}`,
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

function formatDateTime(value: any): string {
  console.debug('[FileParser] Formatting date/time value:', value);

  if (!value) {
    console.error('[FileParser] Missing date/time value');
    throw new Error('Date/time value is missing');
  }

  try {
    // Handle different date formats
    let parsedDate: Date;

    // If value is already a Date object
    if (value instanceof Date) {
      parsedDate = value;
    }
    // If value is a number (timestamp)
    else if (typeof value === 'number') {
      parsedDate = new Date(value);
    }
    // If value is a string
    else {
      const dateStr = String(value).trim();
      
      // Try ISO format first
      if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
        parsedDate = new Date(dateStr);
      }
      // Try dd-MM-yyyy HH:mm format
      else {
        parsedDate = parseDate(dateStr, 'dd-MM-yyyy HH:mm', new Date());
      }
    }

    // Validate the parsed date
    if (!isValid(parsedDate)) {
      console.error('[FileParser] Invalid date:', {
        input: value,
        parsed: parsedDate
      });
      throw new Error('Invalid date');
    }

    const formatted = format(parsedDate, 'yyyy-MM-dd HH:mm:ss');
    console.debug('[FileParser] Date formatted successfully:', {
      input: value,
      parsed: parsedDate,
      formatted
    });

    return formatted;
  } catch (error) {
    console.error('[FileParser] Error formatting date/time:', {
      value,
      error
    });
    throw new Error('Invalid date/time format');
  }
}

// Format date for display
export const formatDisplayDate = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (!isValid(date)) return '';
    return format(date, 'dd MMMM yyyy');
  } catch (error) {
    console.error('[FileParser] Error formatting display date:', {
      dateString,
      error
    });
    return '';
  }
};

// Format time for display
export const formatDisplayTime = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (!isValid(date)) return '';
    return format(date, 'HH:mm');
  } catch (error) {
    console.error('[FileParser] Error formatting display time:', {
      dateString,
      error
    });
    return '';
  }
};

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
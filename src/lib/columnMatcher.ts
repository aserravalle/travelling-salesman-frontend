import { JOB_FILE_NAMES, SALESMAN_FILE_NAMES } from "./columnMappings/fileNameMappings";
import { JOB_COLUMN_MAPPINGS } from "./columnMappings/jobMappings";
import { SALESMAN_COLUMN_MAPPINGS } from "./columnMappings/salesmanMappings";

export type DatasetType = 'job' | 'salesman' | 'unknown';
export type ColumnMatch = { [key: string]: string };

export interface MatchResult {
  type: DatasetType;
  columnMatches: ColumnMatch;
}

// returns true if there is a direct match in columnMappings.ts
function hasMatchingColumn(columnName: string, possibleNames: string[]): boolean {
  const normalizedColumn = columnName.toLowerCase().replace(/[^a-z0-9]/g, '');
  return possibleNames.some(name => 
    normalizedColumn === name.toLowerCase().replace(/[^a-z0-9]/g, '')
  );
}

function findBestColumnMatch(columns: string[], mappings: { [key: string]: string[] }): ColumnMatch {
  const matches: ColumnMatch = {};
  
  for (const [targetField, possibleNames] of Object.entries(mappings)) {
    const matchedColumn = columns.find(col => hasMatchingColumn(col, possibleNames));
    if (matchedColumn) {
      matches[targetField] = matchedColumn;
    }
  }
  
  return matches;
}

// Determines dataset type based on file name and basic column checks
export function determineDatasetType(columns: string[], fileName: string): DatasetType {
  // Normalize filename by removing diacritics and converting to lowercase
  const normalizedFileName = fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  if (JOB_FILE_NAMES.some(name => normalizedFileName.includes(name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()))) {
    console.log('[ColumnMatcher] Job file name detected', fileName);
    return 'job';
  }
  if (SALESMAN_FILE_NAMES.some(name => normalizedFileName.includes(name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()))) {
    console.log('[ColumnMatcher] Salesman file name detected', fileName);
    return 'salesman';
  }

  // If we can't determine by filename, check by column matching
  return determineDatasetTypeByColumnMatching(columns);
}

// Determines dataset type by checking required fields and IDs
export function determineDatasetTypeByColumnMatching(columns: string[]): DatasetType {
  // empty column list
  if (columns.length === 0) { return 'unknown' }
  
  const matches = findBestColumnMatch(columns, { 
    ...JOB_COLUMN_MAPPINGS,
    ...SALESMAN_COLUMN_MAPPINGS 
  });

  // If missing both types of required fields, it's unknown
  const hasSalesmanRequiredFields = !!(matches.start_time && matches.end_time);
  const hasJobRequiredFields = !!(matches.entry_time && matches.exit_time && matches.duration_mins);

  // If we have the required fields, return the dataset type
  if (hasJobRequiredFields && !hasSalesmanRequiredFields) {
    console.log('[ColumnMatcher] Job columns detected');
    return 'job';
  }
  if (!hasJobRequiredFields && hasSalesmanRequiredFields) {
    console.log('[ColumnMatcher] Salesman columns detected');
    return 'salesman';
  }

  // If we have both fields, use ID
  const hasJobId = !!matches.job_id;
  const hasSalesmanId = !!matches.salesman_id;
  if (hasJobId && !hasSalesmanId) return 'job';
  if (!hasJobId && hasSalesmanId) return 'salesman';

  // else unknown
  return 'unknown';
}

// match list of columns from data to the correct data type
export function matchColumns(columns: string[], type: DatasetType): MatchResult {
  const mappings = type === 'job' ? JOB_COLUMN_MAPPINGS : type === 'salesman' ? SALESMAN_COLUMN_MAPPINGS : {};
  const matches = findBestColumnMatch(columns, mappings);
  
  return { 
    type, 
    columnMatches: matches
  };
}
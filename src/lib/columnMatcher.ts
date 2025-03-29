import { 
  JOB_COLUMN_MAPPINGS, 
  SALESMAN_COLUMN_MAPPINGS, 
  LOCATION_COLUMN_MAPPINGS,
  JOB_FILE_NAMES,
  SALESMAN_FILE_NAMES
} from './columnMappings';

export type DatasetType = 'job' | 'salesman' | 'unknown' | 'missingLocation' | 'missingRequiredJobFields' | 'missingRequiredSalesmanFields';
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

// returns a direct match in columnMappings.ts
export function findBestColumnMatch(columns: string[], mappings: { [key: string]: string[] }): ColumnMatch {
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
export function determineDatasetType(columns: string[], fileName?: string): DatasetType {
  // empty column list
  if (columns.length === 0) { return 'unknown' }

  // Check file name if provided
  if (fileName) {
    const normalizedFileName = fileName.toLowerCase();
    if (JOB_FILE_NAMES.some(name => normalizedFileName.includes(name))) {
      return 'job';
    }
    if (SALESMAN_FILE_NAMES.some(name => normalizedFileName.includes(name))) {
      return 'salesman';
    }
  }

  // Cant be missing location
  const locationMatches = findBestColumnMatch(columns, LOCATION_COLUMN_MAPPINGS);
  const hasAddress = !!locationMatches.address;
  const hasCoordinates = !!(locationMatches.latitude && locationMatches.longitude);
  if (!(hasAddress || hasCoordinates)) { return 'missingLocation' }

  // If still unknown, check by column matching
  return determineDatasetTypeByColumnMatching(columns);
}

// Determines dataset type by checking required fields and IDs
export function determineDatasetTypeByColumnMatching(columns: string[]): DatasetType {
  const matches = findBestColumnMatch(columns, { 
    ...JOB_COLUMN_MAPPINGS,
    ...SALESMAN_COLUMN_MAPPINGS 
  });

  // If missing both types of required fields, it's unknown
  const hasSalesmanRequiredFields = !!(matches.start_time && matches.end_time);
  const hasJobRequiredFields = !!(matches.entry_time && matches.exit_time && matches.duration_mins);
  if (!hasSalesmanRequiredFields && !hasJobRequiredFields) { return 'unknown' }

  // If we have the required fields, return the dataset type
  if (hasJobRequiredFields && !hasSalesmanRequiredFields) return 'job';
  if (!hasJobRequiredFields && hasSalesmanRequiredFields) return 'salesman';

  // If we have both fields, use ID
  const hasJobId = !!matches.job_id;
  const hasSalesmanId = !!matches.salesman_id;
  if (hasJobId) {
    if (hasJobRequiredFields) return 'job';
    else return 'missingRequiredJobFields';
  }
  if (hasSalesmanId) {
    if (hasSalesmanRequiredFields) return 'salesman';
    else return 'missingRequiredSalesmanFields';
  }

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
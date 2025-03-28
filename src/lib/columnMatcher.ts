import { 
  JOB_COLUMN_MAPPINGS, 
  SALESMAN_COLUMN_MAPPINGS, 
  LOCATION_COLUMN_MAPPINGS 
} from './columnMappings';

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

// returns a direct match in columnMappings.ts
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

// % of columns that are matched
function calculateMatchScore(columnMatches: ColumnMatch, requiredFields: string[]): number {
  const matchedRequiredFields = requiredFields.filter(field => field in columnMatches);
  return matchedRequiredFields.length / requiredFields.length;
}

export function determineDatasetType(columns: string[]): DatasetType {
  const matches = findBestColumnMatch(columns, { 
    ...JOB_COLUMN_MAPPINGS,
    ...SALESMAN_COLUMN_MAPPINGS 
  });

  // If missing location, it's unknown
  const hasAddress = !!matches.address;
  const hasLatLong = !!(matches.latitude && matches.longitude);
  const hasLocation = hasAddress || hasLatLong;
  if (!hasLocation) { return 'unknown' }

  // If missing both types of required fields, it's unknown
  const hasSalesmanRequiredFields = !!(matches.start_time && matches.end_time);
  const hasJobRequiredFields = !!(matches.entry_time && matches.exit_time && matches.duration_mins);
  if (!hasSalesmanRequiredFields && !hasJobRequiredFields) { return 'unknown' }

  // If only one ID type matches, that's the dataset type
  const hasJobId = !!matches.job_id;
  const hasSalesmanId = !!matches.salesman_id;
  if (hasJobId && hasJobRequiredFields) return 'job';
  if (hasSalesmanId && hasSalesmanRequiredFields) return 'salesman';

  // else unknown
  return 'unknown';
}

// match list of columns from data to the correct data type
export function matchColumns(columns: string[]): MatchResult {
  const matches = findBestColumnMatch(columns, { 
    ...JOB_COLUMN_MAPPINGS,
    ...SALESMAN_COLUMN_MAPPINGS 
  });
  
  const type = determineDatasetType(columns);
  
  return { 
    type, 
    columnMatches: matches
  };
}
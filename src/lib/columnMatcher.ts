import { 
  JOB_COLUMN_MAPPINGS, 
  SALESMAN_COLUMN_MAPPINGS, 
  LOCATION_COLUMN_MAPPINGS 
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

function determineDatasetType(columns: string[]): DatasetType {
  const matches = findBestColumnMatch(columns, { 
    ...JOB_COLUMN_MAPPINGS,
    ...SALESMAN_COLUMN_MAPPINGS 
  });

  // empty column list
  if (columns.length === 0) { return 'unknown' }

  // If missing location, it's unknown
  const hasAddress = !!matches.address;
  const hasLatLong = !!(matches.latitude && matches.longitude);
  const hasLocation = hasAddress || hasLatLong;
  if (!hasLocation) { return 'missingLocation' }

  // If missing both types of required fields, it's unknown
  const hasSalesmanRequiredFields = !!(matches.start_time && matches.end_time);
  const hasJobRequiredFields = !!(matches.entry_time && matches.exit_time && matches.duration_mins);

  // If only one ID type matches, that's the dataset type
  const hasJobId = !!matches.job_id;
  const hasSalesmanId = !!matches.salesman_id;
  if (hasJobId) {
    if (hasJobRequiredFields) return 'job';
    else return 'missingRequiredJobFields';
  }
  if (hasSalesmanId)
  {
    if (hasSalesmanRequiredFields) return 'salesman';
    else return 'missingRequiredSalesmanFields';
  }

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
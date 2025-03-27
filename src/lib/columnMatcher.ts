import { 
  JOB_COLUMN_MAPPINGS, 
  SALESMAN_COLUMN_MAPPINGS, 
  DATASET_IDENTIFIERS,
  LOCATION_COLUMN_MAPPINGS 
} from './columnMappings';

export type DatasetType = 'job' | 'salesman' | 'unknown';
export type ColumnMatch = { [key: string]: string };

export interface MatchResult {
  type: DatasetType;
  columnMatches: ColumnMatch;
  score: number;
}

function findMatchingColumn(columnName: string, possibleNames: string[]): boolean {
  const normalizedColumn = columnName.toLowerCase().replace(/[^a-z0-9]/g, '');
  return possibleNames.some(name => 
    normalizedColumn === name.toLowerCase().replace(/[^a-z0-9]/g, '')
  );
}

function findBestColumnMatch(columns: string[], mappings: { [key: string]: string[] }): ColumnMatch {
  const matches: ColumnMatch = {};
  
  for (const [targetField, possibleNames] of Object.entries(mappings)) {
    const matchedColumn = columns.find(col => findMatchingColumn(col, possibleNames));
    if (matchedColumn) {
      matches[targetField] = matchedColumn;
    }
  }
  
  return matches;
}

function calculateMatchScore(columnMatches: ColumnMatch, requiredFields: string[]): number {
  const matchedRequiredFields = requiredFields.filter(field => field in columnMatches);
  return matchedRequiredFields.length / requiredFields.length;
}

function identifyDatasetType(columns: string[]): DatasetType {
  const normalizedColumns = columns.map(col => col.toLowerCase());
  
  const jobScore = DATASET_IDENTIFIERS.job.filter(keyword => 
    normalizedColumns.some(col => col.includes(keyword))
  ).length;
  
  const salesmanScore = DATASET_IDENTIFIERS.salesman.filter(keyword => 
    normalizedColumns.some(col => col.includes(keyword))
  ).length;
  
  if (jobScore === salesmanScore) return 'unknown';
  return jobScore > salesmanScore ? 'job' : 'salesman';
}

export function matchColumns(columns: string[]): MatchResult {
  // First try to identify the type of dataset
  let type = identifyDatasetType(columns);
  
  // If type is unknown, try to determine by matching columns
  if (type === 'unknown') {
    const jobMatches = findBestColumnMatch(columns, {
      ...JOB_COLUMN_MAPPINGS,
      latitude: LOCATION_COLUMN_MAPPINGS.latitude,
      longitude: LOCATION_COLUMN_MAPPINGS.longitude
    });
    
    const salesmanMatches = findBestColumnMatch(columns, {
      ...SALESMAN_COLUMN_MAPPINGS,
      home_latitude: LOCATION_COLUMN_MAPPINGS.latitude,
      home_longitude: LOCATION_COLUMN_MAPPINGS.longitude
    });
    
    const jobScore = calculateMatchScore(jobMatches, Object.keys(JOB_COLUMN_MAPPINGS));
    const salesmanScore = calculateMatchScore(salesmanMatches, Object.keys(SALESMAN_COLUMN_MAPPINGS));
    
    if (jobScore > salesmanScore) {
      type = 'job';
      return { type, columnMatches: jobMatches, score: jobScore };
    } else if (salesmanScore > jobScore) {
      type = 'salesman';
      return { type, columnMatches: salesmanMatches, score: salesmanScore };
    }
    
    return { type: 'unknown', columnMatches: {}, score: 0 };
  }
  
  // If type is known, get the column matches
  const columnMatches = type === 'job' 
    ? findBestColumnMatch(columns, {
        ...JOB_COLUMN_MAPPINGS,
        latitude: LOCATION_COLUMN_MAPPINGS.latitude,
        longitude: LOCATION_COLUMN_MAPPINGS.longitude
      })
    : findBestColumnMatch(columns, {
        ...SALESMAN_COLUMN_MAPPINGS,
        home_latitude: LOCATION_COLUMN_MAPPINGS.latitude,
        home_longitude: LOCATION_COLUMN_MAPPINGS.longitude
      });
  
  const score = calculateMatchScore(
    columnMatches, 
    type === 'job' ? Object.keys(JOB_COLUMN_MAPPINGS) : Object.keys(SALESMAN_COLUMN_MAPPINGS)
  );
  
  return { type, columnMatches, score };
}
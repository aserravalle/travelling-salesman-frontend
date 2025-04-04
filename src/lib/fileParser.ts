import { Job, Salesman } from '@/types/types';
import { type DatasetType, determineDatasetType, matchColumns } from './columnMatcher';
import { RowParserFactory } from './rowParser/RowParserFactory';

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

  const columns = Object.keys(rawData[0]);
  console.debug('[FileParser] Detected columns:', columns);

  // Determine the dataset type using file name and basic checks
  let type = determineDatasetType(columns, fileName);
  const matchResult = matchColumns(Object.keys(rawData[0]), type);
  const rowParser = RowParserFactory.New(type, matchResult);

  const errors: ParseError[] = [];
  const parsedData: (Job | Salesman)[] = [];
  let skippedRows = 0;

  for (let i = 0; i < rawData.length; i++) {
    try {
      const row = rawData[i];
      console.debug(`[FileParser] Processing row ${i + 1}:`, row);
      const parsedRow = rowParser.parse(row);
      parsedData.push(parsedRow);
      console.debug(`[FileParser] Successfully parsed ${type}:`, parsedRow);
    } catch (error) {
      skippedRows++;
      console.error(`Row ${i + 1}: Error` , {
        row: rawData[i],
        error
    });

      errors.push({
        row: i + 1,
        message: `Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error parsing row'}`,
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
};

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
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface ReadError {
  row?: number;
  column?: string;
  message: string;
  details?: any; // For additional error context
}

export interface ReadResult {
  data: any[];
  fileName: string;
  errors: ReadError[];
  debug?: any; // For additional debug information
}

interface ReadFileResult {
  rawData: any[];
  errors: ReadError[];
  debug: any;
}

// Read file and return raw data
export const readFile = async (file: File): Promise<ReadResult> => {
  console.log(`[FileReader] Reading file: ${file.name} (${file.type}, ${file.size} bytes)`);

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
      console.error('[FileReader] Unsupported format:', file.type);
      throw error;
    }

    const validRows = postProcessingData(result.rawData, result.errors, file.name);

    return {
      data: validRows,
      fileName: file.name,
      errors: result.errors,
      debug: result.debug
    };
  } catch (error) {
    console.error('[FileReader] File processing error:', {
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
function postProcessingData(rawData: any[], errors: ReadError[], fileName: String) {
  // Filter out empty rows
  const validRows = rawData.filter(row => {
    const hasValues = Object.values(row).some(value => value !== null && value !== undefined && value !== ''
    );
    if (!hasValues) {
      console.debug('[FileReader] Skipping empty row:', row);
    }
    return hasValues;
  });

  const skippedRows = rawData.length - validRows.length;
  if (skippedRows > 0) {
    console.warn(`[FileReader] Skipped ${skippedRows} empty rows`);
    errors.push({
      message: `${skippedRows} empty row${skippedRows > 1 ? 's were' : ' was'} skipped`,
      details: { skippedRows }
    });
  }

  console.log('[FileReader] File processing complete:', {
    fileName: fileName,
    totalRows: rawData.length,
    validRows: validRows.length,
    skippedRows,
    errorCount: errors.length
  });
  return validRows;
}

async function tryReadCsv(file: File): Promise<ReadFileResult> {
  console.log('[FileReader] Processing CSV file');
  const result = await new Promise<Papa.ParseResult<any>>((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        console.log('[FileReader] CSV parsing complete:', {
          rowCount: results.data.length,
          fields: results.meta.fields,
          errors: results.errors
        });
        resolve(results);
      },
      error: (error) => {
        console.error('[FileReader] CSV parsing error:', error);
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
  console.log('[FileReader] Processing Excel file');
  const data = await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
    reader.onerror = (e) => {
      console.error('[FileReader] Excel file read error:', e);
      reject(e);
    };
    reader.readAsArrayBuffer(file);
  });

  const workbook = XLSX.read(data, { type: 'array' });
  console.log('[FileReader] Excel workbook loaded:', {
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
  console.log('[FileReader] Excel data converted to JSON:', {
    rowCount: rawData.length,
    sampleRow: rawData[0]
  });

  return {
    rawData,
    errors: [],
    debug
  };
}

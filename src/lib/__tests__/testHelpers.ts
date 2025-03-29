import fs from 'fs';
import Papa from 'papaparse';
import { readFile, ReadResult } from '../fileReader';

/**
 * Helper function to read and parse a CSV file for testing purposes.
 * This function handles the file reading and Papa Parse mocking internally.
 * 
 * @param filePath - Path to the CSV file to read
 * @param fileName - Optional filename to use in the File object (defaults to the last part of filePath)
 * @returns Promise<ReadResult> - The parsed file data and any errors
 */
export async function readFileForTest(filePath: string): Promise<ReadResult> {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const defaultFileName = filePath.split('/').pop() || 'test.csv';
  const mockFile = new File([fileContent], defaultFileName, { type: 'text/csv' });

  // Mock Papa Parse to use actual file content
  (Papa.parse as any).mockImplementation((file, config) => {
    const lines = fileContent.split('\n');
    const headers = lines[0].split(',');
    const data = lines.slice(1).map(line => {
      const values = line.split(',');
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index];
        return obj;
      }, {} as any);
    });
    config.complete({
      data,
      errors: [],
      meta: { fields: headers }
    });
  });

  const result = await readFile(mockFile);
  return result;
} 
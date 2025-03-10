import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Job, Salesman, JobTableRow } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { parse, format } from 'date-fns';

// Function to parse CSV files
export const parseCSV = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validRows = results.data.filter(row => {
          // Check if row is empty or all values are null/undefined
          const isEmpty = Object.values(row).every(value => 
            value === null || value === undefined || value === ''
          );
          return !isEmpty;
        });

        if (results.errors.length > 0) {
          const errorCount = results.errors.length;
          toast({
            title: "Warning",
            description: `${errorCount} line${errorCount > 1 ? 's' : ''} could not be read and were skipped`,
            variant: "destructive"
          });
        }

        resolve(validRows);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

// Function to parse Excel files
export const parseExcel = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Filter out empty rows
        const validRows = jsonData.filter(row => {
          return Object.values(row).some(value => 
            value !== null && value !== undefined && value !== ''
          );
        });

        if (jsonData.length > validRows.length) {
          const skippedRows = jsonData.length - validRows.length;
          toast({
            title: "Warning",
            description: `${skippedRows} empty row${skippedRows > 1 ? 's were' : ' was'} skipped`,
            variant: "destructive"
          });
        }

        resolve(validRows);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsBinaryString(file);
  });
};

// Process job data from parsed file
export const processJobData = (data: any[]): Job[] => {
  const validJobs: Job[] = [];
  let invalidCount = 0;

  data.forEach(item => {
    try {
      const job: Job = {
        job_id: String(item.job_id),
        date: format(parse(item.date, 'dd-MM-yyyy HH:mm', new Date()), 'yyyy-MM-dd HH:mm:ss'),
        location: [
          parseFloat(item.latitude || item.location_latitude || item.location?.[0] || 0),
          parseFloat(item.longitude || item.location_longitude || item.location?.[1] || 0)
        ],
        duration_mins: parseInt(item.duration_mins, 10),
        entry_time: format(parse(item.entry_time, 'dd-MM-yyyy HH:mm', new Date()), 'yyyy-MM-dd HH:mm:ss'),
        exit_time: format(parse(item.exit_time, 'dd-MM-yyyy HH:mm', new Date()), 'yyyy-MM-dd HH:mm:ss'),
      };

      // Validate required fields
      if (!job.job_id || isNaN(job.location[0]) || isNaN(job.location[1]) || 
          isNaN(job.duration_mins) || job.date === 'Invalid Date' || 
          job.entry_time === 'Invalid Date' || job.exit_time === 'Invalid Date') {
        throw new Error('Invalid job data');
      }

      validJobs.push(job);
    } catch (error) {
      invalidCount++;
    }
  });

  if (invalidCount > 0) {
    toast({
      title: "Warning",
      description: `${invalidCount} invalid job record${invalidCount > 1 ? 's were' : ' was'} skipped`,
      variant: "destructive"
    });
  }

  return validJobs;
};

// Process salesman data from parsed file
export const processSalesmanData = (data: any[]): Salesman[] => {
  const validSalesmen: Salesman[] = [];
  let invalidCount = 0;

  data.forEach(item => {
    try {
      const salesman: Salesman = {
        salesman_id: String(item.salesman_id),
        home_location: [
          parseFloat(item.home_latitude || item.home_location_latitude || item.home_location?.[0] || 0),
          parseFloat(item.home_longitude || item.home_location_longitude || item.home_location?.[1] || 0)
        ],
        start_time: format(parse(item.start_time, 'dd-MM-yyyy HH:mm', new Date()), 'yyyy-MM-dd HH:mm:ss'),
        end_time: format(parse(item.end_time, 'dd-MM-yyyy HH:mm', new Date()), 'yyyy-MM-dd HH:mm:ss'),
      };

      // Validate required fields
      if (!salesman.salesman_id || isNaN(salesman.home_location[0]) || 
          isNaN(salesman.home_location[1]) || salesman.start_time === 'Invalid Date' || 
          salesman.end_time === 'Invalid Date') {
        throw new Error('Invalid salesman data');
      }

      validSalesmen.push(salesman);
    } catch (error) {
      invalidCount++;
    }
  });

  if (invalidCount > 0) {
    toast({
      title: "Warning",
      description: `${invalidCount} invalid salesman record${invalidCount > 1 ? 's were' : ' was'} skipped`,
      variant: "destructive"
    });
  }

  return validSalesmen;
};

// Convert assignment response to table rows
export const convertResponseToTableRows = (response: any): JobTableRow[] => {
  const rows: JobTableRow[] = [];
  
  // Process assigned jobs
  Object.entries(response.jobs).forEach(([salesman_id, jobs]) => {
    (jobs as any[]).forEach(job => {
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
  
  return rows;
};

// Convert table data to CSV
export const exportTableToCSV = (rows: JobTableRow[]): string => {
  const csvContent = Papa.unparse(rows);
  return csvContent;
};

// Download data as CSV file
export const downloadCSV = (data: string, filename: string): void => {
  const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
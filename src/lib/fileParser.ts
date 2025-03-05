
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Job, Salesman, JobTableRow } from '@/types';

// Function to parse CSV files
export const parseCSV = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        resolve(results.data);
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
        resolve(jsonData);
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
  return data.map(item => ({
    job_id: String(item.job_id),
    date: item.date,
    location: [
      parseFloat(item.latitude || item.location_latitude || item.location?.[0] || 0),
      parseFloat(item.longitude || item.location_longitude || item.location?.[1] || 0)
    ],
    duration_mins: parseInt(item.duration_mins),
    entry_time: item.entry_time,
    exit_time: item.exit_time,
  }));
};

// Process salesman data from parsed file
export const processSalesmanData = (data: any[]): Salesman[] => {
  return data.map(item => ({
    salesman_id: String(item.salesman_id),
    home_location: [
      parseFloat(item.home_latitude || item.home_location_latitude || item.home_location?.[0] || 0),
      parseFloat(item.home_longitude || item.home_location_longitude || item.home_location?.[1] || 0)
    ],
    start_time: item.start_time,
    end_time: item.end_time,
  }));
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

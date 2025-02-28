import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Job, Salesman } from '../types';

export const parseFile = async (file: File): Promise<any[]> => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (extension === 'csv') {
    return parseCSV(file);
  } else if (extension === 'xlsx' || extension === 'xls') {
    return parseExcel(file);
  } else {
    throw new Error('Unsupported file format. Please upload a CSV or Excel file.');
  }
};

const parseCSV = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

const parseExcel = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        resolve(json);
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

export const processJobsData = (data: any[]): Job[] => {
  return data.map(item => {
    // Handle different possible column names
    const latitude = parseFloat(item.latitude || item.lat || item.Latitude || item.LAT || 0);
    const longitude = parseFloat(item.longitude || item.lng || item.long || item.Longitude || item.LONG || 0);
    
    return {
      job_id: String(item.job_id || item.id || item.jobId || item.JobID || ''),
      date: item.date || item.Date || new Date().toISOString(),
      location: [latitude, longitude],
      duration_mins: parseInt(item.duration_mins || item.duration || item.durationMins || 0),
      entry_time: item.entry_time || item.entryTime || item.start || '',
      exit_time: item.exit_time || item.exitTime || item.end || ''
    };
  });
};

export const processSalesmenData = (data: any[]): Salesman[] => {
  return data.map(item => {
    // Handle different possible column names for location
    const latitude = parseFloat(item.home_latitude || item.latitude || item.lat || item.homeLat || 0);
    const longitude = parseFloat(item.home_longitude || item.longitude || item.lng || item.homeLng || 0);
    
    return {
      salesman_id: String(item.salesman_id || item.id || item.salesmanId || ''),
      home_location: [latitude, longitude],
      start_time: item.start_time || item.startTime || item.start || '',
      end_time: item.end_time || item.endTime || item.end || ''
    };
  });
};

export const convertToCSV = (data: any[]): string => {
  const csvRows = [];
  
  // Get headers
  const headers = Object.keys(data[0]);
  csvRows.push(headers.join(','));
  
  // Add rows
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      return `"${val}"`;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
};

export const downloadCSV = (data: any[], filename: string): void => {
  const csv = convertToCSV(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
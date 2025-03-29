import Papa from 'papaparse';
import { JobTableRow, RosterResponse } from '@/types/types';

/**
 * Converts a roster response into table rows for display
 */
export const convertResponseToTableRows = (response: RosterResponse): JobTableRow[] => {
  console.log('[TableConverter] Converting response to table rows:', response);
  
  const rows: JobTableRow[] = [];
  
  // Process assigned jobs
  Object.entries(response.jobs).forEach(([salesman_id, jobs]) => {
    jobs.forEach(job => {
      rows.push({
        job_id: job.job_id,
        date: job.date,
        location: job.location,
        duration_mins: job.duration_mins,
        entry_time: job.entry_time,
        exit_time: job.exit_time,
        assignment_status: 'Assigned',
        salesman_id: salesman_id,
        start_time: job.start_time,
        client_name: job.client_name,
        salesman_name: job.salesman_name
      });
    });
  });
  
  // Process unassigned jobs
  response.unassigned_jobs.forEach(job => {
    rows.push({
      job_id: job.job_id,
      date: job.date,
      location: job.location,
      duration_mins: job.duration_mins,
      entry_time: job.entry_time,
      exit_time: job.exit_time,
      assignment_status: 'Unassigned',
      salesman_id: null,
      start_time: null,
      client_name: job.client_name
    });
  });

  console.log('[TableConverter] Conversion complete:', {
    totalRows: rows.length,
    assignedJobs: rows.filter(r => r.assignment_status === 'Assigned').length,
    unassignedJobs: rows.filter(r => r.assignment_status === 'Unassigned').length
  });
  
  return rows;
};

/**
 * Converts table data to CSV format
 */
export const exportTableToCSV = (rows: any[]): string => {
  console.log('[TableConverter] Exporting table data to CSV:', {
    rowCount: rows.length
  });
  return Papa.unparse(rows);
};

/**
 * Downloads data as a CSV file
 */
export const downloadCSV = (data: string, filename: string): void => {
  console.log('[TableConverter] Downloading CSV file:', {
    filename,
    dataSize: data.length
  });

  const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
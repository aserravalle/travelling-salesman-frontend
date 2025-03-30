export type Location = 
  | { latitude: number; longitude: number; address?: string } // both lat & long required, address optional
  | { address: string; latitude?: never; longitude?: never } // only address, no lat/long


export interface Job {
  job_id: string;
  date: string;
  location: Location;
  duration_mins: number;
  entry_time: string;
  exit_time: string;

  client_name?: string;
  description?: string;
}

export interface Salesman {
  salesman_id: string;
  location: Location;
  start_time: string;
  end_time: string;

  salesman_name?: string;
}

export interface AssignedJob extends Job {
  salesman_id: string | null;
  start_time: string | null;

  client_name?: string;
  salesman_name?: string;
}

export interface RosterRequest {
  jobs: Job[];
  salesmen: Salesman[];
}

export interface RosterResponse {
  jobs: Record<string, AssignedJob[]>;
  unassigned_jobs: Job[];
  message: string;
}

// More like assigned job 
export interface JobTableRow {
  job_id: string;
  date: string;
  location: Location;
  duration_mins: number;
  entry_time: string;
  exit_time: string;
  assignment_status: string;
  salesman_id: string | null;
  start_time: string | null;
  
  salesman_name?: string;
  client_name?: string;
}

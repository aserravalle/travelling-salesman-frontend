
export interface Location {
  latitude: number;
  longitude: number;
}

export interface Job {
  job_id: string;
  date: string;
  location: [number, number];
  duration_mins: number;
  entry_time: string;
  exit_time: string;
}

export interface Salesman {
  salesman_id: string;
  home_location: [number, number];
  start_time: string;
  end_time: string;
}

export interface AssignedJob extends Job {
  salesman_id: string | null;
  start_time: string | null;
}

export interface RosterRequest {
  jobs: Job[];
  salesmen: Salesman[];
}

export interface RosterResponse {
  jobs: Record<string, AssignedJob[]>;
  unassigned_jobs: AssignedJob[];
  message: string;
}

export interface JobTableRow {
  job_id: string;
  date: string;
  latitude: number;
  longitude: number;
  duration_mins: number;
  entry_time: string;
  exit_time: string;
  assignment_status: string;
  salesman_id: string | null;
  start_time: string | null;
  
  name?: string;
  customer?: string;
  address?: string;
  suburb?: string;
  postcode?: string;
  city?: string;
  country?: string;
}

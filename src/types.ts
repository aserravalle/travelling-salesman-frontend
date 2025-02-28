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
  salesman_id: number | null;
  start_time: string | null;
  assignment_status?: string;
  latitude?: number;
  longitude?: number;
}

export interface ApiRequest {
  jobs: Job[];
  salesmen: Salesman[];
}

export interface ApiResponse {
  jobs: Record<string, AssignedJob[]>;
  unassigned_jobs: AssignedJob[];
  message: string;
}

export interface FlattenedJob {
  job_id: string;
  date: string;
  latitude: string;
  longitude: string;
  duration_mins: number;
  entry_time: string;
  exit_time: string;
  assignment_status: string;
  salesman_id: string | null;
  start_time: string | null;
}
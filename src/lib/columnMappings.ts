import { Job, Salesman } from '@/types';

type ColumnMapping<T> = {
  [K in keyof T]: string[];
};

export const JOB_COLUMN_MAPPINGS: ColumnMapping<Job> = {
  job_id: ['job_id', 'jobid', 'job', 'id', 'job number', 'job_number', 'jobnumber'],
  date: ['date', 'job_date', 'jobdate', 'delivery_date', 'service_date'],
  location: ['location', 'coordinates', 'position'],
  duration_mins: ['duration_mins', 'duration', 'service_duration', 'time_required', 'minutes', 'mins'],
  entry_time: ['entry_time', 'entrytime', 'start_window', 'earliest_start', 'window_start'],
  exit_time: ['exit_time', 'exittime', 'end_window', 'latest_end', 'window_end']
};

export const LOCATION_COLUMN_MAPPINGS = {
  latitude: ['latitude', 'lat', 'location_latitude', 'y', 'location_y'],
  longitude: ['longitude', 'long', 'lng', 'location_longitude', 'x', 'location_x']
};

export const SALESMAN_COLUMN_MAPPINGS: ColumnMapping<Salesman> = {
  salesman_id: ['salesman_id', 'salesmanid', 'salesman', 'id', 'employee_id', 'staff_id'],
  home_location: ['home_location', 'home', 'base', 'start_location'],
  start_time: ['start_time', 'starttime', 'shift_start', 'available_from'],
  end_time: ['end_time', 'endtime', 'shift_end', 'available_until']
};

export const DATASET_IDENTIFIERS = {
  job: [
    'job',
    'task',
    'service',
    'delivery',
    'assignment',
    'order',
    'duration',
    'window'
  ],
  salesman: [
    'salesman',
    'sales',
    'employee',
    'staff',
    'worker',
    'person',
    'home',
    'shift'
  ]
};
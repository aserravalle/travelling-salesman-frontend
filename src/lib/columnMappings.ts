import { Job, Salesman } from '@/types/types';

type ColumnMapping<T> = {
  [K in keyof T]: string[];
};

export const LOCATION_COLUMN_MAPPINGS = {
  latitude: ['latitude', 'lat', 'location_latitude', 'y', 'location_y', 'home_latitude', 'lat_coordinate'],
  longitude: ['longitude', 'long', 'lng', 'location_longitude', 'x', 'location_x', 'home_longitude', 'long_coordinate'],
  address: ['address', 'street', 'location', 'location_address', 'location_street'],
};

export const JOB_COLUMN_MAPPINGS: ColumnMapping<Job> = {
  job_id: ['job_id', 'jobid', 'job', 'id', 'job number', 'job_number', 'jobnumber'],
  client_name: ['client_name', 'client', 'customer', 'customer_name', 'customer_id'],
  date: ['date', 'job_date', 'jobdate', 'delivery_date', 'service_date'],
  duration_mins: ['duration_mins', 'duration', 'service_duration', 'time_required', 'minutes', 'mins'],
  entry_time: ['entry_time', 'entrytime', 'start_window', 'earliest_start', 'window_start'],
  exit_time: ['exit_time', 'exittime', 'end_window', 'latest_end', 'window_end'],
  ...LOCATION_COLUMN_MAPPINGS
};

export const SALESMAN_COLUMN_MAPPINGS: ColumnMapping<Salesman> = {
  salesman_id: ['salesman_id', 'salesmanid', 'salesman', 'id', 'employee_id', 'staff_id'],
  salesman_name: ['salesman_name', 'salesman', 'name', 'employee_name', 'staff_name'],
  start_time: ['start_time', 'starttime', 'shift_start', 'available_from'],
  end_time: ['end_time', 'endtime', 'shift_end', 'available_until'],
  ...LOCATION_COLUMN_MAPPINGS
};
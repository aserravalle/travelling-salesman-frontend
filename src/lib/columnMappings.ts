import { Job, Salesman } from '@/types/types';

export const JOB_FILE_NAMES = ['job', 'jobs', 'task', 'tasks', 'service', 'services', 'delivery', 'deliveries', 'planificación', 'planificacion'];
export const SALESMAN_FILE_NAMES = ['salesman', 'salesmen', 'employee', 'employees', 'staff', 'technician', 'technicians', 'empleados', 'empleadas'];

type ColumnMapping<T> = {
  [K in keyof T as K extends 'location' ? never : K]: string[];
};

export const ADDRESS_COLUMN_MAPPINGS = {
  address: ['address', 'street', 'street_address', 'location_address', 'location_street', 'dirección'],
  postcode: ['postcode', 'zip', 'zipcode', 'zip_code', 'location_postcode', 'location_zip', 'location_zipcode', 'código postal', 'cp'],
  city: ['city', 'town', 'population', 'population_city', 'population_town', 'población'],
  province: ['province', 'state', 'county', 'region', 'location_province', 'location_state', 'location_county', 'location_region', 'provincia'],
  country: ['country', 'country_code', 'location_country', 'location_country_code', 'país'],
};

export const LOCATION_COLUMN_MAPPINGS = {
  latitude: ['latitude', 'lat', 'location_latitude', 'y', 'location_y', 'home_latitude', 'lat_coordinate'],
  longitude: ['longitude', 'long', 'lng', 'location_longitude', 'x', 'location_x', 'home_longitude', 'long_coordinate'],
  address: ADDRESS_COLUMN_MAPPINGS.address,
};

export const JOB_COLUMN_MAPPINGS: ColumnMapping<Job> = {
  job_id: ['job_id', 'jobid', 'job', 'id', 'job number', 'job_number', 'jobnumber'],
  client_name: ['client_name', 'client', 'customer', 'customer_name', 'customer_id', 'tarea'],
  date: ['date', 'job_date', 'jobdate', 'delivery_date', 'service_date'],
  duration_mins: ['duration_mins', 'duration', 'service_duration', 'time_required', 'minutes', 'mins', 'duración'],
  entry_time: ['entry_time', 'entrytime', 'start_window', 'earliest_start', 'window_start'],
  exit_time: ['exit_time', 'exittime', 'end_window', 'latest_end', 'window_end'],
  description: ['description', 'desc', 'job_description', 'task_description', 'service_description', 'delivery_description', 'descripción'],
  ...LOCATION_COLUMN_MAPPINGS
};

export const SALESMAN_COLUMN_MAPPINGS: ColumnMapping<Salesman> = {
  salesman_id: ['salesman_id', 'salesmanid', 'salesman', 'id', 'employee_id', 'staff_id'],
  salesman_name: ['salesman_name', 'salesman', 'name', 'employee_name', 'staff_name', 'nombre completo'],
  start_time: ['start_time', 'starttime', 'shift_start', 'available_from'],
  end_time: ['end_time', 'endtime', 'shift_end', 'available_until'],
  ...LOCATION_COLUMN_MAPPINGS
};

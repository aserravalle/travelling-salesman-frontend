import { Job } from '@/types/types';
import { LOCATION_COLUMN_MAPPINGS } from './locationMappings';
import { ColumnMapping } from './ColumnMapping';

export const JOB_COLUMN_MAPPINGS: ColumnMapping<Job> = {
  job_id: [
    'job_id',
    'jobid',
    'job',
    'id',
    'job number',
    'job_number',
    'jobnumber',
  ],
  client_name: [
    'client_name',
    'client',
    'customer',
    'customer_name',
    'customer_id',
    'tarea',
  ],
  date: [
    'date',
    'job_date',
    'jobdate',
    'delivery_date',
    'service_date',
  ],
  duration_mins: [
    'duration_mins',
    'duration',
    'service_duration',
    'time_required',
    'minutes',
    'mins',
    'duración',
  ],
  entry_time: [
    'entry_time',
    'entrytime',
    'start_window',
    'earliest_start',
    'window_start',
  ],
  exit_time: [
    'exit_time',
    'exittime',
    'end_window',
    'latest_end',
    'window_end',
  ],
  description: [
    'description',
    'desc',
    'job_description',
    'task_description',
    'service_description',
    'delivery_description',
    'descripción',
  ],
  ...LOCATION_COLUMN_MAPPINGS,
};
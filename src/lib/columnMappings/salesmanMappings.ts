import { Salesman } from '@/types/types';
import { LOCATION_COLUMN_MAPPINGS } from './locationMappings';
import { ColumnMapping } from './ColumnMapping';

export const SALESMAN_COLUMN_MAPPINGS: ColumnMapping<Salesman> = {
  salesman_id: [
    'salesman_id',
    'salesmanid',
    'salesman',
    'id',
    'employee_id',
    'staff_id',
  ],
  salesman_name: [
    'salesman_name',
    'salesman',
    'name',
    'employee_name',
    'staff_name',
    'nombre completo',
  ],
  start_time: [
    'start_time',
    'starttime',
    'shift_start',
    'available_from',
  ],
  end_time: [
    'end_time',
    'endtime',
    'shift_end',
    'available_until',
  ],
  ...LOCATION_COLUMN_MAPPINGS,
};
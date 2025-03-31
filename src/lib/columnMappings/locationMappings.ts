import { ADDRESS_COLUMN_MAPPINGS } from './addressMappings';

export const LOCATION_COLUMN_MAPPINGS = {
  latitude: [
    'latitude',
    'lat',
    'location_latitude',
    'y',
    'location_y',
    'home_latitude',
    'lat_coordinate'
  ],
  longitude: [
    'longitude',
    'long',
    'lng',
    'location_longitude',
    'x',
    'location_x',
    'home_longitude',
    'long_coordinate'
  ],
  address: ADDRESS_COLUMN_MAPPINGS.address,
}; 
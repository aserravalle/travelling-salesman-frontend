export type ColumnMapping<T> = {
  [K in keyof T as K extends 'location' ? never : K]: string[];
};

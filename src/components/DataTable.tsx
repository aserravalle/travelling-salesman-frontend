import React from 'react';
import { Job, Salesman, FlattenedJob } from '../types';

interface DataTableProps {
  data: Job[] | Salesman[] | FlattenedJob[];
  type: 'jobs' | 'salesmen' | 'results';
}

const DataTable: React.FC<DataTableProps> = ({ data, type }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4 text-center text-gray-500">
        No data available
      </div>
    );
  }

  // Get all keys from the first item
  const allKeys = Object.keys(data[0]);
  
  // Determine which keys to display
  const headers = allKeys.filter(key => {
    // For jobs and salesmen, we'll handle location arrays specially
    if (type === 'jobs' && key === 'location') return true;
    if (type === 'salesmen' && key === 'home_location') return true;
    return true;
  });

  const renderTableHeaders = () => {
    return (
      <tr>
        {headers.map((header) => {
          // Format header for display
          const formattedHeader = header
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
            
          return (
            <th 
              key={header} 
              className="px-4 py-2 bg-gray-100 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
            >
              {formattedHeader}
            </th>
          );
        })}
      </tr>
    );
  };

  const renderTableRows = () => {
    return data.map((item, index) => (
      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
        {headers.map((header) => {
          let cellValue = (item as any)[header];
          
          // Format location data for jobs
          if (type === 'jobs' && header === 'location') {
            const location = (item as Job).location;
            cellValue = location ? `${location[0]}, ${location[1]}` : 'N/A';
          }
          
          // Format location data for salesmen
          if (type === 'salesmen' && header === 'home_location') {
            const location = (item as Salesman).home_location;
            cellValue = location ? `${location[0]}, ${location[1]}` : 'N/A';
          }
          
          // Format assignment status with color
          if (header === 'assignment_status') {
            return (
              <td key={header} className="px-4 py-2 whitespace-nowrap text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  cellValue === 'assigned' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {cellValue}
                </span>
              </td>
            );
          }
          
          return (
            <td key={header} className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
              {cellValue !== null && cellValue !== undefined ? String(cellValue) : 'N/A'}
            </td>
          );
        })}
      </tr>
    ));
  };

  return (
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          {renderTableHeaders()}
        </thead>
        <tbody className="divide-y divide-gray-200">
          {renderTableRows()}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
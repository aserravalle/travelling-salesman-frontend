
import { useState, useMemo } from 'react';
import {
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, 
  ChevronUp, 
  Download, 
  Filter, 
  Search, 
  SlidersHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { exportTableToCSV, downloadCSV } from '@/utils/fileParser';
import { JobTableRow } from '@/types';
import { cn } from '@/lib/utils';

interface Column {
  key: keyof JobTableRow;
  label: string;
}

interface DataTableProps {
  data: JobTableRow[];
  onExport?: () => void;
  onFilteredDataChange?: (filteredData: JobTableRow[]) => void;
}

export const DataTable = ({ data, onExport, onFilteredDataChange }: DataTableProps) => {
  const [sortBy, setSortBy] = useState<keyof JobTableRow>('job_id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSalesman, setFilterSalesman] = useState<string>('all');

  // List of columns to display
  const columns: Column[] = [
    { key: 'job_id', label: 'Job ID' },
    { key: 'date', label: 'Date' },
    { key: 'latitude', label: 'Latitude' },
    { key: 'longitude', label: 'Longitude' },
    { key: 'duration_mins', label: 'Duration (mins)' },
    { key: 'entry_time', label: 'Entry Time' },
    { key: 'exit_time', label: 'Exit Time' },
    { key: 'assignment_status', label: 'Status' },
    { key: 'salesman_id', label: 'Salesman ID' },
    { key: 'start_time', label: 'Start Time' },
  ];

  // Get unique salesman IDs for filtering
  const salesmanIds = useMemo(() => {
    const ids = new Set<string>();
    data.forEach(row => {
      if (row.salesman_id) {
        ids.add(row.salesman_id);
      }
    });
    return Array.from(ids);
  }, [data]);

  // Sort and filter data
  const sortedAndFilteredData = useMemo(() => {
    // First apply filters
    let filteredData = data.filter(row => {
      const matchesSearch = 
        Object.values(row)
          .join(' ')
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        filterStatus === 'all' || 
        row.assignment_status === filterStatus;
      
      const matchesSalesman = 
        filterSalesman === 'all' || 
        (filterSalesman === 'unassigned' ? 
          row.salesman_id === null : 
          row.salesman_id === filterSalesman);
      
      return matchesSearch && matchesStatus && matchesSalesman;
    });

    // Then sort
    return filteredData.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (aValue === null && bValue === null) return 0;
      if (aValue === null) return sortDirection === 'asc' ? 1 : -1;
      if (bValue === null) return sortDirection === 'asc' ? -1 : 1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      // @ts-ignore - we know these are comparable
      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, searchTerm, sortBy, sortDirection, filterStatus, filterSalesman]);

  // Notify parent about filtered data changes
  useMemo(() => {
    if (onFilteredDataChange) {
      onFilteredDataChange(sortedAndFilteredData);
    }
  }, [sortedAndFilteredData, onFilteredDataChange]);

  // Toggle sort direction or change sort column
  const handleSort = (column: keyof JobTableRow) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  // Handle export to CSV
  const handleExport = () => {
    if (onExport) {
      onExport();
    } else {
      const csvContent = exportTableToCSV(sortedAndFilteredData);
      downloadCSV(csvContent, 'job_assignments.csv');
    }
  };

  // Render sort indicator
  const renderSortIndicator = (column: keyof JobTableRow) => {
    if (sortBy !== column) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4 ml-1" /> : 
      <ChevronDown className="w-4 h-4 ml-1" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                <span>Status</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                All Statuses
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('Assigned')}>
                Assigned
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('Unassigned')}>
                Unassigned
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Select value={filterSalesman} onValueChange={setFilterSalesman}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Filter by Salesman" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Salesmen</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {salesmanIds.map((id) => (
                <SelectItem key={id} value={id}>
                  Salesman {id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>
      
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead 
                  key={column.key}
                  className="whitespace-nowrap cursor-pointer"
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center">
                    {column.label}
                    {renderSortIndicator(column.key)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAndFilteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              sortedAndFilteredData.map((row, index) => (
                <TableRow key={index} className={
                  cn(
                    row.assignment_status === 'Unassigned' && 'bg-red-50 dark:bg-red-950/20',
                  )
                }>
                  {columns.map((column) => (
                    <TableCell 
                      key={`${index}-${column.key}`} 
                      className="whitespace-nowrap"
                    >
                      {row[column.key] !== null ? String(row[column.key]) : '-'}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="text-sm text-muted-foreground">
        Showing {sortedAndFilteredData.length} of {data.length} results
      </div>
    </div>
  );
};

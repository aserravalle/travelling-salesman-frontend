import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle2 } from 'lucide-react';
import { formatDisplayTime } from '@/lib/formatDateTime';
import { Salesman } from '@/types/types';

interface SalesmanDataTableProps {
  salesmen: Salesman[];
}

export const SalesmanDataTable = ({ salesmen }: SalesmanDataTableProps) => {
  return (
    <>
      <div className="bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/20 p-3 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Salesmen Data Preview
          </h3>
          <span className="text-sm text-muted-foreground">{salesmen.length} salesmen</span>
        </div>
      </div>
      <div className="h-[250px] overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Salesman ID</TableHead>
              <TableHead>Salesman Name</TableHead>
              <TableHead>Coordinates</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {salesmen.map((salesman, index) => (
              <TableRow key={index}>
                <TableCell>{salesman.salesman_id}</TableCell>
                <TableCell>{salesman.salesman_name || '-'}</TableCell>
                <TableCell>
                  {salesman.location.latitude && salesman.location.longitude
                    ? `[${salesman.location.latitude.toFixed(4)}, ${salesman.location.longitude.toFixed(4)}]`
                    : '-'}
                </TableCell>
                <TableCell>{salesman.location.address || '-'}</TableCell>
                <TableCell>{formatDisplayTime(salesman.start_time)}</TableCell>
                <TableCell>{formatDisplayTime(salesman.end_time)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

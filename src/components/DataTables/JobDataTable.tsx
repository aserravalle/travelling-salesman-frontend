import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle2 } from 'lucide-react';
import { formatDisplayDate, formatDisplayTime } from '@/lib/formatDateTime';
import { Job } from '@/types/types';

interface JobDataTableProps {
    jobs: Job[];
}

export const JobDataTable = ({ jobs }: JobDataTableProps) => {
    return (
        <>
            <div className="bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/20 p-3 border-b">
            <div className="flex items-center justify-between">
            <h3 className="font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Jobs Data Preview
            </h3>
            <span className="text-sm text-muted-foreground">{jobs.length} jobs</span>
            </div>
            </div>
            <div className="h-[250px] overflow-auto">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Job ID</TableHead>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Coordinates</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Entry Time</TableHead>
                    <TableHead>Exit Time</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {jobs.map((job, index) => (
                    <TableRow key={index}>
                        <TableCell>{job.job_id}</TableCell>
                        <TableCell>{job.client_name || '-'}</TableCell>
                        <TableCell>{formatDisplayDate(job.date)}</TableCell>
                        <TableCell>
                        {job.location.latitude && job.location.longitude 
                            ? `[${job.location.latitude.toFixed(4)}, ${job.location.longitude.toFixed(4)}]`
                            : '-'
                        }
                        </TableCell>
                        <TableCell>{job.location.address || '-'}</TableCell>
                        <TableCell>{job.duration_mins} mins</TableCell>
                        <TableCell>{formatDisplayTime(job.entry_time)}</TableCell>
                        <TableCell>{formatDisplayTime(job.exit_time)}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
        </>
    );
};

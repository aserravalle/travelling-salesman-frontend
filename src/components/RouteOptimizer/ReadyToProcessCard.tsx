import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Job, Salesman } from '@/types/types';
import { Loader2, Send } from 'lucide-react';

interface ReadyToProcessCardProps {
  isReadyToProcess: boolean;
  parsedJobs: Job[];
  parsedSalesmen: Salesman[];
  isSubmitting: boolean;
  isProcessingFiles: boolean;
  handleReset: () => void;
  handleSubmit: () => void;
}

export const ReadyToProcessCard = ({
  isReadyToProcess,
  parsedJobs,
  parsedSalesmen,
  isSubmitting,
  isProcessingFiles,
  handleReset,
  handleSubmit,
}: ReadyToProcessCardProps) => {
  function getNumberOfSalesmenString(parsedSalesmen: Salesman[]) {
  
    if (parsedSalesmen.length == 0) {
      return 'No salesmen detected';
    }
    else if (parsedSalesmen.length == 1) {
      return '1 salesman detected';
    }
    else {
      return `${parsedSalesmen.length} salesmen detected`;
    }
  }
  
  function getRecommendedSalesmen(parsedJobs: Job[]): number {
    const totalJobDuration = parsedJobs.reduce((sum, job) => {
      const minutesAvailable = (new Date(job.exit_time).getTime() - new Date(job.entry_time).getTime()) / (1000 * 60); // Time window to complete job
      const travelTime = 20;
      const workRatio = job.duration_mins / minutesAvailable ; // 0 < workRatio < 1. higher = more urgent
      if (workRatio > 0.95) {
        const client = job.client_name || 'Unknown Client';
        console.warn(`${client} has a job with no buffer time - they may need to be rescheduled.`);
      }
      const urgencyFactor = 1 + Math.pow(workRatio, 0.75); // More urgent jobs get a higher factor with power < 1
      return sum + (job.duration_mins + travelTime) * urgencyFactor;
    }, 0);
    const totalTimeWithBuffer = totalJobDuration + parsedJobs.length * 20; // Adding 20 minutes per job
    const workDayMinutes = 8 * 60; // 8-hour workday in minutes
    return Math.ceil(totalTimeWithBuffer / workDayMinutes);
  }
  
  function getNumberOfJobsString(parsedJobs: Job[]) {
  
    if (parsedJobs.length == 0) {
      return 'No jobs detected';
    }
    else if (parsedJobs.length == 1) {
      return '1 job detected';
    }
    else {
      const recommendedSalesmen = getRecommendedSalesmen(parsedJobs);
      return `${parsedJobs.length} jobs detected (Recommended: ${recommendedSalesmen} salesmen)`;
    }
  }
  
  return (
    <Card className="bg-gradient-to-br from-sky-100/50 to-blue-100/50 dark:from-sky-900/30 dark:to-blue-900/20 max-w-lg w-full shadow-lg">
      <CardHeader>
        <CardTitle>Ready to Process?</CardTitle>
        <CardDescription>
          {isReadyToProcess 
            ? "Your files are ready! Click the button below to proceed."
            : "Upload your files to begin the assignment process."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded-full ${parsedJobs.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <span>{getNumberOfJobsString(parsedJobs)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded-full ${parsedSalesmen.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <span>{getNumberOfSalesmenString(parsedSalesmen)}</span>
        </div>
        {parsedJobs.some(job => {
          const minutesAvailable = (new Date(job.exit_time).getTime() - new Date(job.entry_time).getTime()) / (1000 * 60);
          return job.duration_mins >= minutesAvailable;
        }) && (
          <div className="text-sm text-red-500">
            Warning: Some jobs have a very tight time window and may need to be rescheduled.
          </div>
        )}
        <div className="pt-4 flex gap-2">
          {(parsedJobs.length > 0 || parsedSalesmen.length > 0) && (
            <Button 
              variant="outline" 
              onClick={handleReset}
              className="flex-1 shadow-sm hover:shadow"
              disabled={isSubmitting || isProcessingFiles}
            >
              Reset Data
            </Button>
          )}
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || !isReadyToProcess || isProcessingFiles}
            className={`bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 shadow-md hover:shadow-lg flex items-center gap-2 ${(parsedJobs.length > 0 || parsedSalesmen.length > 0) ? 'flex-1' : 'w-full'}`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : isProcessingFiles ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing Files...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Process and Assign Jobs
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

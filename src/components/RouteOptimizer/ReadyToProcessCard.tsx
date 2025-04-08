import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Send } from 'lucide-react';

interface ReadyToProcessCardProps {
  isReadyToProcess: boolean;
  parsedJobs: any[];
  parsedSalesmen: any[];
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
          <span>{parsedJobs.length > 0 ? `${parsedJobs.length} jobs detected` : 'No jobs detected'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded-full ${parsedSalesmen.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <span>{parsedSalesmen.length > 0 ? `${parsedSalesmen.length} salesmen detected` : 'No salesmen detected'}</span>
        </div>
        
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

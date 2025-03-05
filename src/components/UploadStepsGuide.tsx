
import { ClipboardList, Upload, MessageSquare, Download } from "lucide-react";

interface StepProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  step: number;
}

const Step = ({ icon, title, description, step }: StepProps) => (
  <div className="flex items-start gap-4">
    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-primary/10">
      {icon}
    </div>
    <div className="flex-1 space-y-1">
      <h3 className="font-medium text-lg flex items-center gap-2">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">
          {step}
        </span>
        {title}
      </h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  </div>
);

export const UploadStepsGuide = () => {
  return (
    <div className="space-y-6">
      <Step
        icon={<Upload className="w-6 h-6 text-primary" />}
        title="Upload Files"
        description="Upload your Jobs and Salesmen files in CSV or Excel format"
        step={1}
      />
      <Step
        icon={<ClipboardList className="w-6 h-6 text-primary" />}
        title="Review Data"
        description="Review the data from your uploaded files to ensure everything is correct"
        step={2}
      />
      <Step
        icon={<MessageSquare className="w-6 h-6 text-primary" />}
        title="Process & Assign"
        description="Send your data to the assignment algorithm to optimally assign jobs to salesmen"
        step={3}
      />
      <Step
        icon={<Download className="w-6 h-6 text-primary" />}
        title="View Results & Export"
        description="Review job assignments and export the data as a CSV file"
        step={4}
      />
    </div>
  );
};

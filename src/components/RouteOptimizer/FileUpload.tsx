import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileType2, Check, X, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  accept: string;
  files: File[];
  label?: string;
  description?: string;
  multiple?: boolean;
}

export const FileUpload = ({ 
  onFilesSelected, 
  accept, 
  files, 
  label = "Upload Files",
  description = "Upload your Jobs and Salesmen files",
  multiple = true
}: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter(file => isValidFileType(file));
      if (droppedFiles.length > 0) {
        onFilesSelected(droppedFiles);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const selectedFiles = Array.from(e.target.files).filter(file => isValidFileType(file));
      if (selectedFiles.length > 0) {
        onFilesSelected(selectedFiles);
      }
    }
  };

  const isValidFileType = (file: File) => {
    const validTypes = accept.split(',').map(type => type.trim());
    return validTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      } else {
        return file.type === type;
      }
    });
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFiles = [...files];
    newFiles.splice(index, 1);
    onFilesSelected(newFiles);
  };

  const loadDemoFiles = async () => {
    const demoFiles = [
      { name: "jobs_florence.csv", url: "/jobs_florence.csv" },
      { name: "salesmen_florence.csv", url: "/salesmen_florence.csv" }
    ];

    const fetchedFiles = await Promise.all(
      demoFiles.map(async (file) => {
        const response = await fetch(file.url);
        const blob = await response.blob();
        return new File([blob], file.name, { type: blob.type });
      })
    );

    onFilesSelected(fetchedFiles);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">{label}</CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
        <div className="pt-4 flex gap-2">
          <Button 
            size="sm" 
            className={'bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 shadow-md hover:shadow-lg flex items-center w-full'}
            onClick={loadDemoFiles}
          >
            No Data? Load Demo Files
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 cursor-pointer text-center transition-colors",
            isDragging ? "border-primary bg-secondary/20" : "border-border hover:border-primary/50",
            files.length > 0 ? "bg-secondary/10" : ""
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={accept}
            multiple={multiple}
            className="hidden"
          />
          
          <AnimatePresence mode="wait">
            {files.length > 0 ? (
              <motion.div
                key="file-info"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="grid gap-3 w-full max-w-md max-h-64 overflow-y-auto">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 rounded-md bg-background border">
                      <FileType2 className="w-6 h-6 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => removeFile(index, e)}
                        className="rounded-full h-7 w-7"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                {multiple && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 flex items-center gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    <ArrowUp className="w-4 h-4" />
                    Add More Files
                  </Button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="file-upload"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="p-4 rounded-full bg-secondary/50 mb-2">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <p className="font-medium">Drag and drop your files here</p>
                <p className="text-sm text-muted-foreground">
                  or click to browse files
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Supports CSV and Excel files
                </p>
                <p className="text-xs text-primary mt-1 font-medium">
                  Smart detection will automatically identify Jobs and Salesmen data
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <div className="flex items-center gap-2">
          {files.length > 0 && <Check className="w-4 h-4 text-green-500" />}
          <span className="text-sm text-muted-foreground">
            {files.length === 0 ? 'No files selected' : 
             files.length === 1 ? '1 file ready for upload' : 
             `${files.length} files ready for upload`}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};

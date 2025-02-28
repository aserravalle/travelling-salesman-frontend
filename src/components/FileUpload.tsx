import React, { useState } from 'react';
import { Upload, FileUp, AlertCircle } from 'lucide-react';
import { parseFile } from '../utils/fileParser';

interface FileUploadProps {
  onFileProcessed: (data: any[]) => void;
  fileType: 'jobs' | 'salesmen';
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileProcessed, fileType }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const processFile = async (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (extension !== 'csv' && extension !== 'xlsx' && extension !== 'xls') {
      setError('Please upload a CSV or Excel file');
      setFileName(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setFileName(file.name);

    try {
      const data = await parseFile(file);
      onFileProcessed(data);
    } catch (error) {
      console.error('Error parsing file:', error);
      setError('Error parsing file. Please check the format and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById(`file-upload-${fileType}`)?.click()}
      >
        <input
          id={`file-upload-${fileType}`}
          type="file"
          className="hidden"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
        />
        
        {isLoading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
            <p className="text-sm text-gray-500">Processing file...</p>
          </div>
        ) : fileName ? (
          <div className="flex flex-col items-center">
            <FileUp className="h-8 w-8 text-green-500 mb-2" />
            <p className="text-sm font-medium text-gray-700">{fileName}</p>
            <p className="text-xs text-gray-500 mt-1">File uploaded successfully</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-700">
              Upload {fileType === 'jobs' ? 'Jobs' : 'Salesmen'} File
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Drag and drop or click to select a CSV or Excel file
            </p>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-2 flex items-center text-red-500 text-sm">
          <AlertCircle className="h-4 w-4 mr-1" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
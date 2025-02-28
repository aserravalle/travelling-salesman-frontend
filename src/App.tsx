import React, { useState } from 'react';
import { FileUp, Users, MapPin, Download, Send, AlertCircle, CheckCircle } from 'lucide-react';
import FileUpload from './components/FileUpload';
import DataTable from './components/DataTable';
import Map from './components/Map';
import { Job, Salesman, ApiRequest, ApiResponse, FlattenedJob } from './types';
import { processJobsData, processSalesmenData, downloadCSV } from './utils/fileParser';
import { assignJobs } from './services/api';

function App() {
  const [jobsData, setJobsData] = useState<Job[]>([]);
  const [salesmenData, setSalesmenData] = useState<Salesman[]>([]);
  const [resultData, setResultData] = useState<FlattenedJob[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'results'>('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleJobsFileProcessed = (data: any[]) => {
    const processedData = processJobsData(data);
    setJobsData(processedData);
  };

  const handleSalesmenFileProcessed = (data: any[]) => {
    const processedData = processSalesmenData(data);
    setSalesmenData(processedData);
  };

  const handleSubmit = async () => {
    if (jobsData.length === 0 || salesmenData.length === 0) {
      setError('Please upload both Jobs and Salesmen data before submitting');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const requestData: ApiRequest = {
        jobs: jobsData,
        salesmen: salesmenData
      };

      const response = await assignJobs(requestData);
      
      // Process and flatten the response data for display
      const flattenedData: FlattenedJob[] = [];
      
      // Process assigned jobs
      Object.entries(response.jobs).forEach(([salesmanId, jobs]) => {
        jobs.forEach(job => {
          flattenedData.push({
            job_id: job.job_id,
            date: job.date,
            latitude: job.location[0].toString(),
            longitude: job.location[1].toString(),
            duration_mins: job.duration_mins,
            entry_time: job.entry_time,
            exit_time: job.exit_time,
            assignment_status: 'assigned',
            salesman_id: salesmanId,
            start_time: job.start_time
          });
        });
      });
      
      // Process unassigned jobs
      response.unassigned_jobs.forEach(job => {
        flattenedData.push({
          job_id: job.job_id,
          date: job.date,
          latitude: job.location[0].toString(),
          longitude: job.location[1].toString(),
          duration_mins: job.duration_mins,
          entry_time: job.entry_time,
          exit_time: job.exit_time,
          assignment_status: 'unassigned',
          salesman_id: null,
          start_time: null
        });
      });
      
      setResultData(flattenedData);
      setSuccess(response.message);
      setActiveTab('results');
    } catch (error) {
      console.error('Error submitting data:', error);
      setError('An error occurred while processing your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadResults = () => {
    if (resultData.length === 0) {
      setError('No results to download');
      return;
    }
    
    downloadCSV(resultData, 'job_assignments.csv');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Traveling Salesman Optimizer</h1>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-4 px-6 font-medium text-sm focus:outline-none ${
              activeTab === 'upload'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('upload')}
          >
            <div className="flex items-center">
              <FileUp className="h-4 w-4 mr-2" />
              Upload Data
            </div>
          </button>
          <button
            className={`py-4 px-6 font-medium text-sm focus:outline-none ${
              activeTab === 'results'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('results')}
            disabled={resultData.length === 0}
          >
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              View Results
            </div>
          </button>
        </div>
        
        {/* Error and Success Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-green-700">{success}</p>
          </div>
        )}
        
        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FileUp className="h-5 w-5 text-blue-500 mr-2" />
                  Jobs Data
                </h2>
                <FileUpload onFileProcessed={handleJobsFileProcessed} fileType="jobs" />
                
                {jobsData.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      {jobsData.length} Jobs Loaded
                    </h3>
                    <div className="max-h-60 overflow-y-auto">
                      <DataTable data={jobsData} type="jobs" />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Users className="h-5 w-5 text-blue-500 mr-2" />
                  Salesmen Data
                </h2>
                <FileUpload onFileProcessed={handleSalesmenFileProcessed} fileType="salesmen" />
                
                {salesmenData.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      {salesmenData.length} Salesmen Loaded
                    </h3>
                    <div className="max-h-60 overflow-y-auto">
                      <DataTable data={salesmenData} type="salesmen" />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-center">
              <button
                className="flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSubmit}
                disabled={isLoading || jobsData.length === 0 || salesmenData.length === 0}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-3"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Optimize Job Assignments
                  </>
                )}
              </button>
            </div>
          </div>
        )}
        
        {/* Results Tab */}
        {activeTab === 'results' && (
          <div>
            {resultData.length > 0 ? (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-medium text-gray-900 mb-4">Job Assignments</h2>
                  <Map jobs={resultData} />
                </div>
                
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Assignment Results</h2>
                    <button
                      className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      onClick={handleDownloadResults}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download CSV
                    </button>
                  </div>
                  <DataTable data={resultData} type="results" />
                </div>
                
                <div className="flex justify-between">
                  <button
                    className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    onClick={() => setActiveTab('upload')}
                  >
                    Back to Upload
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No results available. Please upload and process data first.</p>
                <button
                  className="mt-4 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={() => setActiveTab('upload')}
                >
                  Go to Upload
                </button>
              </div>
            )}
          </div>
        )}
      </main>
      
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 text-center text-sm text-gray-500">
            &copy; 2025 Traveling Salesman Optimizer. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
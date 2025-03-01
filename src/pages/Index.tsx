
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileUpload } from '@/components/FileUpload';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { parseCSV, parseExcel, processJobData, processSalesmanData, convertResponseToTableRows, exportTableToCSV, downloadCSV } from '@/utils/fileParser';
import { assignJobs } from '@/services/api';
import { fadeIn, staggerContainer } from '@/lib/motion';
import { Job, Salesman, RosterRequest, JobTableRow } from '@/types';
import { ArrowRight, Send, Download, CheckCircle2, Loader2 } from 'lucide-react';
import Map from '@/components/Map';

const Index = () => {
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [parsedJobs, setParsedJobs] = useState<Job[]>([]);
  const [parsedSalesmen, setParsedSalesmen] = useState<Salesman[]>([]);
  const [resultRows, setResultRows] = useState<JobTableRow[]>([]);
  const [filteredRows, setFilteredRows] = useState<JobTableRow[]>([]);
  const [activeTab, setActiveTab] = useState('upload');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);

  // Handle files selection and smart detection
  const handleFilesSelected = async (files: File[]) => {
    setUploadedFiles(files);
    if (files.length === 0) {
      setParsedJobs([]);
      setParsedSalesmen([]);
      return;
    }

    setIsProcessingFiles(true);
    
    try {
      // Process each file
      for (const file of files) {
        let rawData;
        if (file.name.endsWith('.csv')) {
          rawData = await parseCSV(file);
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          rawData = await parseExcel(file);
        } else {
          toast({
            variant: "destructive",
            title: "Invalid file format",
            description: `File ${file.name} is not a CSV or Excel file`,
          });
          continue;
        }

        // Skip empty files
        if (!rawData || rawData.length === 0) {
          toast({
            variant: "destructive",
            title: "Empty file",
            description: `File ${file.name} contains no data`,
          });
          continue;
        }

        // Smart detection of file type
        const firstRow = rawData[0];
        const hasJobFields = 'job_id' in firstRow && 'duration_mins' in firstRow;
        const hasSalesmanFields = 'salesman_id' in firstRow && 'home_location' in firstRow || 
                                ('salesman_id' in firstRow && ('home_latitude' in firstRow || 'home_longitude' in firstRow));
        
        if (hasJobFields) {
          const processedJobs = processJobData(rawData);
          setParsedJobs(prev => [...prev, ...processedJobs]);
          toast({
            title: "Jobs file processed",
            description: `Successfully parsed ${processedJobs.length} jobs from ${file.name}`,
          });
        } else if (hasSalesmanFields) {
          const processedSalesmen = processSalesmanData(rawData);
          setParsedSalesmen(prev => [...prev, ...processedSalesmen]);
          toast({
            title: "Salesmen file processed",
            description: `Successfully parsed ${processedSalesmen.length} salesmen from ${file.name}`,
          });
        } else {
          // Try to guess based on column names
          const columnSet = new Set(Object.keys(firstRow).map(key => key.toLowerCase()));
          
          const jobKeywords = ['job', 'task', 'assignment', 'duration', 'entry', 'exit'];
          const salesmanKeywords = ['salesman', 'sales', 'employee', 'staff', 'person', 'home'];
          
          const jobScore = jobKeywords.filter(keyword => 
            [...columnSet].some(column => column.includes(keyword))
          ).length;
          
          const salesmanScore = salesmanKeywords.filter(keyword => 
            [...columnSet].some(column => column.includes(keyword))
          ).length;
          
          if (jobScore > salesmanScore) {
            const processedJobs = processJobData(rawData);
            setParsedJobs(prev => [...prev, ...processedJobs]);
            toast({
              title: "Jobs file detected",
              description: `Identified and parsed ${processedJobs.length} jobs from ${file.name}`,
            });
          } else if (salesmanScore > jobScore) {
            const processedSalesmen = processSalesmanData(rawData);
            setParsedSalesmen(prev => [...prev, ...processedSalesmen]);
            toast({
              title: "Salesmen file detected",
              description: `Identified and parsed ${processedSalesmen.length} salesmen from ${file.name}`,
            });
          } else {
            toast({
              variant: "destructive",
              title: "Unknown file format",
              description: `Could not determine if ${file.name} contains jobs or salesmen data`,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error processing files:", error);
      toast({
        variant: "destructive",
        title: "Error processing files",
        description: "An error occurred while processing your files",
      });
    } finally {
      setIsProcessingFiles(false);
    }
  };

  // Submit data for job assignment
  const handleSubmit = async () => {
    if (parsedJobs.length === 0 || parsedSalesmen.length === 0) {
      toast({
        variant: "destructive",
        title: "Missing data",
        description: "Please upload and parse both jobs and salesmen files",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData: RosterRequest = {
        jobs: parsedJobs,
        salesmen: parsedSalesmen,
      };

      const response = await assignJobs(requestData);
      const tableRows = convertResponseToTableRows(response);
      
      setResultRows(tableRows);
      setFilteredRows(tableRows); // Initialize filtered rows with all rows
      setHasResults(true);
      setActiveTab('results');
      
      toast({
        title: "Jobs assigned successfully",
        description: response.message,
      });
    } catch (error) {
      console.error("Error assigning jobs:", error);
      toast({
        variant: "destructive",
        title: "Error assigning jobs",
        description: "An error occurred while trying to assign jobs",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export results to CSV
  const handleExport = () => {
    if (resultRows.length === 0) {
      toast({
        variant: "destructive",
        title: "No data to export",
        description: "Please process job assignments first",
      });
      return;
    }

    const csvContent = exportTableToCSV(resultRows);
    downloadCSV(csvContent, 'job_assignments.csv');
    
    toast({
      title: "Export successful",
      description: "Job assignments exported to CSV",
    });
  };

  // Reset all data
  const handleReset = () => {
    setUploadedFiles([]);
    setParsedJobs([]);
    setParsedSalesmen([]);
    setResultRows([]);
    setFilteredRows([]);
    setHasResults(false);
    setActiveTab('upload');
    
    toast({
      title: "Data reset",
      description: "All uploaded and processed data has been cleared",
    });
  };

  // Update filtered rows
  const handleFilteredDataChange = (data: JobTableRow[]) => {
    setFilteredRows(data);
  };

  // Check if ready to process
  const isReadyToProcess = parsedJobs.length > 0 && parsedSalesmen.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto py-6">
          <h1 className="text-3xl font-bold tracking-tight">Job Assignment Optimizer</h1>
          <p className="text-muted-foreground mt-1">
            Upload job and salesmen data to optimize work assignments
          </p>
        </div>
      </header>

      <main className="container mx-auto py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-8"
        >
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="upload">Upload Files</TabsTrigger>
              <TabsTrigger value="results" disabled={!hasResults}>
                Assignment Results
              </TabsTrigger>
            </TabsList>

            {activeTab === 'results' && (
              <Button 
                variant="outline" 
                onClick={handleExport}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            )}
          </div>

          <TabsContent value="upload" className="space-y-8">
            <div className="max-w-3xl mx-auto">
              <motion.div
                variants={fadeIn('up', 0.1)}
                initial="hidden"
                animate="show"
              >
                <FileUpload
                  label="Smart Upload"
                  description="Upload your Jobs and Salesmen files - our system will automatically detect which is which"
                  onFilesSelected={handleFilesSelected}
                  accept=".csv,.xlsx,.xls"
                  files={uploadedFiles}
                  multiple={true}
                />
              </motion.div>
            </div>

            {(parsedJobs.length > 0 || parsedSalesmen.length > 0) && (
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  {parsedJobs.length > 0 ? (
                    <motion.div
                      variants={fadeIn('right', 0.2)}
                      initial="hidden"
                      animate="show"
                      className="rounded-md border"
                    >
                      <div className="bg-muted/30 p-3 border-b">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            Jobs Data Preview
                          </h3>
                          <span className="text-sm text-muted-foreground">{parsedJobs.length} jobs</span>
                        </div>
                      </div>
                      <div className="h-[250px] overflow-auto p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Job ID</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Location</TableHead>
                              <TableHead>Duration</TableHead>
                              <TableHead>Entry Time</TableHead>
                              <TableHead>Exit Time</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {parsedJobs.map((job, index) => (
                              <TableRow key={index}>
                                <TableCell>{job.job_id}</TableCell>
                                <TableCell>{new Date(job.date).toLocaleDateString()}</TableCell>
                                <TableCell>[{job.location[0].toFixed(4)}, {job.location[1].toFixed(4)}]</TableCell>
                                <TableCell>{job.duration_mins} mins</TableCell>
                                <TableCell>{new Date(job.entry_time).toLocaleTimeString()}</TableCell>
                                <TableCell>{new Date(job.exit_time).toLocaleTimeString()}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center border rounded-md bg-muted/5">
                      <div className="text-center text-muted-foreground">
                        <p>No job data detected yet</p>
                        <p className="text-sm">Upload a file with job data</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {parsedSalesmen.length > 0 ? (
                    <motion.div
                      variants={fadeIn('left', 0.2)}
                      initial="hidden"
                      animate="show"
                      className="rounded-md border"
                    >
                      <div className="bg-muted/30 p-3 border-b">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            Salesmen Data Preview
                          </h3>
                          <span className="text-sm text-muted-foreground">{parsedSalesmen.length} salesmen</span>
                        </div>
                      </div>
                      <div className="h-[250px] overflow-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Salesman ID</TableHead>
                              <TableHead>Home Location</TableHead>
                              <TableHead>Start Time</TableHead>
                              <TableHead>End Time</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {parsedSalesmen.map((salesman, index) => (
                              <TableRow key={index}>
                                <TableCell>{salesman.salesman_id}</TableCell>
                                <TableCell>[{salesman.home_location[0].toFixed(4)}, {salesman.home_location[1].toFixed(4)}]</TableCell>
                                <TableCell>{new Date(salesman.start_time).toLocaleTimeString()}</TableCell>
                                <TableCell>{new Date(salesman.end_time).toLocaleTimeString()}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center border rounded-md bg-muted/5">
                      <div className="text-center text-muted-foreground">
                        <p>No salesman data detected yet</p>
                        <p className="text-sm">Upload a file with salesman data</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-center">
              <Card className="bg-primary/5 max-w-lg w-full">
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
                        className="flex-1"
                        disabled={isSubmitting || isProcessingFiles}
                      >
                        Reset Data
                      </Button>
                    )}
                    <Button 
                      onClick={handleSubmit}
                      disabled={isSubmitting || !isReadyToProcess || isProcessingFiles}
                      className={`flex items-center gap-2 ${(parsedJobs.length > 0 || parsedSalesmen.length > 0) ? 'flex-1' : 'w-full'}`}
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
            </div>
          </TabsContent>

          <TabsContent value="results">
            {hasResults ? (
              <div className="space-y-4">
                {/* Map Component */}
                <Map data={resultRows} filteredData={filteredRows} />
                
                <Card>
                  <CardHeader>
                    <CardTitle>Job Assignment Results</CardTitle>
                    <CardDescription>
                      Showing {resultRows.length} job assignments - Filter, sort, and export the results
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DataTable 
                      data={resultRows} 
                      onExport={handleExport} 
                      onFilteredDataChange={handleFilteredDataChange}
                    />
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center p-12">
                <h3 className="text-lg font-medium">No results available</h3>
                <p className="text-muted-foreground">
                  Process your job and salesmen data to view assignment results
                </p>
                <Button 
                  onClick={() => setActiveTab('upload')}
                  className="mt-4"
                  variant="outline"
                >
                  Go to Upload Files
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t mt-12">
        <div className="container mx-auto py-6 text-center text-sm text-muted-foreground">
          Job Assignment Optimizer &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

// Import React components from UI library
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default Index;

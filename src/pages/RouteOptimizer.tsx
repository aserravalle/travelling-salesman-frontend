import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileUpload } from '@/components/RouteOptimizer/FileUpload';
import { RosterDataTable } from '@/components/RouteOptimizer/DataTables/RosterDataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { parseFile } from '@/lib/fileParser';
import { convertResponseToTableRows, exportTableToCSV, downloadCSV } from '@/lib/tableConverter';
import { readFile } from '@/lib/fileReader';
import { assignJobs } from '@/services/api.ts';
import { fadeIn } from '@/lib/motion';
import { Job, Salesman, RosterTableRow, RosterRequest } from '@/types/types';
import { Download } from 'lucide-react';
import Map from '@/components/RouteOptimizer/Map';
import StatusBanner from '@/components/RouteOptimizer/StatusBanner';
import { SalesmanDataTable } from '@/components/RouteOptimizer/DataTables/SalesmanDataTable';
import { JobDataTable } from '@/components/RouteOptimizer/DataTables/JobDataTable';
import { ReadyToProcessCard } from '../components/RouteOptimizer/ReadyToProcessCard.tsx';

const Index = () => {
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [parsedJobs, setParsedJobs] = useState<Job[]>([]);
  const [parsedSalesmen, setParsedSalesmen] = useState<Salesman[]>([]);
  const [resultRows, setResultRows] = useState<RosterTableRow[]>([]);
  const [filteredRows, setFilteredRows] = useState<RosterTableRow[]>([]);
  const [activeTab, setActiveTab] = useState('upload');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [responseStatus, setResponseStatus] = useState<'success' | 'error' | 'warning'>('success');

  const handleFilesSelected = async (files: File[]) => {
    setUploadedFiles(files);
    if (files.length === 0) {
      setParsedJobs([]);
      setParsedSalesmen([]);
      return;
    }

    setIsProcessingFiles(true);

    try {
      for (const file of files) {
        const readResult = await readFile(file);
        
        if (readResult.errors.length > 0) {
          readResult.errors.forEach(error => {
            toast({
              variant: "destructive",
              title: `Error reading ${file.name}`,
              description: error.message,
            });
          });
          
          if (readResult.data.length === 0) continue;
        }

        // Parse the data
        const parseResult = parseFile(readResult.data, file.name);
        
        if (parseResult.errors.length > 0) {
          parseResult.errors.forEach(error => {
            toast({
              variant: "destructive",
              title: `Error parsing ${file.name}`,
              description: error.message,
            });
          });
        }

        if (parseResult.type === 'unknown') {
          toast({
            variant: "destructive",
            title: "Unknown data format",
            description: `Could not determine if ${file.name} contains jobs or salesmen data`,
          });
          continue;
        }

        if (parseResult.skippedRows > 0) {
          toast({
            variant: "default",
            title: "Skipped rows",
            description: `${parseResult.skippedRows} row${parseResult.skippedRows > 1 ? 's were' : ' was'} skipped in ${file.name}`,
          });
        }

        if (parseResult.data.length > 0) {
          if (parseResult.type === 'job') {
            setParsedJobs(parseResult.data as Job[]);
            toast({
              title: "Jobs file processed",
              description: `Successfully parsed ${parseResult.data.length} jobs from ${file.name}`,
            });
          } else if (parseResult.type === 'salesman') {
            setParsedSalesmen(parseResult.data as Salesman[]);
            toast({
              title: "Salesmen file processed",
              description: `Successfully parsed ${parseResult.data.length} salesmen from ${file.name}`,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error processing files:", error);
      toast({
        variant: "destructive",
        title: "Error processing files",
        description: "An unexpected error occurred while processing your files",
      });
    } finally {
      setIsProcessingFiles(false);
    }
  };

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
      setFilteredRows(tableRows);
      setHasResults(true);
      setActiveTab('results');
      
      setResponseMessage(response.message);
      
      if (response.message.toLowerCase().includes('error')) {
        setResponseStatus('error');
      } else if (response.message.toLowerCase().includes('unassigned')) {
        setResponseStatus('warning');
      } else {
        setResponseStatus('success');
      }
      
      toast({
        title: "Jobs assigned successfully",
        description: response.message,
      });
    } catch (error) {
      console.error("Error assigning jobs:", error);
      setResponseMessage("Error occurred when assigning jobs");
      setResponseStatus('error');
      toast({
        variant: "destructive",
        title: "Error assigning jobs",
        description: "An error occurred while trying to assign jobs",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const handleFilteredDataChange = (data: RosterTableRow[]) => {
    setFilteredRows(data);
  };

  const isReadyToProcess = parsedJobs.length > 0 && parsedSalesmen.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950 dark:to-blue-950">
      <header className="border-b shadow-sm bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold tracking-tight text-sky-950 dark:text-sky-100 bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">Travelling Salesman</h1>
          <p className="text-muted-foreground mt-1">
            Get optimal delivery routes for your travelling salesmen
          </p>
        </div>
      </header>

      <main className="py-8 px-10">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-8"
        >
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center">
              <TabsList className="shadow-md">
                <TabsTrigger value="upload">Upload Files</TabsTrigger>
                <TabsTrigger value="results" disabled={!hasResults}>
                  Assignment Results
                </TabsTrigger>
              </TabsList>

              {activeTab === 'results' && (
                <Button 
                  variant="outline" 
                  onClick={handleExport}
                  className="flex items-center gap-2 shadow-sm hover:shadow"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
              )}
            </div>
          </div>

          <TabsContent value="upload" className="space-y-8">
            <div className="px-4">
              <div className="grid xl:grid-cols-[minmax(0,420px)_1fr] gap-8 max-xl:space-y-8">
                <motion.div
                  variants={fadeIn('up', 0.1)}
                  initial="hidden"
                  animate="show"
                  className="xl:sticky xl:top-8 xl:self-start w-full max-w-[420px] mx-auto"
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

                <div className="space-y-8">
                  {(parsedJobs.length > 0 || parsedSalesmen.length > 0) ? (
                    <>
                      {parsedSalesmen.length > 0 && (
                        <motion.div
                          variants={fadeIn('up', 0.2)}
                          initial="hidden"
                          animate="show"
                          className="rounded-md border shadow-md bg-white"
                        >
                          <SalesmanDataTable salesmen={parsedSalesmen} />
                        </motion.div>
                      )}

                      {parsedJobs.length > 0 && (
                        <motion.div
                          variants={fadeIn('up', 0.3)}
                          initial="hidden"
                          animate="show"
                          className="rounded-md border shadow-md bg-white"
                        >
                          <JobDataTable jobs={parsedJobs} />
                        </motion.div>
                      )}
                    </>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center border rounded-md bg-white/50 shadow-md">
                      <div className="text-center text-muted-foreground">
                        <p>No data detected yet</p>
                        <p className="text-sm">Upload your files to see the preview</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="container mx-auto px-4">
              <div className="flex justify-center">
                <ReadyToProcessCard 
                  isReadyToProcess={isReadyToProcess}
                  parsedJobs={parsedJobs}
                  parsedSalesmen={parsedSalesmen}
                  isSubmitting={isSubmitting}
                  isProcessingFiles={isProcessingFiles}
                  handleReset={handleReset}
                  handleSubmit={handleSubmit}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="results">
            {hasResults ? (
              <div className="space-y-4">
                <StatusBanner message={responseMessage} variant={responseStatus} />
                
                <Map data={resultRows} filteredData={filteredRows} />
                
                <Card className="shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-sky-100 to-blue-50 dark:from-sky-900/30 dark:to-blue-900/20">
                    <CardTitle>Roster</CardTitle>
                    <CardDescription>
                      Showing {resultRows.length} assignments - Filter, sort, and export the results
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mt-4">
                      <RosterDataTable 
                        data={resultRows} 
                        onExport={handleExport} 
                        onFilteredDataChange={handleFilteredDataChange}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center p-12 bg-white/50 rounded-lg shadow-md">
                <h3 className="text-lg font-medium">No results available</h3>
                <p className="text-muted-foreground">
                  Process your job and salesmen data to view assignment results
                </p>
                <Button 
                  onClick={() => setActiveTab('upload')}
                  className="mt-4 shadow-sm hover:shadow"
                  variant="outline"
                >
                  Go to Upload Files
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t mt-12 bg-white/50 backdrop-blur-sm shadow-md">
        <div className="container mx-auto py-6 text-center text-sm text-muted-foreground">
          Travelling Salesman &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default Index;
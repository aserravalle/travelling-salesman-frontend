import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import JobList from './components/JobList';
import SalesmanList from './components/SalesmanList';
import ResultDisplay from './components/ResultDisplay';
import { postJobAssignments } from './services/api';

const App = () => {
    const [jobs, setJobs] = useState([]);
    const [salesmen, setSalesmen] = useState([]);
    const [result, setResult] = useState(null);

    const handleFileUpload = (uploadedJobs, uploadedSalesmen) => {
        setJobs(uploadedJobs);
        setSalesmen(uploadedSalesmen);
    };

    const handleAssignJobs = async () => {
        const response = await postJobAssignments({ jobs, salesmen });
        setResult(response);
    };

    return (
        <div className="App">
            <h1>Travelling Salesman Problem Solver</h1>
            <FileUpload onUpload={handleFileUpload} />
            <button onClick={handleAssignJobs}>Assign Jobs</button>
            <JobList jobs={jobs} />
            <SalesmanList salesmen={salesmen} />
            {result && <ResultDisplay result={result} />}
        </div>
    );
};

export default App;
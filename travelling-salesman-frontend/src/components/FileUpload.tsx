import React, { useState } from 'react';

const FileUpload: React.FC = () => {
    const [jobsFile, setJobsFile] = useState<File | null>(null);
    const [salesmenFile, setSalesmenFile] = useState<File | null>(null);

    const handleJobsFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setJobsFile(event.target.files[0]);
        }
    };

    const handleSalesmenFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSalesmenFile(event.target.files[0]);
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!jobsFile || !salesmenFile) {
            alert('Please upload both Jobs and Salesmen files.');
            return;
        }

        const formData = new FormData();
        formData.append('jobs', jobsFile);
        formData.append('salesmen', salesmenFile);

        try {
            const response = await fetch('https://travelling-salesman-backend.com/assign_jobs', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            // Handle the result (e.g., pass it to a parent component or display it)
            console.log(result);
        } catch (error) {
            console.error('Error uploading files:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>
                    Upload Jobs File:
                    <input type="file" accept=".csv, .xlsx" onChange={handleJobsFileChange} />
                </label>
            </div>
            <div>
                <label>
                    Upload Salesmen File:
                    <input type="file" accept=".csv, .xlsx" onChange={handleSalesmenFileChange} />
                </label>
            </div>
            <button type="submit">Submit</button>
        </form>
    );
};

export default FileUpload;
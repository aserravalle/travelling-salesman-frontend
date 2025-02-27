import React from 'react';

interface Job {
    job_id: string;
    date: string;
    location: number[];
    duration_mins: number;
    entry_time: string;
    exit_time: string;
    salesman_id?: string | null;
    start_time?: string | null;
}

interface JobListProps {
    jobs: Job[];
}

const JobList: React.FC<JobListProps> = ({ jobs }) => {
    return (
        <div>
            <h2>Job List</h2>
            {jobs.length === 0 ? (
                <p>No jobs available.</p>
            ) : (
                <ul>
                    {jobs.map((job) => (
                        <li key={job.job_id}>
                            <strong>Job ID:</strong> {job.job_id}<br />
                            <strong>Date:</strong> {job.date}<br />
                            <strong>Location:</strong> {job.location.join(', ')}<br />
                            <strong>Duration:</strong> {job.duration_mins} mins<br />
                            <strong>Entry Time:</strong> {job.entry_time}<br />
                            <strong>Exit Time:</strong> {job.exit_time}<br />
                            {job.salesman_id && (
                                <>
                                    <strong>Assigned Salesman ID:</strong> {job.salesman_id}<br />
                                    <strong>Start Time:</strong> {job.start_time}<br />
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default JobList;
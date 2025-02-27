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

interface ResultDisplayProps {
    assignedJobs: Record<string, Job[]>;
    unassignedJobs: Job[];
    message: string;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ assignedJobs, unassignedJobs, message }) => {
    return (
        <div>
            <h2>Job Assignment Results</h2>
            <p>{message}</p>
            <h3>Assigned Jobs</h3>
            {Object.keys(assignedJobs).map(salesmanId => (
                <div key={salesmanId}>
                    <h4>Salesman ID: {salesmanId}</h4>
                    <ul>
                        {assignedJobs[salesmanId].map(job => (
                            <li key={job.job_id}>
                                Job ID: {job.job_id}, Date: {job.date}, Location: {job.location.join(', ')}, 
                                Duration: {job.duration_mins} mins, Entry Time: {job.entry_time}, 
                                Exit Time: {job.exit_time}, Start Time: {job.start_time}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
            <h3>Unassigned Jobs</h3>
            {unassignedJobs.length > 0 ? (
                <ul>
                    {unassignedJobs.map(job => (
                        <li key={job.job_id}>
                            Job ID: {job.job_id}, Date: {job.date}, Location: {job.location.join(', ')}, 
                            Duration: {job.duration_mins} mins, Entry Time: {job.entry_time}, 
                            Exit Time: {job.exit_time}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No unassigned jobs.</p>
            )}
        </div>
    );
};

export default ResultDisplay;
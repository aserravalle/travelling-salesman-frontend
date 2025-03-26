
import { RosterRequest, RosterResponse } from '@/types';
import { toast } from '@/components/ui/use-toast';

const VITE_API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT_PRODUCTION 
                        || import.meta.env.VITE_API_ENDPOINT_DEBUG 
                        || "http://localhost:8000";

export const assignJobs = async (data: RosterRequest): Promise<RosterResponse> => {
  try {
    const response = await fetch(`${VITE_API_ENDPOINT}/assign_jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } 
  catch (error) {
    console.error('Error assigning jobs:', error);
    toast({
      title: 'Error',
      description: 'Failed to assign jobs. Please try again.',
      variant: 'destructive',
    });
    
    return mockRosterResponse();
  }
};

// Mock response for development/preview
const mockRosterResponse = (): RosterResponse => {
  return {
    jobs: {
      "101": [
        {
          job_id: "1",
          date: "2025-02-05T09:00:00",
          location: [40.7128, -74.006],
          duration_mins: 60,
          entry_time: "2025-02-05T09:00:00",
          exit_time: "2025-02-05T12:00:00",
          salesman_id: "101",
          start_time: "2025-02-05T09:30:00"
        },
        {
          job_id: "3",
          date: "2025-02-05T11:00:00",
          location: [40.714, -74.005],
          duration_mins: 30,
          entry_time: "2025-02-05T11:30:00",
          exit_time: "2025-02-05T13:00:00",
          salesman_id: "101",
          start_time: "2025-02-05T11:30:00"
        },
        {
          job_id: "5",
          date: "2025-02-05T14:00:00",
          location: [40.711, -74.009],
          duration_mins: 45,
          entry_time: "2025-02-05T14:00:00",
          exit_time: "2025-02-05T16:30:00",
          salesman_id: "101",
          start_time: "2025-02-05T14:15:00"
        }
      ],
      "102": [
        {
          job_id: "2",
          date: "2025-02-05T10:00:00",
          location: [40.713, -74.0055],
          duration_mins: 45,
          entry_time: "2025-02-05T10:30:00",
          exit_time: "2025-02-05T14:00:00",
          salesman_id: "102",
          start_time: "2025-02-05T10:45:00"
        },
        {
          job_id: "4",
          date: "2025-02-05T12:00:00",
          location: [40.715, -74.0045],
          duration_mins: 90,
          entry_time: "2025-02-05T12:30:00",
          exit_time: "2025-02-05T15:00:00",
          salesman_id: "102",
          start_time: "2025-02-05T12:30:00"
        },
        {
          job_id: "6",
          date: "2025-02-05T15:00:00",
          location: [40.710, -74.012],
          duration_mins: 60,
          entry_time: "2025-02-05T15:00:00",
          exit_time: "2025-02-05T17:30:00",
          salesman_id: "102",
          start_time: "2025-02-05T15:15:00"
        },
        {
          job_id: "8",
          date: "2025-02-05T16:30:00",
          location: [40.709, -74.008],
          duration_mins: 45,
          entry_time: "2025-02-05T16:30:00",
          exit_time: "2025-02-05T18:00:00",
          salesman_id: "102",
          start_time: "2025-02-05T16:45:00"
        },
        {
          job_id: "10",
          date: "2025-02-05T17:45:00",
          location: [40.712, -74.007],
          duration_mins: 30,
          entry_time: "2025-02-05T17:45:00",
          exit_time: "2025-02-05T19:00:00",
          salesman_id: "102",
          start_time: "2025-02-05T18:00:00"
        }
      ]
    },
    unassigned_jobs: [
      {
        job_id: "7",
        date: "2025-02-05T16:00:00",
        location: [40.717, -74.002],
        duration_mins: 75,
        entry_time: "2025-02-05T16:00:00",
        exit_time: "2025-02-05T18:30:00",
        salesman_id: null,
        start_time: null
      },
      {
        job_id: "9",
        date: "2025-02-05T17:30:00",
        location: [40.718, -74.003],
        duration_mins: 60,
        entry_time: "2025-02-05T17:30:00",
        exit_time: "2025-02-05T19:30:00",
        salesman_id: null,
        start_time: null
      }
    ],
    message: "Roster completed with some jobs unassigned"
  };
};
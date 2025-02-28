import axios from 'axios';
import { ApiRequest, ApiResponse } from '../types';

const API_URL = 'https://travelling-salesman-backend.com/assign_jobs';

export const assignJobs = async (data: ApiRequest): Promise<ApiResponse> => {
  try {
    // For demo purposes, we'll simulate a successful response
    // In a real application, this would be:
    // const response = await axios.post(API_URL, data);
    // return response.data;
    
    // Simulated API response
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
            salesman_id: 101,
            start_time: "2025-02-05T09:30:00"
          },
          {
            job_id: "3",
            date: "2025-02-05T11:00:00",
            location: [40.714, -74.005],
            duration_mins: 30,
            entry_time: "2025-02-05T11:30:00",
            exit_time: "2025-02-05T13:00:00",
            salesman_id: 101,
            start_time: "2025-02-05T11:30:00"
          }
        ],
        "102": [
          {
            job_id: "4",
            date: "2025-02-05T12:00:00",
            location: [40.715, -74.0045],
            duration_mins: 90,
            entry_time: "2025-02-05T12:30:00",
            exit_time: "2025-02-05T15:00:00",
            salesman_id: 102,
            start_time: "2025-02-05T12:30:00"
          }
        ]
      },
      unassigned_jobs: [
        {
          job_id: "2",
          date: "2025-02-05T10:00:00",
          location: [40.713, -74.0055],
          duration_mins: 45,
          entry_time: "2025-02-05T10:30:00",
          exit_time: "2025-02-05T14:00:00",
          salesman_id: null,
          start_time: null
        }
      ],
      message: "Roster completed with some jobs unassigned"
    };
  } catch (error) {
    console.error('Error assigning jobs:', error);
    throw error;
  }
};
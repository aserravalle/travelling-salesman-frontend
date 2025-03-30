import { RosterRequest, RosterResponse } from "@/types/types";
import { toast } from '@/components/ui/use-toast';

const VITE_API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || "http://localhost:8000";

export const assignJobs = async (data: RosterRequest): Promise<RosterResponse> => {
  try {
    const response = await fetch(`${VITE_API_ENDPOINT}/assign_jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',  // Explicitly set CORS mode
      credentials: 'include',  // Include credentials if you're using cookies/auth
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(errorText);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
  } 
  catch (error) {
    console.error('Error assigning jobs:', error);
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to assign jobs. Please try again.',
      variant: 'destructive',
    });
    throw error;
  }
}; 
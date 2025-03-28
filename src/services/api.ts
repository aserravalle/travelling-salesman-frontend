
import { RosterRequest, RosterResponse } from "@/types/types";
import { toast } from '@/components/ui/use-toast';

const VITE_API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || "http://localhost:8000";

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
  }
};
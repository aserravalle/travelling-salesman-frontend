import axios from 'axios';

const API_URL = 'https://travelling-salesman-backend.com/assign_jobs';

export const assignJobs = async (data) => {
    try {
        const response = await axios.post(API_URL, data);
        return response.data;
    } catch (error) {
        throw new Error('Error assigning jobs: ' + error.message);
    }
};
// frontend/src/services/simulationApi.ts
import api from './api'; 

interface ScanPayload {
    quantity?: number;
    unit?: string;
    // Add other potential payload fields here
}

interface SimulateScanParams {
    tag_number: string;
    location_id: string;
    payload?: ScanPayload;
    timestamp?: string; // ISO format ideally
}

// Define a more specific response type if possible, or use a generic one
interface SimulationResponse {
    message: string;
    returnLog?: any;
    yield?: any;
    animal?: any;
    [key: string]: any; // Allow for other potential data
}

export const simulationApi = {
    simulateScan: async (params: SimulateScanParams): Promise<SimulationResponse> => {
        console.log('Sending simulation scan request:', params); // Log the request being sent
        try {
            const response = await api.post<SimulationResponse>('/simulate/scan', params);
            console.log('Simulation scan response:', response.data); // Log the successful response
            return response.data;
        } catch (error: any) {
            console.error('Error during simulation scan:', error.response?.data || error.message); // Log the error details
            
            // Provide more detailed error information
            if (error.response?.status === 404) {
                throw new Error('Animal not found in your farm. Please check the tag number.');
            } else if (error.response?.status === 400) {
                throw new Error(error.response?.data?.message || 'Invalid request data');
            } else if (error.response?.status === 403) {
                throw new Error('You do not have permission to perform this simulation');
            } else if (error.response?.status === 500) {
                throw new Error('Server error occurred during simulation');
            } else {
                throw error.response?.data || new Error('Simulation scan failed'); 
            }
        }
    }
};

export default simulationApi; 
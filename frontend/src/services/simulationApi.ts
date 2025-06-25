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
    [key: string]: any; // Allow for other potential data like animal, returnLog, yield
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
            // Re-throw the error so the component can handle it (e.g., show a toast)
            throw error.response?.data || new Error('Simulation scan failed'); 
        }
    }
};

export default simulationApi; 
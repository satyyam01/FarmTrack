import axios from 'axios';
import { Animal, AnimalFormData } from '../types/animal';

const API_URL = 'http://localhost:3000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper function to transform API data to frontend format
const transformApiToFrontend = (apiData: any): Animal => {
  return {
    id: apiData.id,
    name: apiData.name,
    tag_number: apiData.tag_number,
    age: apiData.age,
    gender: apiData.gender,
    type: apiData.type,
    is_producing_yield: apiData.is_producing_yield,
    created_at: apiData.created_at,
    updated_at: apiData.updated_at
  };
};

// Helper function to transform frontend data to API format
const transformFrontendToApi = (frontendData: AnimalFormData): any => {
  return {
    name: frontendData.name,
    tag_number: frontendData.tag_number,
    age: Number(frontendData.age),
    gender: frontendData.gender,
    type: frontendData.type,
    is_producing_yield: frontendData.is_producing_yield || false
  };
};

// Animal API endpoints
export const animalApi = {
  getAll: async (): Promise<Animal[]> => {
    const response = await api.get('/animals');
    return response.data.map(transformApiToFrontend);
  },
  
  getById: async (id: string): Promise<Animal> => {
    const response = await api.get(`/animals/${id}`);
    return transformApiToFrontend(response.data);
  },
  
  create: async (data: AnimalFormData): Promise<Animal> => {
    const apiData = transformFrontendToApi(data);
    console.log('Sending data to API:', apiData);
    const response = await api.post('/animals', apiData);
    console.log('API response:', response.data);
    return transformApiToFrontend(response.data);
  },
  
  update: async (id: string, data: AnimalFormData): Promise<Animal> => {
    const apiData = transformFrontendToApi(data);
    const response = await api.put(`/animals/${id}`, apiData);
    return transformApiToFrontend(response.data);
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/animals/${id}`);
  }
};

// Auth API endpoints
export const authApi = {
  login: async (email: string, password: string): Promise<{ token: string, user: any }> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (name: string, email: string, password: string): Promise<{ token: string, user: any }> => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  }
};

// Return Log Types
export interface ReturnLog {
  id: number;
  animal_id: number;
  date: string;
  returned: boolean;
  return_reason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReturnLogData {
  animal_id: number;
  date: string;
  returned: boolean;
  return_reason?: string;
}

// Return Log API Methods
export const returnLogApi = {
  getAll: async (): Promise<ReturnLog[]> => {
    const response = await api.get('/return-logs');
    return response.data;
  },

  getByDate: async (date: string): Promise<ReturnLog[]> => {
    const response = await api.get(`/return-logs?date=${date}`);
    // Ensure we're getting an array of return logs
    return Array.isArray(response.data) ? response.data : [];
  },

  create: async (data: CreateReturnLogData): Promise<ReturnLog> => {
    const response = await api.post('/return-logs', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateReturnLogData>): Promise<ReturnLog> => {
    const response = await api.put(`/return-logs/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/return-logs/${id}`);
  },

  getByAnimal: async (animalId: number): Promise<ReturnLog[]> => {
    const response = await api.get(`/return-logs/animal/${animalId}`);
    return response.data;
  }
};

export default api;

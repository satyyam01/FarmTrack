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

// Function to update token in axios instance
export const updateApiToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

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

// Add response interceptor to handle errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 404:
          console.error('Resource not found:', data?.message || 'The requested resource was not found');
          break;
        case 401:
          console.error('Unauthorized:', data?.error || 'Authentication required');
          const currentPath = window.location.pathname;
          if (!currentPath.includes('/farm-registration') && !currentPath.includes('/register')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
          break;
        case 403:
          console.error('Forbidden:', data?.error || 'You do not have permission to access this resource');
          
          // Handle specific case for admin users who need to register their farm
          if (data?.error === 'Please register your farm first') {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user.role === 'admin' && !user.farm_id) {
              console.log('Admin user needs to register farm, redirecting to /register');
              window.location.href = '/register';
              return Promise.reject(error);
            }
          }
          break;
        case 500:
          console.error('Server error:', data?.error || 'Something went wrong on the server');
          break;
        default:
          console.error(`HTTP ${status}:`, data?.error || 'An error occurred');
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network error:', 'No response received from server');
    } else {
      // Something else happened
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Helper function to transform API data to frontend format
const transformApiToFrontend = (apiData: any): Animal => {
  return {
    id: apiData._id || apiData.id,
    name: apiData.name,
    tag_number: apiData.tag_number,
    age: apiData.age,
    gender: apiData.gender,
    type: apiData.type,
    is_producing_yield: apiData.is_producing_yield,
    under_treatment: apiData.under_treatment,
    created_at: apiData.createdAt || apiData.created_at,
    updated_at: apiData.updatedAt || apiData.updated_at
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
    is_producing_yield: frontendData.is_producing_yield || false,
    under_treatment: frontendData.under_treatment || false
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
    const response = await api.post('/animals', apiData);
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
  
  register: async (name: string, email: string, password: string, role: string, farm_id?: string): Promise<{ message: string, user: any }> => {
    const response = await api.post('/auth/register', { name, email, password, role, farm_id });
    return response.data;
  },

  createFarm: async (name: string, location: string): Promise<{ message: string, farm: any, user: any, token?: string }> => {
    const response = await api.post('/farms', { name, location });
    return response.data;
  },

  getFarms: async (): Promise<any[]> => {
    const response = await api.get('/farms');
    return response.data;
  },

  getFarmById: async (farmId: string): Promise<any> => {
    const response = await api.get(`/farms/${farmId}`);
    return response.data;
  },

  updateProfile: async (name: string, email: string): Promise<{ message: string, user: any, token: string }> => {
    const response = await api.put('/auth/profile', { name, email });
    return response.data;
  },

  updateFarm: async (farmId: string, name: string, location: string): Promise<{ message: string, farm: any }> => {
    const response = await api.put(`/farms/${farmId}`, { name, location });
    return response.data;
  },

  deleteAccount: async (): Promise<{ message: string, deletedUser: any }> => {
    const response = await api.delete('/auth/account');
    return response.data;
  },

  deleteFarm: async (farmId: string, deleteProfile: boolean): Promise<{ message: string, deletedFarm: boolean, deletedProfile: boolean }> => {
    const response = await api.delete(`/farms/${farmId}`, { data: { deleteProfile } });
    return response.data;
  }
};

// Return Log Types
export interface ReturnLog {
  id?: number;
  _id?: string;
  animal_id: number | string | { _id: string };
  date: string;
  returned: boolean;
  return_reason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReturnLogData {
  animal_id: number | string;
  date: string;
  returned: boolean;
  return_reason?: string;
}

// Return Log API Methods
export const returnLogApi = {
  getAll: async (): Promise<ReturnLog[]> => {
    const response = await api.get('/returnlogs');
    return response.data;
  },

  getByDate: async (date: string): Promise<ReturnLog[]> => {
    const response = await api.get(`/returnlogs?date=${date}`);
    // Ensure we're getting an array of return logs
    return Array.isArray(response.data) ? response.data : [];
  },

  create: async (data: CreateReturnLogData): Promise<ReturnLog> => {
    const response = await api.post('/returnlogs', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateReturnLogData>): Promise<ReturnLog> => {
    const response = await api.put(`/returnlogs/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/returnlogs/${id}`);
  },

  getByAnimal: async (animalId: string): Promise<ReturnLog[]> => {
    const response = await api.get(`/returnlogs/animal/${animalId}`);
    return response.data;
  }
};

// Alert API Methods
export const alertApi = {
  triggerFencingAlert: async (tagNumber: string): Promise<{ message: string; notification: any }> => {
    const response = await api.post('/alerts/fencing', { tag_number: tagNumber });
    return response.data;
  },

  runBarnCheck: async (): Promise<{ message: string; alerts: any[] }> => {
    const response = await api.get('/alerts/barn-check');
    return response.data;
  }
};

export const chatbotApi = {
  sendMessage: async (question: string): Promise<string> => {
    const response = await api.post('/chatbot/ask', { question });
    return response.data.answer;
  }
};

export default api;

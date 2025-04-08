import { Yield, YieldFormData, YieldOverview, YieldType } from "../types/yield";
import api from "./api";

export const yieldApi = {
  getAll: async (type?: YieldType, startDate?: string, endDate?: string) => {
    try {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await api.get<Yield[]>(`/yields?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching yields:', error);
      throw error;
    }
  },

  getOverview: async (type?: YieldType) => {
    try {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      
      const response = await api.get<YieldOverview>(`/yields/overview?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching yield overview:', error);
      throw error;
    }
  },

  create: async (data: YieldFormData) => {
    try {
      const response = await api.post<Yield>('/yields', data);
      return response.data;
    } catch (error) {
      console.error('Error creating yield:', error);
      throw error;
    }
  },

  update: async (id: string, data: YieldFormData) => {
    try {
      const response = await api.put<Yield>(`/yields/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating yield:', error);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      await api.delete(`/yields/${id}`);
    } catch (error) {
      console.error('Error deleting yield:', error);
      throw error;
    }
  },

  clearAll: async () => {
    try {
      await api.delete('/yields/clear/all');
    } catch (error) {
      console.error('Error clearing yields:', error);
      throw error;
    }
  }
}; 
import { Yield, YieldFormData, YieldOverview, YieldType } from "../types/yield";
import api from "./api";

export const yieldApi = {
  getAll: async (type?: YieldType, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get<Yield[]>(`/yields?${params.toString()}`);
    return response.data;
  },

  getOverview: async (type?: YieldType) => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    
    const response = await api.get<YieldOverview>(`/yields/overview?${params.toString()}`);
    return response.data;
  },

  create: async (data: YieldFormData) => {
    const response = await api.post<Yield>('/yields', data);
    return response.data;
  },

  update: async (id: string, data: YieldFormData) => {
    const response = await api.put<Yield>(`/yields/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/yields/${id}`);
  },

  clearAll: async () => {
    await api.delete('/yields/clear/all');
  }
}; 
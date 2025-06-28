import api from "./api";

export interface Setting {
  key: string;
  value: string;
}

export const settingsApi = {
  // Get all settings
  getAll: async (): Promise<Record<string, string>> => {
    try {
      const response = await api.get<Record<string, string>>('/settings');
      return response.data;
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
  },

  // Get a specific setting
  get: async (key: string): Promise<Setting> => {
    try {
      const response = await api.get<Setting>(`/settings/${key}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching setting:', error);
      throw error;
    }
  },

  // Update a setting
  update: async (key: string, value: string): Promise<Setting> => {
    try {
      const response = await api.put<Setting>(`/settings/${key}`, { value });
      return response.data;
    } catch (error) {
      console.error('Error updating setting:', error);
      throw error;
    }
  },

  // Get night check schedule specifically
  getNightCheckSchedule: async (): Promise<{ schedule: string }> => {
    try {
      const response = await api.get<{ schedule: string }>('/settings/night-check/schedule');
      return response.data;
    } catch (error) {
      console.error('Error fetching night check schedule:', error);
      throw error;
    }
  },

  // Update night check schedule
  updateNightCheckSchedule: async (schedule: string): Promise<{ schedule: string; message: string }> => {
    try {
      const response = await api.put<{ schedule: string; message: string }>('/settings/night-check/schedule', { schedule });
      return response.data;
    } catch (error) {
      console.error('Error updating night check schedule:', error);
      throw error;
    }
  }
}; 
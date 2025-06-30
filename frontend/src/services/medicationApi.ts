import api from './api';

export const medicationApi = {
  getByAnimal: async (animalId: string) => {
    const response = await api.get(`/medications/animal/${animalId}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/medications', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/medications/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/medications/${id}`);
  }
};

export default medicationApi; 
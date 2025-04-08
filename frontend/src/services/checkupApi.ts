import api from './api';

export const checkupApi = {
  getByAnimal: async (animalId: number) => {
    const response = await api.get(`/checkups/animal/${animalId}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/checkups', data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/checkups/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`/checkups/${id}`);
  }
};

export default checkupApi; 
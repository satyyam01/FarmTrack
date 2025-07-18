import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/api/verify';

const verificationApi = {
  sendOTP: async (data: { name: string; email: string; password: string; role: string; farm_id?: string }) => {
    const response = await axios.post(`${API_URL}/send-otp`, data);
    return response.data;
  },
  verifyOTP: async (data: { email: string; otp: string }) => {
    const response = await axios.post(`${API_URL}/confirm`, data);
    return response.data;
  },
};

export default verificationApi; 

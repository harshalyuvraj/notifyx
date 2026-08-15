import axios from 'axios';

const NEXT_PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export const getProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

export default api;
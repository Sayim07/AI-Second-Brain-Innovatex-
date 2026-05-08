import axios from 'axios';
import toast from 'react-hot-toast';
import { auth } from './firebase';
import { signOut } from 'firebase/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use(async (config) => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    const token = await currentUser.getIdToken();
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    if (status === 401) {
      try {
        await signOut(auth);
      } catch (signOutError) {
        void signOutError;
      }
      toast.error('Session expired. Please sign in.');
      window.location.href = '/auth';
      return Promise.reject(error);
    }

    if (status === 503) {
      toast.error('AI service is temporarily unavailable. Please try again in a moment.');
    } else if (status === 429) {
      toast.error('Too many requests. Please wait 30 seconds.');
    } else if (!error.response) {
      toast.error('Check your internet connection.');
    }

    return Promise.reject(error);
  }
);

export default api;

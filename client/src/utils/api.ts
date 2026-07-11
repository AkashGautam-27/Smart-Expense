import axios from 'axios';

const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically append authorization token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smartspend_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

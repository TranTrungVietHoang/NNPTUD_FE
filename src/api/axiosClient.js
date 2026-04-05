import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: tự động gắn token vào header
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: xử lý lỗi 401 (token hết hạn)
axiosClient.interceptors.response.use(
  (response) => {
    // BE có thể trả về string (vd: login trả về raw token) hoặc object
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    // Trả về lỗi dưới dạng string hoặc object tùy BE
    const errData = error.response?.data;
    if (typeof errData === 'string') {
      return Promise.reject(new Error(errData));
    }
    return Promise.reject(errData || error);
  }
);

export default axiosClient;

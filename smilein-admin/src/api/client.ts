import axios, { AxiosInstance } from 'axios';

const apiClient: AxiosInstance = axios.create({
  baseURL: 'https://web-production-b963.up.railway.app',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

// Request interceptor untuk menambahkan token auth
apiClient.interceptors.request.use( 
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor untuk menangani error umum
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Tangani error umum TANPA redirect paksa
    if (error.response) {
      if (error.response.status === 401) {
        // Hapus token, tapi jangan redirect
        localStorage.removeItem('token');
        // Lempar error agar bisa ditangani di komponen
        return Promise.reject({
          ...error,
          message: 'Unauthorized: Login gagal'
        });
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const instance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor for handling 401 errors and token refresh
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Không refresh token cho các request đăng nhập/logout/refresh
    if (originalRequest.url === '/login' || originalRequest.url === '/logout' || originalRequest.url === '/refresh') {
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        console.log('Token expired, attempting refresh...');
        // Try to refresh token using the refresh_token cookie
        await axios.post(`${API_URL}/refresh`, {}, {
          withCredentials: true
        });
        
        console.log('Token refresh successful, retrying original request');
        // After successful refresh, retry the original request
        return instance(originalRequest);
      } catch (err) {
        console.error('Token refresh failed in interceptor:', err);
        // Xóa cookie và localStorage thay vì redirect trực tiếp
        document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        localStorage.removeItem('chatUser');
        // Không redirect ở đây - để component xử lý việc redirect
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

export default instance;

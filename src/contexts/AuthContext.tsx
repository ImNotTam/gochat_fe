import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/user';
import * as authApi from '../api/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking authentication status...');
        
        // Kiểm tra access token trong cookie
        const cookies = document.cookie.split(';');
        let jwtToken = null;
        
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          if (cookie.startsWith('jwt=')) {
            jwtToken = cookie.substring(4);
            break;
          }
        }
        
        // Nếu không có JWT token trong cookie, kiểm tra localStorage
        const savedUser = localStorage.getItem('chatUser');
        
        if (!jwtToken && !savedUser) {
          console.log('No authentication found in cookies or localStorage');
          setLoading(false);
          return;
        }
        
        if (jwtToken) {
          console.log('Found JWT token in cookies, attempting to refresh...');
        } else if (savedUser) {
          console.log('Found saved user in localStorage, attempting to validate...');
        }
        
        // Thử refresh token
        const userData = await authApi.refreshToken();
        console.log('Token refresh successful:', userData);
        
        if (userData && userData.id) {
          const user = {
            id: userData.id,
            username: userData.username
          };
          setUser(user);
          
          // Lưu thông tin user vào localStorage để phòng khi cookie bị xóa
          localStorage.setItem('chatUser', JSON.stringify(user));
        } else {
          console.error('Invalid user data received from refresh token');
          setUser(null);
          localStorage.removeItem('chatUser');
        }
      } catch (err) {
        console.error('Authentication check failed:', err);
        // Xóa cookie và localStorage nếu token refresh thất bại
        document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        localStorage.removeItem('chatUser');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.login({ email, password });
      setUser({
        id: response.id,
        username: response.username
      });
      setError(null);
    } catch (err: any) {
      setUser(null);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('An error occurred during login');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await authApi.register({ username, email, password });
      await login(email, password);
    } catch (err: any) {
      setUser(null);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('An error occurred during registration');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authApi.logout();
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { BASE_URL } from '../utils/constants';
// Create a global navigation reference to use outside of components
export let navigationRef: any = null;

export const setNavigationRef = (ref: any) => {
  navigationRef = ref;
};

const API_URL = Platform.OS === 'android'
  ? BASE_URL
  : BASE_URL;

interface UserInfo {
  username: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: (showExpiredMessage?: boolean) => Promise<void>;
  token: string | null;
  userInfo: UserInfo | null;
  isLoading: boolean;
  sessionExpiredMessage: string | null;
  clearSessionExpiredMessage: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState<string | null>(null);

  // Create axios instance
  const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
  });

  // Set up request interceptor
  useEffect(() => {
    if (token) {
      // Configure request interceptor
      axiosInstance.interceptors.request.use(
        (config) => {
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          return config;
        },
        (error) => {
          return Promise.reject(error);
        }
      );

      // Configure response interceptor
      axiosInstance.interceptors.response.use(
        (response) => {
          return response;
        },
        async (error) => {
          // Handle token expiration
          if (
            error.response &&
            (error.response.status === 401 ||
              error.response.status === 403 ||
              (error.response.data && error.response.data.detail === 'Could not validate credentials'))
          ) {
            // Token is expired or invalid
            await handleSessionExpiration('Sesi Anda telah berakhir. Silakan login kembali.');
          }
          return Promise.reject(error);
        }
      );
    }
  }, [token]);

  const handleSessionExpiration = async (message: string) => {
    setSessionExpiredMessage(message);
    await logout(true);

    // Navigate to login screen if navigation reference is available
    if (navigationRef) {
      navigationRef.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        })
      );
    }
  };

  const clearSessionExpiredMessage = () => {
    setSessionExpiredMessage(null);
  };

  useEffect(() => {
    const checkToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        const storedUserInfo = await AsyncStorage.getItem('userInfo');

        if (storedToken && storedUserInfo) {
          setToken(storedToken);
          setUserInfo(JSON.parse(storedUserInfo));
          setIsAuthenticated(true);

          // Validate token on app startup
          validateToken(storedToken);
        }
      } catch (error) {
        console.log('Error checking token: ', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, []);

  // Validate token by making a test request
  const validateToken = async (currentToken: string) => {
    try {
      // Replace with your actual endpoint to validate token
      await axios.get(`${API_URL}/api/validate-token`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });
      // If request succeeds, token is valid
      return true;
    } catch (error) {
      if (axios.isAxiosError(error) &&
        (error.response?.status === 401 || error.response?.status === 403)) {
        // Token is invalid or expired
        await handleSessionExpiration('Sesi Anda telah berakhir. Silakan login kembali.');
        return false;
      }
      // Other errors don't invalidate the token
      return true;
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await axios.post(`${API_URL}/token`, formData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000,
      });

      if (response.data && response.data.access_token) {
        const userToken = response.data.access_token;
        const userData: UserInfo = response.data.user_info || { username };

        await AsyncStorage.setItem('authToken', userToken);
        await AsyncStorage.setItem('userInfo', JSON.stringify(userData));

        setToken(userToken);
        setUserInfo(userData);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Request details:', {
          url: `${API_URL}/token`,
          message: error.message,
          code: error.code,
          response: error.response?.data,
        });
      }
      return false;
    }
  };

  const logout = async (showExpiredMessage: boolean = false): Promise<void> => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userInfo');

      setToken(null);
      setUserInfo(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        token,
        userInfo,
        isLoading,
        sessionExpiredMessage,
        clearSessionExpiredMessage,
      }}>
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

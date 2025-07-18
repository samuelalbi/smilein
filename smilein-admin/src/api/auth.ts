// src/api/auth.ts

import apiClient from './client';

interface LoginCredentials {
  username: string;
  password: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  user_type: string;
}

export const login = async (credentials: LoginCredentials): Promise<TokenResponse> => {
  // For login, we need to send form data
  const formData = new URLSearchParams();
  formData.append('username', credentials.username);
  formData.append('password', credentials.password);
  
  const response = await apiClient.post<TokenResponse>('/token', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  
  return response.data;
};

export const storeAuthToken = (tokenResponse: TokenResponse): void => {
  localStorage.setItem('token', tokenResponse.access_token);
  localStorage.setItem('userType', tokenResponse.user_type);
};

export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('userType');
};

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');
  
  // Cek token dan user type
  return !!token && !!userType;
};

export const getUserType = (): string | null => {
  return localStorage.getItem('userType');
};
import axios, { AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
// IMPORTANT: Choose the correct URL based on how you're testing:

// Option 1: Testing on Mac (iOS Simulator or Expo Go)
const API_BASE_URL = 'http://localhost:5000';

// Option 2: Testing in Android Emulator (virtual device on computer)
// const API_BASE_URL = 'http://10.0.2.2:5000';

// Option 3: Testing on Real Device (uncomment line below and replace YOUR_COMPUTER_IP)
// const API_BASE_URL = 'http://YOUR_COMPUTER_IP:5000';

// To find YOUR_COMPUTER_IP:
// 1. Mac: Open Terminal → type "ifconfig en0 | grep inet" → look for "inet" address
// 2. Windows: Open Command Prompt → type "ipconfig" → look for "IPv4 Address"  
// 3. Linux: Open Terminal → type "hostname -I"
// Example: if your computer's IP is 192.168.1.45, use 'http://192.168.1.45:5000'

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for session cookies
});

// Types for API responses
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  schoolId?: number;
  isActive: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  message: string;
}

export interface ApiError {
  message: string;
  error?: string;
}

// API Service Class
class ApiService {
  // Authentication Methods
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response: AxiosResponse<LoginResponse> = await apiClient.post(
        '/api/auth/login',
        credentials
      );
      
      // Store user data locally
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/auth/logout');
      // Clear local storage
      await AsyncStorage.removeItem('user');
    } catch (error: any) {
      // Even if API call fails, clear local data
      await AsyncStorage.removeItem('user');
      throw this.handleError(error);
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response: AxiosResponse<User> = await apiClient.get('/api/auth/me');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    schoolId?: number;
  }): Promise<LoginResponse> {
    try {
      const response: AxiosResponse<LoginResponse> = await apiClient.post(
        '/api/auth/register',
        userData
      );
      
      // Store user data locally
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Dashboard Data Methods
  async getDashboardData(userId: number): Promise<any> {
    try {
      const response = await apiClient.get(`/api/users/${userId}/dashboard`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getStudentGrades(studentId: number): Promise<any[]> {
    try {
      const response = await apiClient.get(`/api/students/${studentId}/grades`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getAttendance(userId: number, dateRange?: { start: string; end: string }): Promise<any[]> {
    try {
      const params = dateRange ? `?start=${dateRange.start}&end=${dateRange.end}` : '';
      const response = await apiClient.get(`/api/users/${userId}/attendance${params}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Utility Methods
  private handleError(error: any): ApiError {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.message || 'An error occurred',
        error: error.response.data?.error
      };
    } else if (error.request) {
      // Network error
      return {
        message: 'Network error. Please check your connection.'
      };
    } else {
      // Other error
      return {
        message: error.message || 'An unexpected error occurred'
      };
    }
  }

  // Local Storage Helpers
  async getStoredUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const user = await this.getStoredUser();
      if (!user) return false;
      
      // Verify with server
      await this.getCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default new ApiService();
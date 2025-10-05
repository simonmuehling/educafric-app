import axios, {AxiosInstance} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_BASE_URL = __DEV__
  ? 'http://10.0.2.2:5000' // Android emulator (for local testing, change to your computer's IP for physical devices)
  : 'https://educafric.com'; // Production domain

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'Director' | 'Teacher' | 'Student' | 'Parent' | 'Freelancer' | 'Commercial' | 'SiteAdmin';
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

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await this.client.post<LoginResponse>(
        '/api/auth/login',
        credentials,
      );
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/api/auth/logout');
      await AsyncStorage.removeItem('user');
    } catch (error: any) {
      await AsyncStorage.removeItem('user');
      throw this.handleError(error);
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await this.client.get<User>('/api/auth/me');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Storage helpers
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
      await this.getCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Error handling
  private handleError(error: any): Error {
    if (error.response) {
      return new Error(error.response.data?.message || 'Server error');
    } else if (error.request) {
      return new Error('Network error. Please check your connection.');
    } else {
      return new Error(error.message || 'An unexpected error occurred');
    }
  }
}

export default new ApiService();

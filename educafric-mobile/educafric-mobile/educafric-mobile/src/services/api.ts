import axios, {AxiosInstance} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';

const API_BASE_URL = __DEV__
  ? Platform.OS === 'android'
    ? 'http://10.0.2.2:5000'
    : 'http://localhost:5000'
  : 'https://educafric.com';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  schoolId?: number;
  isActive: boolean;
}

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      headers: {'Content-Type': 'application/json'},
      withCredentials: true,
    });
  }

  async login(email: string, password: string): Promise<{user: User}> {
    const response = await this.client.post('/api/auth/login', {email, password});
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  }

  async logout(): Promise<void> {
    await this.client.post('/api/auth/logout');
    await AsyncStorage.removeItem('user');
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get('/api/auth/me');
    return response.data;
  }

  async deleteAccount(): Promise<void> {
    await this.client.delete('/api/auth/delete-account');
    await AsyncStorage.removeItem('user');
  }

  async getStoredUser(): Promise<User | null> {
    const userData = await AsyncStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }
}

export default new ApiService();

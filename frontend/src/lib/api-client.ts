// API client for backend authentication endpoints
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface SignupData {
  name: string;
  email: string;
  password: string;
  country: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
  companyId: number;
  isActive: boolean;
  isTempPassword: boolean;
  createdAt: string;
  updatedAt?: string;
  managers?: Array<{
    id: number;
    name: string;
    email: string;
    role: string;
  }>;
}

export interface Company {
  id: number;
  name: string;
  country: string;
  currency: {
    code: string;
    symbol: string;
  };
}

export interface AuthResponse {
  access_token: string;
  user: User;
  company: Company;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Get token from localStorage if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'An error occurred',
          statusCode: response.status,
        }));
        throw errorData as ApiError;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError) {
        throw {
          message: 'Network error. Please check your connection.',
          statusCode: 0,
        } as ApiError;
      }
      throw error;
    }
  }

  // Authentication endpoints
  async signup(data: SignupData): Promise<{ message: string; companyId: number; userId: number; company: Company }> {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginData): Promise<AuthResponse> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    return this.request('/auth/change-password', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // User management endpoints
  async getUsers(): Promise<{ users: User[]; total: number }> {
    return this.request('/users');
  }

  async createUser(data: CreateUserData): Promise<{ 
    message: string; 
    user: User; 
    tempPassword?: string;
    emailError?: string;
  }> {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserProfile(): Promise<User & { company: Company }> {
    return this.request('/users/profile');
  }

  async updateUserStatus(userId: number, isActive: boolean): Promise<{ 
    message: string; 
    user: User; 
    emailSent?: boolean; 
    emailError?: string; 
  }> {
    return this.request(`/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  }

  async updateUserRole(userId: number, role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE'): Promise<{
    message: string;
    user: User;
  }> {
    return this.request(`/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  // Manager-Employee Relationships
  async assignManager(employeeId: number, managerId: number): Promise<{
    message: string;
    relation: {
      id: number;
      employeeId: number;
      managerId: number;
      employee: { id: number; name: string; email: string; role: string };
      manager: { id: number; name: string; email: string; role: string };
    };
  }> {
    return this.request(`/users/${employeeId}/manager/${managerId}`, {
      method: 'POST',
    });
  }

  async removeManager(employeeId: number, managerId: number): Promise<{
    message: string;
  }> {
    return this.request(`/users/${employeeId}/manager/${managerId}`, {
      method: 'DELETE',
    });
  }

  async getUserManagers(userId: number): Promise<Array<{
    id: number;
    employeeId: number;
    managerId: number;
    manager: { id: number; name: string; email: string; role: string };
  }>> {
    return this.request(`/users/${userId}/managers`);
  }

  async getUserEmployees(managerId: number): Promise<Array<{
    id: number;
    employeeId: number;
    managerId: number;
    employee: { id: number; name: string; email: string; role: string };
  }>> {
    return this.request(`/users/${managerId}/employees`);
  }

  // Token management
  setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  removeAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }
}

export const apiClient = new ApiClient();
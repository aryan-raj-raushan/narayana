import api from './api';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
}

export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface AddressData {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault?: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  addresses: AddressData[];
  isActive: boolean;
  lastLoginAt?: Date;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

class UserService {
  async register(data: RegisterData): Promise<AuthResponse> {
    return await api.post<AuthResponse>('/user/register', data);
  }

  async login(data: LoginData): Promise<AuthResponse> {
    return await api.post<AuthResponse>('/user/login', data);
  }

  async getProfile(): Promise<User> {
    return await api.get<User>('/user/profile');
  }

  async updateProfile(data: UpdateProfileData): Promise<User> {
    return await api.patch<User>('/user/profile', data);
  }

  async changePassword(data: UpdatePasswordData): Promise<{ message: string }> {
    return await api.post<{ message: string }>('/user/change-password', data);
  }

  // Address Management
  async addAddress(data: AddressData): Promise<User> {
    return await api.post<User>('/user/address', data);
  }

  async updateAddress(index: number, data: AddressData): Promise<User> {
    return await api.patch<User>(`/user/address/${index}`, data);
  }

  async deleteAddress(index: number): Promise<User> {
    return await api.delete<User>(`/user/address/${index}`);
  }

  async setDefaultAddress(index: number): Promise<User> {
    return await api.post<User>(`/user/address/${index}/set-default`, {});
  }

  async logout(): Promise<{ message: string }> {
    return await api.post<{ message: string }>('/user/logout', {});
  }
}

export default new UserService();

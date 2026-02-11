// src/api/authApi.ts
import { publicApi, authApi as tokenApi } from './axios';
import type { AuthResponse, LoginRequest, LoginResult } from '../types/auth';

export const authService = {
  // 1. 로그인 (토큰 X)
  login: async (data: LoginRequest) => {
    const response = await publicApi.post<AuthResponse<LoginResult>>('/api/v1/auth/login', data);
    return response.data;
  },

  // 2. 로그아웃 (토큰 O)
  logout: async () => {
    const response = await tokenApi.post<AuthResponse<null>>('/api/v1/auth/logout');
    return response.data;
  }
};
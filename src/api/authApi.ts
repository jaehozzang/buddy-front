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
  },

  // ✨ 소셜 로그인 연동 API 추가 (에러 해결! publicApi 사용)
  // 로그인과 똑같이 AuthResponse<LoginResult> 형태를 반환하므로 타입도 맞춰주면 좋습니다!
  linkOAuth: async (data: { email: string; provider: string; oauthId: string }) => {
    const response = await publicApi.post<AuthResponse<LoginResult>>('/api/v1/auth/oauth-link', data);
    return response.data;
  },
};
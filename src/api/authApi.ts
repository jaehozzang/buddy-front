// src/api/authApi.ts

// 1. axios.ts에서 두 친구를 데려옵니다.
// 여기서 가져온 이름(authApi)과 아래에서 내보낼 이름이 겹치지 않게 별명(tokenApi)을 붙입니다.
import { publicApi, authApi as tokenApi } from './axios';

import type {
  AuthResponse,
  LoginRequest,
  LoginResult,
  SignupRequest,
  SignupResult
} from '../types/auth';

// ✨ [중요] 여기서 export 하는 이름이 반드시 'authService'여야 합니다!
export const authService = {

  // 1. 회원가입 (토큰 X -> publicApi)
  signup: async (data: SignupRequest) => {
    const response = await publicApi.post<AuthResponse<SignupResult>>('/api/v1/auth/signup', data);
    return response.data;
  },

  // 2. 로그인 (토큰 X -> publicApi)
  login: async (data: LoginRequest) => {
    const response = await publicApi.post<AuthResponse<LoginResult>>('/api/v1/auth/login', data);
    return response.data;
  },

  // 3. 로그아웃 (토큰 O -> tokenApi)
  logout: async () => {
    const response = await tokenApi.post<AuthResponse<null>>('/api/v1/auth/logout');
    return response.data;
  }
};
// src/types/auth.ts

// 1. 공통 응답 형태 (Result가 제네릭)
export interface AuthResponse<T> {
  code: string;
  message: string;
  result: T;
}

// 2. 로그인 관련
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: {
    userSeq: number;
    email: string;
    nickname: string;
    characterSeq: number;
    characterName: string;
  };
}

// 3. 회원가입 관련
export interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
  characterSeq: number;
}

export interface SignupResult {
  userSeq: number;
  email: string;
  nickname: string;
  characterSeq: number;
}
// src/api/axios.ts
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://buddy-api.kro.kr';

// 1. 공통 설정
const commonConfig = {
  baseURL: BASE_URL,
  timeout: 5000,
  headers: {
    // ⚠️ 여기는 'application/json'으로 두더라도...
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
};

export const publicApi = axios.create(commonConfig);
export const authApi = axios.create(commonConfig);

// 2. ✨ 인터셉터 수정 (이 부분을 똑같이 복사하세요!)
authApi.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken || localStorage.getItem('accessToken');

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // 🔥 [핵심 해결 코드] 🔥
    // 만약 보내는 데이터가 FormData(파일 업로드)라면, 
    // Content-Type을 지워서 브라우저가 알아서 'boundary'를 붙이게 해줍니다.
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
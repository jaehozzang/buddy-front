// src/api/axios.ts
import axios, { AxiosError, type AxiosResponse } from 'axios';
import type { CommonResponse } from '../types/api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const instance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10초 대기
});

// [응답 인터셉터]
instance.interceptors.response.use(
  // 1. 성공(200~299) 시 처리
  (response: AxiosResponse<CommonResponse>) => {
    // 백엔드에서 준 데이터 전체({ code, message, result })를 그대로 반환하거나
    // 여기서 success 여부를 한 번 더 체크할 수도 있습니다.
    return response; 
  },
  
  // 2. 에러(400~500) 시 처리
  (error: AxiosError<CommonResponse>) => {
    if (error.response && error.response.data) {
      const { code, message } = error.response.data;
      
      console.error(`[API Error] ${code}: ${message}`);

      // 공통 에러 처리 (예: 토큰 만료 시 로그인 페이지로 이동)
      if (code === 'INVALID_TOKEN' || code === 'TOKEN_EXPIRED') {
        alert('로그인 정보가 만료되었습니다. 다시 로그인해주세요.');
        // window.location.href = '/login'; // 강제 이동
      }
    } else {
      console.error('[Network Error] 서버와 연결할 수 없습니다.');
    }
    
    return Promise.reject(error);
  }
);
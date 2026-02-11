import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// ✨ [중요] Vercel(HTTPS)에서 요청을 보내려면 API 주소도 무조건 HTTPS여야 합니다.
const BASE_URL = 'https://buddy-api.kro.kr';

const commonConfig = {
  baseURL: BASE_URL,
  timeout: 10000, // 5초는 짧을 수 있어 10초로 늘림
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키 공유가 필요할 경우를 대비해 추가
};

export const publicApi = axios.create(commonConfig);
export const authApi = axios.create(commonConfig);

// ----------------------------------------------------------------
// [요청 인터셉터] - 토큰 실어 보내기
// ----------------------------------------------------------------
authApi.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken || localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ----------------------------------------------------------------
// [응답 인터셉터] - 토큰 만료 시 재발급 (Silent Refresh)
// ----------------------------------------------------------------
authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // 에러 코드 확인 (서버에서 주는 코드에 맞춰 수정: T002 or G003)
    const errorCode = error.response?.data?.code;

    if ((errorCode === 'T002' || errorCode === 'G003') && !originalRequest._retry) {
      console.log(`♻️ [Auto-Refresh] 토큰 만료 감지 (${errorCode}). 재발급 시도...`);
      originalRequest._retry = true;

      try {
        const currentRefreshToken = localStorage.getItem('refreshToken');

        // 리프레시 토큰으로 새 토큰 요청
        const { data } = await publicApi.post('/api/v1/auth/refresh', {
          refreshToken: currentRefreshToken
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data.result;

        // 로컬스토리지 갱신
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // Zustand 스토어 갱신 (setTokens 함수명이 맞는지 확인하세요!)
        // 만약 setTokens(access, refresh) 형태라면 아래처럼:
        useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);

        console.log("✨ 토큰 갱신 성공! 원래 요청 재시도");

        // 헤더 갈아끼우고 재요청
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return authApi(originalRequest);

      } catch (refreshError) {
        console.error("❌ 리프레시 토큰 만료. 로그아웃.", refreshError);
        localStorage.clear();
        useAuthStore.getState().logout?.(); // 로그아웃 액션 실행
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
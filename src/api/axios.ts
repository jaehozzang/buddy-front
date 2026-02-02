import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// 1. 공통 설정
const BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.0.8:8080';

const commonConfig = {
  baseURL: BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
};

export const publicApi = axios.create(commonConfig);
export const authApi = axios.create(commonConfig);

// ----------------------------------------------------------------
// 2. [요청(Request) 인터셉터] - 나갈 때 (기존 코드 유지)
// ----------------------------------------------------------------
authApi.interceptors.request.use(
  (config) => {
    // Zustand 스토어 또는 로컬스토리지에서 AccessToken 가져오기
    const token = useAuthStore.getState().accessToken || localStorage.getItem('accessToken');

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // 🔥 FormData 전송 시 Content-Type 제거 (브라우저 자동 설정 유도)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ----------------------------------------------------------------
// 3. ✨ [응답(Response) 인터셉터] - 들어올 때 (토큰 만료 처리)
// ----------------------------------------------------------------
authApi.interceptors.response.use(
  // (1) 응답 성공 시: 그냥 그대로 반환
  (response) => {
    return response;
  },
  // (2) 응답 에러 시: 여기서 가로챔
  async (error) => {
    const originalRequest = error.config;

    // 에러 코드가 'T002'(Access Token 만료)이고, 아직 재시도를 안 했다면?
    if (error.response?.data?.code === 'T002' && !originalRequest._retry) {
      console.log("♻️ [Auto-Refresh] 토큰 만료됨! 재발급 시도 중...");

      originalRequest._retry = true; // 무한 루프 방지용 플래그 설정

      try {
        // 1. 저장된 Refresh Token 가져오기
        const currentRefreshToken = localStorage.getItem('refreshToken');

        // 2. 명세서에 맞춰 Body에 refreshToken 담아서 요청
        const { data } = await publicApi.post('/api/v1/auth/refresh', {
          refreshToken: currentRefreshToken
        });

        // 3. 응답 데이터에서 새 토큰들 꺼내기 (명세서 result 구조 참고)
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data.result;

        // 4. 새 토큰들 저장 (로컬스토리지 & Zustand 스토어)
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken); // 리프레시 토큰도 새로 왔으므로 갱신

        // Zustand 스토어 업데이트 (함수명이 setToken인지 setAccessToken인지 확인 필요)
        useAuthStore.getState().setAccessToken(newAccessToken);

        console.log("✨ 토큰 갱신 성공! 원래 요청을 재시도합니다.");

        // 5. 실패했던 원래 요청의 헤더를 새 토큰으로 교체
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        // 6. 원래 요청 다시 실행 (authApi 사용)
        return authApi(originalRequest);

      } catch (refreshError) {
        console.error("❌ 리프레시 토큰도 만료됨. 로그아웃 처리.", refreshError);

        // 갱신 실패 시 -> 데이터 비우고 로그인 페이지로 이동
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        useAuthStore.getState().logout?.(); // 스토어에 logout 액션이 있다면 실행

        // 강제로 로그인 페이지로 이동
        window.location.href = '/auth/login';

        return Promise.reject(refreshError);
      }
    }

    // T002 에러가 아니거나 갱신 실패 시 에러 그대로 반환
    return Promise.reject(error);
  }
);
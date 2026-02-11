import axios from 'axios';
// 🚨 [중요] 여기서 useAuthStore를 import 하면 순환 참조 에러로 흰 화면이 뜹니다!
// import { useAuthStore } from '../store/useAuthStore'; (제거함)

// 배포 환경(HTTPS)을 고려한 기본 주소
const BASE_URL = 'https://buddy-api.kro.kr';

const commonConfig = {
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
};

export const publicApi = axios.create(commonConfig);
export const authApi = axios.create(commonConfig);

// ----------------------------------------------------------------
// [요청 인터셉터] - localStorage에서 직접 토큰 꺼내기
// ----------------------------------------------------------------
authApi.interceptors.request.use(
  (config) => {
    // 스토어 대신 localStorage에서 직접 꺼냅니다 (가장 안전함)
    const token = localStorage.getItem('accessToken');

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
// [응답 인터셉터] - 토큰 갱신 로직
// ----------------------------------------------------------------
authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const errorCode = error.response?.data?.code;

    // T002 혹은 G003 에러 발생 시 (토큰 만료)
    if ((errorCode === 'T002' || errorCode === 'G003') && !originalRequest._retry) {
      console.log(`♻️ [Auto-Refresh] 토큰 만료 감지 (${errorCode})...`);
      originalRequest._retry = true;

      try {
        const currentRefreshToken = localStorage.getItem('refreshToken');

        // 1. 갱신 요청
        const { data } = await publicApi.post('/api/v1/auth/refresh', {
          refreshToken: currentRefreshToken
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data.result;

        // 2. 로컬 스토리지 최신화
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // ✨ [참고] 여기서 useAuthStore를 호출하지 않아도, 
        // 다음 요청부터는 localStorage의 새 토큰을 쓰기 때문에 문제 없습니다.
        // (UI 업데이트가 꼭 필요하면 window.location.reload()를 쓸 수도 있습니다)

        console.log("✨ 토큰 갱신 성공! 재요청합니다.");

        // 3. 실패했던 요청의 헤더를 새 토큰으로 교체 후 재시도
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return authApi(originalRequest);

      } catch (refreshError) {
        console.error("❌ 리프레시 토큰 만료/실패. 강제 로그아웃.", refreshError);

        // 데이터 청소
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        // 강제 이동 (스토어 logout 함수 대신 브라우저 이동 사용)
        window.location.href = '/auth/login';

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
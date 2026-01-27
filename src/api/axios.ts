import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// 1. 공통 설정 (URL, 타임아웃, Ngrok 무시 헤더 등)
const BASE_URL = import.meta.env.VITE_API_URL || '';

const commonConfig = {
  baseURL: BASE_URL,
  timeout: 5000, // 5초 대기
  headers: {
    'Content-Type': 'application/json',
    // Ngrok 무료 버전 사용 시 브라우저 경고창 무시 (개발용)
    'ngrok-skip-browser-warning': 'true',
  },
};

// 2. ✨ [publicApi]: 로그인, 회원가입용 (토큰 절대 안 보냄)
// 인터셉터가 없으므로 로컬스토리지에 토큰이 있어도 무시하고 깨끗하게 요청합니다.
export const publicApi = axios.create(commonConfig);

// 3. 🔒 [authApi]: 로그인 후 사용하는 API (마이페이지, 글쓰기 등)
// 얘는 요청 전에 토큰을 가로채서 붙입니다.
export const authApi = axios.create(commonConfig);

authApi.interceptors.request.use(
  (config) => {
    // 스토어에서 토큰 가져오기 (없으면 로컬스토리지 확인)
    const token = useAuthStore.getState().accessToken || localStorage.getItem('accessToken');

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 기본 export보다는 명시적으로 이름으로 가져다 쓰는 것을 추천합니다.
// export default axiosInstance; (삭제)
import axios from 'axios';
// 🚨 [중요] useAuthStore import 하지 마세요! (흰 화면 원인)

// ✨ 무조건 HTTPS로 통일!
const BASE_URL = 'https://buddy-api.kro.kr';

const commonConfig = {
  baseURL: BASE_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
};

export const publicApi = axios.create(commonConfig);
export const authApi = axios.create(commonConfig);

// [요청 인터셉터]
authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    if (config.data instanceof FormData) delete config.headers['Content-Type'];
    return config;
  },
  (error) => Promise.reject(error)
);

// [응답 인터셉터]
authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const errorCode = error.response?.data?.code;

    if ((errorCode === 'T002' || errorCode === 'G003') && !originalRequest._retry) {
      console.log(`♻️ 토큰 만료 감지 (${errorCode}). 재발급 시도...`);
      originalRequest._retry = true;
      try {
        const currentRefreshToken = localStorage.getItem('refreshToken');
        const { data } = await publicApi.post('/api/v1/auth/refresh', {
          refreshToken: currentRefreshToken
        });
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data.result;

        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return authApi(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
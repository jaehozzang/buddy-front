import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { LoginResult, Member } from '../types/auth';

interface AuthState {
  user: Member | null;
  accessToken: string | null;
  refreshToken: string | null; // ✨ 추가: 리프레시 토큰 관리
  isLoggedIn: boolean;

  // 액션 함수들
  login: (data: LoginResult) => void;
  logout: () => void;
  updateUserInfo: (updatedData: Partial<Member>) => void;

  // ✨ [에러 해결용 추가] OAuth 콜백 및 개별 저장을 위한 함수들
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: Member) => void;
  setAccessToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoggedIn: false,

      // 1. 일반 로그인 (객체 형태의 결과값 저장)
      login: (data) => {
        set({
          user: data.member,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken || null,
          isLoggedIn: true
        });

        // 로컬스토리지 명시적 저장 (인터셉터 등에서 직접 접근용)
        localStorage.setItem('accessToken', data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
      },

      // 2. 로그아웃
      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null, isLoggedIn: false });
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      },

      // 3. 유저 정보 부분 수정
      updateUserInfo: (updatedData) => set((state) => ({
        user: state.user ? { ...state.user, ...updatedData } : null
      })),

      // 4. ✨ [에러 해결] 토큰 2개를 직접 설정 (OAuthCallback 용)
      setTokens: (access, refresh) => {
        set({
          accessToken: access,
          refreshToken: refresh,
          isLoggedIn: true
        });
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
      },

      // 5. ✨ [에러 해결] 유저 정보 직접 설정
      setUser: (user) => set({ user }),

      // 6. 액세스 토큰만 갱신 (리프레시 로직용)
      setAccessToken: (token) => {
        set({ accessToken: token });
        localStorage.setItem('accessToken', token);
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
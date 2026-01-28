import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { LoginResult, Member } from '../types/auth';

interface AuthState {
  user: Member | null;
  accessToken: string | null;
  isLoggedIn: boolean;

  login: (data: LoginResult) => void;
  logout: () => void;
  updateUserInfo: (updatedData: Partial<Member>) => void;

  // ✨ [추가됨] 토큰만 갈아끼우는 함수 (Axios 인터셉터에서 사용)
  setAccessToken: (token: string) => void;
}

export const useAuthStore = create(
  persist<AuthState>(
    (set) => ({
      user: null,
      accessToken: null,
      isLoggedIn: false,

      login: (data) => {
        set({
          user: data.member,
          accessToken: data.accessToken,
          isLoggedIn: true
        });

        // 로컬스토리지에도 저장 (이중 저장 안전장치)
        localStorage.setItem('accessToken', data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
      },

      logout: () => {
        set({ user: null, accessToken: null, isLoggedIn: false });
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      },

      updateUserInfo: (updatedData) => set((state) => ({
        user: state.user ? { ...state.user, ...updatedData } : null
      })),

      // ✨ [추가됨] 여기가 핵심입니다!
      setAccessToken: (token) => {
        set({ accessToken: token });
        // 로컬스토리지 동기화는 persist가 알아서 해주지만, 
        // 명시적으로 한 번 더 해줘도 안전합니다.
        localStorage.setItem('accessToken', token);
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
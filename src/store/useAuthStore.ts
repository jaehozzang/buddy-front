// src/store/useAuthStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { LoginResult, Member } from '../types/auth';

interface AuthState {
  user: Member | null; // 타입은 Member지만, 편의상 변수명은 user로 유지
  accessToken: string | null;
  isLoggedIn: boolean;

  login: (data: LoginResult) => void;
  logout: () => void;
  // ✨ [추가] 정보 업데이트 함수 (닉네임이나 캐릭터 바뀔 때 사용)
  updateUserInfo: (updatedData: Partial<Member>) => void;
}

export const useAuthStore = create(
  persist<AuthState>(
    (set) => ({
      user: null,
      accessToken: null,
      isLoggedIn: false,

      login: (data) => {
        // ✨ 서버가 준 'member'를 스토어의 'user'에 저장
        set({
          user: data.member,
          accessToken: data.accessToken,
          isLoggedIn: true
        });

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

      // ✨ [구현] 기존 user 정보에 새로운 정보 덮어쓰기
      updateUserInfo: (updatedData) => set((state) => ({
        user: state.user ? { ...state.user, ...updatedData } : null
      })),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
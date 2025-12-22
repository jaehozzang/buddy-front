// src/store/useAuthStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// 1. 우리가 저장할 '유저 정보'의 모양을 정해줍니다.
interface User {
  id?: string;        // 👈 추가 (아이디)
  password?: string;
  nickname: string;
  characterType: string;
}

// 2. 스토어(기억 상자) 안에 들어갈 내용들입니다.
interface AuthState {
  registeredUser: User | null; // 👈 [추가] DB처럼 영구 저장될 정보
  user: User | null;           // 현재 로그인 중인 유저 정보
  isLoggedIn: boolean;

  register: (userData: User) => void; // 👈 [추가] 회원가입 함수
  login: (userData: User) => void;
  logout: () => void;
}

// 3. 스토어를 만듭니다. (persist = 새로고침해도 기억해라!)
export const useAuthStore = create(
  persist<AuthState>(
    (set) => ({
      registeredUser: null, // 초기엔 DB 비어있음
      user: null,
      isLoggedIn: false,

      // 1. 회원가입: registeredUser에 영구 저장 + 바로 로그인 처리
      register: (userData) => set({
        registeredUser: userData,
        user: userData,
        isLoggedIn: true
      }),

      // 2. 로그인: 현재 세션(user)에 정보 채우기
      login: (userData) => set({ user: userData, isLoggedIn: true }),

      // 3. 로그아웃: user만 지우고, registeredUser(DB)는 남겨둠!
      logout: () => set({ user: null, isLoggedIn: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
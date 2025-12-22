import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// 1. 우리가 저장할 '유저 정보'의 모양
interface User {
  id?: string;
  password?: string;
  nickname: string;
  buddyName?: string;
  characterType: string;
}

// 2. 스토어 타입 정의
interface AuthState {
  registeredUser: User | null; // 영구 저장될 가입 정보
  user: User | null;           // 현재 로그인 중인 세션 정보
  isLoggedIn: boolean;

  register: (userData: User) => void;
  login: (userData: User) => boolean; // 로그인 성공 여부 반환하도록 수정
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

// 3. 스토어 생성
export const useAuthStore = create(
  persist<AuthState>(
    (set, get) => ({
      registeredUser: null,
      user: null,
      isLoggedIn: false,

      // 1. 회원가입
      register: (userData) => set({
        registeredUser: userData,
        user: userData,
        isLoggedIn: true
      }),

      // 2. 로그인 (저장된 정보와 비교)
      login: (inputUser) => {
        const { registeredUser } = get();

        // 가입된 정보가 없거나, 아이디/비번이 틀리면 실패
        if (!registeredUser ||
          registeredUser.id !== inputUser.id ||
          registeredUser.password !== inputUser.password) {
          return false;
        }

        // 성공하면 로그인 처리
        set({ user: registeredUser, isLoggedIn: true });
        return true;
      },

      // 3. 로그아웃
      logout: () => set({ user: null, isLoggedIn: false }),

      // 4. 정보 수정 (✨ 여기가 문제였음! 안으로 들어옴)
      updateUser: (updates) => set((state) => {
        if (!state.user) return state; // 로그인 안됐으면 무시

        // 현재 로그인 정보 + DB 정보 둘 다 업데이트해야 함!
        const updatedUser = { ...state.user, ...updates };

        // 만약 로그인한 사람이 가입된 사람과 같다면 DB(registeredUser)도 같이 수정
        const updatedRegistered = (state.registeredUser && state.registeredUser.id === state.user.id)
          ? { ...state.registeredUser, ...updates }
          : state.registeredUser;

        return {
          user: updatedUser,
          registeredUser: updatedRegistered
        };
      }),
    }),

    // persist 옵션
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
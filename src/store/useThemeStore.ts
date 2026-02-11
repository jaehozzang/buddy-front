import { create } from 'zustand';

type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeState {
    theme: ThemeMode;
    setTheme: (theme: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
    // 처음에 켤 때 로컬스토리지에서 저장된 테마를 가져옴 (없으면 system)
    theme: (localStorage.getItem('theme-mode') as ThemeMode) || 'system',

    setTheme: (theme) => {
        localStorage.setItem('theme-mode', theme); // 다음 접속을 위해 브라우저에 저장
        set({ theme });
    },
}));
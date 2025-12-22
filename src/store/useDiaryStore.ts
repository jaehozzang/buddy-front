import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// 일기 데이터 타입
export interface Diary {
    id: string;      // 일기 고유 ID (날짜+시간 등)
    userId: string;
    date: string;    // "2025-05-20" 형식의 날짜 문자열
    mood: string;    // "기쁨", "슬픔" 등 감정
    content: string; // 일기 내용
}

interface DiaryState {
    diaries: Diary[]; // 일기 목록
    addDiary: (diary: Diary) => void; // 일기 추가 함수
    getDiaryByDate: (date: string) => Diary | undefined; // 날짜로 일기 찾기
}

export const useDiaryStore = create(
    persist<DiaryState>(
        (set, get) => ({
            diaries: [],

            addDiary: (newDiary) => set((state) => ({
                // 같은 날짜에 이미 일기가 있으면 덮어쓰기, 없으면 추가
                diaries: [
                    ...state.diaries.filter((d) => d.date !== newDiary.date),
                    newDiary
                ]
            })),

            getDiaryByDate: (date) => {
                return get().diaries.find((d) => d.date === date);
            },
        }),
        {
            name: 'diary-storage', // 로컬 스토리지 키 이름
            storage: createJSONStorage(() => localStorage),
        }
    )
);
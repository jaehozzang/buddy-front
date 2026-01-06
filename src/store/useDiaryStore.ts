import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// 일기 데이터 타입
export interface Diary {
    id: string;
    userId: string;
    date: string;
    mood: string;
    content: string;
    images?: string[]; // ✨ [추가] 이미지 경로 배열 (선택 사항)
}

interface DiaryState {
    diaries: Diary[];
    addDiary: (diary: Diary) => void;
    getDiaryByDate: (date: string) => Diary | undefined;
    getDiariesByDate: (date: string) => Diary[]; // ✨ [추가] 해당 날짜의 일기 '모두' 가져오기
}

export const useDiaryStore = create(
    persist<DiaryState>(
        (set, get) => ({
            diaries: [],

            addDiary: (newDiary) => set((state) => ({
                // ✨ [수정] 중요! 'date'가 아니라 'id'가 다르면 남겨둡니다.
                // 기존: date가 같으면 무조건 지우고 덮어씀 (하루 1개 제한의 원인)
                // 변경: id가 같을 때만 수정하고, id가 다르면 같은 날짜라도 새로 추가됨
                diaries: [
                    ...state.diaries.filter((d) => d.id !== newDiary.id),
                    newDiary
                ]
            })),

            // 기존 함수 (하위 호환성 위해 유지, 첫 번째 일기만 반환)
            getDiaryByDate: (date) => {
                return get().diaries.find((d) => d.date === date);
            },

            // ✨ [추가] 해당 날짜의 '모든' 일기를 가져오는 함수 (캘린더에서 점 여러 개 찍을 때 유용)
            getDiariesByDate: (date) => {
                return get().diaries.filter((d) => d.date === date);
            },
        }),
        {
            name: 'diary-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
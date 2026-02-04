import { authApi } from './axios';
import type { AuthResponse } from '../types/auth';
import type { DiarySummary, DiaryDetail } from '../types/diary';

// ✨ [여기!] 이 부분이 없어서 에러가 난 겁니다. 꼭 추가해 주세요!
export interface DailyDiaryCount {
    date: string;  // "2026-02-04"
    count: number; // 일기 개수
}

export const diaryApi = {
    // 1. 목록 조회
    getDiariesByDate: async (date: string) => {
        const response = await authApi.get<AuthResponse<DiarySummary[]>>('/api/v1/diary', {
            params: { date },
        });
        return response.data;
    },

    // 2. 상세 조회
    getDiaryDetail: async (diarySeq: number) => {
        const response = await authApi.get<AuthResponse<DiaryDetail>>(`/api/v1/diary/${diarySeq}`);
        return response.data;
    },

    // 3. 일기 생성
    createDiary: async (data: FormData) => {
        const response = await authApi.post<AuthResponse<number>>('/api/v1/diary', data, {
            headers: { "Content-Type": undefined }
        });
        return response.data;
    },

    // 4. 일기 수정
    updateDiary: async (diarySeq: number, data: FormData) => {
        const response = await authApi.patch<AuthResponse<number>>(`/api/v1/diary/${diarySeq}`, data, {
            headers: { "Content-Type": undefined }
        });
        return response.data;
    },

    // 5. 삭제
    deleteDiary: async (diarySeq: number) => {
        const response = await authApi.delete<AuthResponse<{}>>(`/api/v1/diary/${diarySeq}`);
        return response.data;
    },

    // 6. AI 일기 생성
    createDiaryFromChat: async (sessionId: number) => {
        const response = await authApi.post<AuthResponse<{
            title: string;
            content: string;
            tags: { tagSeq: number; name: string }[];
        }>>('/api/v1/diary/from-chat', { sessionId });
        return response.data;
    },

    // 7. 월간 조회 (리스트용)
    getMonthlyDiaries: async (year: number, month: number) => {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-01`;
        const response = await authApi.get<AuthResponse<DiarySummary[]>>('/api/v1/diary', {
            params: { date: dateStr, type: 'MONTHLY' }
        });
        return response.data;
    },

    // ✨ 8. [신규 추가] 월별 일기 개수 조회 (잔디 심기용)
    getMonthlyDiaryCounts: async (year: number, month: number) => {
        const response = await authApi.get<AuthResponse<DailyDiaryCount[]>>('/api/v1/diary/calendar', {
            params: { year, month }
        });
        return response.data;
    },
};
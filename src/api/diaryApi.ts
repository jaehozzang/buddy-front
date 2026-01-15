// src/api/diaryApi.ts
import { authApi } from './axios'; // (변경)
import type { AuthResponse } from '../types/auth';
import type { DiarySummary, DiaryDetail, CreateDiaryRequest } from '../types/diary';

export const diaryApi = {
    // 1. 목록 조회 (authApi)
    getDiariesByDate: async (date: string) => {
        const response = await authApi.get<AuthResponse<DiarySummary[]>>('/api/v1/diary', {
            params: { date },
        });
        return response.data;
    },

    // 2. 상세 조회 (authApi)
    getDiaryDetail: async (diarySeq: number) => {
        const response = await authApi.get<AuthResponse<DiaryDetail>>(`/api/v1/diary/${diarySeq}`);
        return response.data;
    },

    // 3. 일기 생성 (authApi)
    createDiary: async (data: CreateDiaryRequest) => {
        const response = await authApi.post<AuthResponse<number>>('/api/v1/diary', data);
        return response.data;
    },

    // 4. 일기 수정 (authApi)
    updateDiary: async (diarySeq: number, data: CreateDiaryRequest) => {
        const response = await authApi.patch<AuthResponse<number>>(`/api/v1/diary/${diarySeq}`, data);
        return response.data;
    },

    // 5. 삭제 (authApi)
    deleteDiary: async (diarySeq: number) => {
        const response = await authApi.delete<AuthResponse<{}>>(`/api/v1/diary/${diarySeq}`);
        return response.data;
    },

    // 6. AI 일기 생성 (authApi)
    createDiaryFromChat: async (sessionId: number) => {
        const response = await authApi.post<AuthResponse<{
            title: string;
            content: string;
            tags: { tagSeq: number; name: string }[];
        }>>('/api/v1/diary/from-chat', { sessionId });
        return response.data;
    },

    // 7. 월간 조회 (authApi)
    getMonthlyDiaries: async (year: number, month: number) => {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-01`;
        // 백엔드 명세에 따라 params는 달라질 수 있음
        const response = await authApi.get<AuthResponse<DiarySummary[]>>('/api/v1/diary', {
            params: { date: dateStr, type: 'MONTHLY' }
        });
        return response.data;
    },
};
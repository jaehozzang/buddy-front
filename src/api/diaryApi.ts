import { authApi } from './axios';
import type { AuthResponse } from '../types/auth';
import type { DiarySummary, DiaryDetail } from '../types/diary';

// 📅 캘린더 잔디 심기용 타입
export interface DailyDiaryCount {
    date: string;  // "2026-02-04"
    count: number; // 일기 개수
}

export const diaryApi = {
    // =================================================================
    // 1. 조회 (Read) - 리스트, 캘린더, 상세
    // =================================================================

    // 1-1. 날짜별 일기 목록 조회 (특정 하루)
    // GET /api/v1/diaries?date=2024-02-12
    getDiariesByDate: async (date: string) => {
        const response = await authApi.get<AuthResponse<DiarySummary[]>>('/api/v1/diaries', {
            params: { date },
        });
        return response.data;
    },

    // 1-2. 월간 일기 목록 조회 (리스트용)
    // GET /api/v1/diaries?date=2024-02-01&type=MONTHLY
    getMonthlyDiaries: async (year: number, month: number) => {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-01`;
        const response = await authApi.get<AuthResponse<DiarySummary[]>>('/api/v1/diaries', {
            params: { date: dateStr, type: 'MONTHLY' }
        });
        return response.data;
    },

    // 1-3. 월별 일기 개수 조회 (캘린더 잔디 심기용)
    // GET /api/v1/diaries/calendar?year=2024&month=2
    getMonthlyDiaryCounts: async (year: number, month: number) => {
        const response = await authApi.get<AuthResponse<DailyDiaryCount[]>>('/api/v1/diaries/calendar', {
            params: { year, month }
        });
        return response.data;
    },

    // 1-4. 일기 상세 조회
    // GET /api/v1/diaries/{diarySeq}
    getDiaryDetail: async (diarySeq: number) => {
        const response = await authApi.get<AuthResponse<DiaryDetail>>(`/api/v1/diaries/${diarySeq}`);
        return response.data;
    },

    // =================================================================
    // 2. 작성 (Create) - 일반 작성, AI 작성
    // =================================================================

    // 2-1. 일기 생성 (이미지 포함 가능 -> FormData)
    // POST /api/v1/diaries
    createDiary: async (data: FormData) => {
        const response = await authApi.post<AuthResponse<number>>('/api/v1/diaries', data, {
            headers: { "Content-Type": undefined } // 브라우저가 boundary 자동 설정
        });
        return response.data;
    },

    // 2-2. AI 일기 생성 (대화 세션 기반)
    // POST /api/v1/diary/from-chat
    createDiaryFromChat: async (sessionId: number) => {
        const response = await authApi.post<AuthResponse<{
            title: string;
            content: string;
            tags: { tagSeq: number; name: string }[];
        }>>('/api/v1/diaries/from-chat', { sessionId });
        return response.data;
    },

    // =================================================================
    // 3. 수정 및 삭제 (Update & Delete)
    // =================================================================

    // 3-1. 일기 수정
    // PATCH /api/v1/diaries/{diarySeq}
    updateDiary: async (diarySeq: number, data: FormData) => {
        const response = await authApi.patch<AuthResponse<number>>(`/api/v1/diaries/${diarySeq}`, data, {
            headers: { "Content-Type": undefined }
        });
        return response.data;
    },

    // 3-2. 일기 삭제
    // DELETE /api/v1/diaries/{diarySeq}
    deleteDiary: async (diarySeq: number) => {
        const response = await authApi.delete<AuthResponse<{}>>(`/api/v1/diaries/${diarySeq}`);
        return response.data;
    },
};
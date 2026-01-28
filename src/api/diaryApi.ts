// src/api/diaryApi.ts
import { authApi } from './axios';
import type { AuthResponse } from '../types/auth';
import type { DiarySummary, DiaryDetail } from '../types/diary';

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

    // 3. 일기 생성 (✨ 수정됨)
    createDiary: async (data: FormData) => {
        // 'Content-Type': undefined로 설정하면, 
        // axios.ts에 있는 'application/json' 설정을 무시하고
        // 브라우저가 자동으로 'multipart/form-data; boundary=...'를 채워줍니다.
        const response = await authApi.post<AuthResponse<number>>('/api/v1/diary', data, {
            headers: {
                "Content-Type": undefined
            }
        });
        return response.data;
    },

    // 4. 일기 수정 (✨ 수정됨)
    updateDiary: async (diarySeq: number, data: FormData) => {
        const response = await authApi.patch<AuthResponse<number>>(`/api/v1/diary/${diarySeq}`, data, {
            headers: {
                "Content-Type": undefined
            }
        });
        return response.data;
    },

    // 5. 삭제
    deleteDiary: async (diarySeq: number) => {
        const response = await authApi.delete<AuthResponse<{}>>(`/api/v1/diary/${diarySeq}`);
        return response.data;
    },

    // 6. AI 일기 생성 (✨ 수정 확인: sessionId를 객체로 감싸서 전송)
    createDiaryFromChat: async (sessionId: number) => {
        const response = await authApi.post<AuthResponse<{
            title: string;
            content: string;
            tags: { tagSeq: number; name: string }[];
        }>>('/api/v1/diary/from-chat', { sessionId }); // { sessionId: 123 } 형태로 전송
        return response.data;
    },

    // 7. 월간 조회
    getMonthlyDiaries: async (year: number, month: number) => {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-01`;
        const response = await authApi.get<AuthResponse<DiarySummary[]>>('/api/v1/diary', {
            params: { date: dateStr, type: 'MONTHLY' }
        });
        return response.data;
    },
};
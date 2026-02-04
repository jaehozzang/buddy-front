// src/types/diary.ts

// 1. 일기 목록 조회용 (CalendarPage, HomePage 리스트)
export interface DiarySummary {
    diarySeq: number;
    title: string;
    summary: string;
    createAt: string; // ✨ 명세서 기준

    // ✨ [핵심 해결] Vercel 에러 해결을 위해 명시적으로 추가
    // 목록 조회 시 내용이 없을 수도 있으므로 ?(optional) 처리 추천
    content?: string;

    // ✨ [HomePage 오류 방지] HomePage에서 date, diaryDate 등을 체크하므로 추가
    date?: string;
    diaryDate?: string;
    createdAt?: string;

    // 태그 (문자열 또는 객체 허용)
    tags?: string[] | { tagSeq: number; name: string }[];

    // 이미지 (유연하게 허용)
    images?: { url: string }[] | string[];
    thumbnail?: string;
    imageUrl?: string; // 가끔 imageUrl로 들어오는 경우 대비
}

// 2. 일기 상세 조회용 (DiaryViewPage 뷰어)
export interface DiaryDetail {
    diarySeq: number;
    title: string;
    content: string;

    createAt?: string; // 오타 방지용 허용
    createdAt: string; // ✨ 명세서 기준
    diaryDate?: string; // 사용자가 지정한 날짜

    tags: {
        tagSeq?: number;
        name: string;
    }[];

    images?: { url: string }[] | string[];
    imageUrl?: string;
}

// 3. 일기 생성/수정 요청
export interface CreateDiaryRequest {
    title: string;
    content: string;
    diaryDate?: string;
    imageUrl?: string;
    tags: string[];
}
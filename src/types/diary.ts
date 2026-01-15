// src/types/diary.ts

// 1. 일기 목록 조회용 (간략 정보)
export interface DiarySummary {
    diarySeq: number;
    title: string;
    summary: string;
    createAt: string; // ✨ 명세서에 createAt으로 되어 있음
    tags: string[];   // 목록에선 태그가 문자열 배열 ["슬픔", "비"]
}

// 2. 일기 상세 조회용 (자세한 정보)
export interface DiaryDetail {
    diarySeq: number;
    title: string;
    content: string;
    imageUrl: string;
    createdAt: string; // ✨ 명세서에 createdAt으로 되어 있음 (t 있음!)
    tags: {            // 상세에선 태그가 객체 배열
        tagSeq: number;
        name: string;
    }[];
}

// 3. 일기 생성 요청
export interface CreateDiaryRequest {
    title: string;
    content: string;
    imageUrl?: string;
    tags: string[]; 
}
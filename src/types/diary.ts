// src/types/diary.ts

// 1. 일기 목록 조회용 (CalendarPage 리스트)
export interface DiarySummary {
    diarySeq: number;
    title: string;
    summary: string;
    createAt: string; // ✨ 명세서 기준 (t 없음)

    // 태그가 ["태그1", "태그2"] 문자열 배열로 올 수도 있고, 객체로 올 수도 있어 둘 다 허용
    tags: string[] | { tagSeq: number; name: string }[];

    // ✨ 리스트 썸네일용 (백엔드가 어떻게 줄지 몰라 유연하게 설정)
    images?: { url: string }[] | string[];
    thumbnail?: string;
}

// 2. 일기 상세 조회용 (DiaryViewPage 뷰어)
export interface DiaryDetail {
    diarySeq: number;
    title: string;
    content: string;

    createdAt: string; // ✨ 명세서 기준 (t 있음)
    diaryDate?: string; // 사용자가 지정한 날짜 (없으면 createdAt 사용)

    // 상세에선 태그가 객체 배열이라고 하셨지만, 코드 안전성을 위해 유연하게
    tags: {
        tagSeq?: number;
        name: string;
    }[];

    // ✨ 뷰어에서 맵(.map)을 돌리기 위해 배열로 선언
    // 백엔드가 imageUrl 하나만 준다면, 프론트에서 변환하거나 이 타입을 맞춰야 함
    images?: { url: string }[] | string[];
    imageUrl?: string; // 레거시 호환용
}

// 3. 일기 생성/수정 요청
export interface CreateDiaryRequest {
    title: string;
    content: string;
    diaryDate?: string; // 날짜 지정 가능하도록 추가
    imageUrl?: string;
    tags: string[];
}
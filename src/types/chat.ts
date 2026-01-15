// src/types/chat.ts

// 1. 채팅 메시지 하나 (서버가 주는 거)
export interface ChatMessage {
    sessionId: number;
    messageSeq: number;
    role: "USER" | "ASSISTANT"; // 명세엔 string이지만 보통 이렇게 씀
    content: string;
    createdAt: string;
}

// 2. 메시지 보낼 때 (요청)
export interface SendMessageRequest {
    sessionId: number; // ✨ 중요: 세션 ID가 필요함
    content: string;
}

// 3. 메시지 보내기 응답
export interface SendMessageResponse {
    sessionId: number;
    messageSeq: number;
    role: string;
    content: string;
    createdAt: string;
}
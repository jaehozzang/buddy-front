import { useEffect, useState } from "react";
import { format, formatDistanceToNow, differenceInHours } from "date-fns";
import { ko } from "date-fns/locale";
import { diaryApi } from "../api/diaryApi";
import { chatApi } from "../api/chatApi";
import type { DiaryDetail } from "../types/diary";
import type { ChatMessage } from "../types/chat"; // ChatMessage 타입 가져오기

// ✨ 팝업 & 페이드 애니메이션
const modalAnimation = `
@keyframes scale-up {
    0% { opacity: 0; transform: scale(0.95); }
    100% { opacity: 1; transform: scale(1); }
}
@keyframes fade-in {
    0% { opacity: 0; transform: translateY(5px); }
    100% { opacity: 1; transform: translateY(0); }
}
.animate-scale-up { animation: scale-up 0.2s ease-out forwards; }
.animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
`;

interface DiaryViewProps {
    diaryId: number;
    onClose: () => void;
    onEdit: (diary: DiaryDetail) => void;
    onDeleteSuccess: () => void;
}

export default function DiaryViewPage({ diaryId, onClose, onEdit, onDeleteSuccess }: DiaryViewProps) {
    const [diary, setDiary] = useState<DiaryDetail | null>(null);
    const [loading, setLoading] = useState(true);

    // ✨ 대화 내역 관련 상태
    const [showChat, setShowChat] = useState(false);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isChatLoading, setIsChatLoading] = useState(false);

    // 1. 데이터 로드
    useEffect(() => {
        const fetchDetail = async () => {
            if (!diaryId) return;
            try {
                const response = await diaryApi.getDiaryDetail(diaryId);
                if (response && response.result) {
                    setDiary(response.result);
                } else {
                    throw new Error("데이터가 없습니다.");
                }
            } catch (error) {
                console.error("일기 로드 실패", error);
                alert("일기를 불러올 수 없습니다.");
                onClose();
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [diaryId]);

    // 2. 삭제 핸들러
    const handleDelete = async () => {
        if (!diaryId) return;
        if (!window.confirm("정말 이 일기를 삭제하시겠습니까? (복구 불가)")) return;
        try {
            await diaryApi.deleteDiary(diaryId);
            alert("삭제되었습니다.");
            onDeleteSuccess(); // 부모에게 삭제 완료 알림
        } catch (error) {
            console.error("삭제 실패", error);
            alert("삭제 중 오류가 발생했습니다.");
        }
    };

    // ✨ 3. 대화 내역 토글 & API 호출 핸들러
    const handleToggleChat = async () => {
        // 일기 창 -> 대화 창으로 넘어갈 때 & 아직 데이터를 안 불러왔을 때만 API 호출
        if (!showChat && chatHistory.length === 0) {
            // 타입 파일에 정의된 sessionSeq 사용!
            if (diary?.sessionSeq) {
                setIsChatLoading(true);
                try {
                    const response = await chatApi.getChatHistory(diary.sessionSeq);
                    if (response && response.result) {
                        setChatHistory(response.result);
                    }
                } catch (error) {
                    console.error("대화 내역 로드 실패", error);
                } finally {
                    setIsChatLoading(false);
                }
            } else {
                console.warn("이 일기와 연결된 sessionSeq가 없습니다.");
            }
        }
        setShowChat(!showChat); // 화면 전환
    };

    // 🕒 시간 표시 함수
    const getCreatedTimeDisplay = () => {
        if (!diary) return "";
        const dateStr = diary.createdAt || diary.createAt;
        if (!dateStr) return "";
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return "";
            const now = new Date();
            const hoursDiff = differenceInHours(now, date);
            if (hoursDiff < 24) return formatDistanceToNow(date, { addSuffix: true, locale: ko });
            return format(date, "yyyy.MM.dd");
        } catch { return ""; }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm">
                <div className="bg-white p-6 rounded-2xl shadow-xl">
                    <div className="text-slate-400 animate-pulse">로딩 중...</div>
                </div>
            </div>
        );
    }

    if (!diary) return null;

    let headerDateObj = new Date();
    if (diary.diaryDate) headerDateObj = new Date(diary.diaryDate);
    else if (diary.createdAt || diary.createAt) headerDateObj = new Date(diary.createdAt || diary.createAt || "");

    const hasImages = !!diary.imageUrl || (diary.images?.length ?? 0) > 0;

    return (
        <>
            <style>{modalAnimation}</style>
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-8"
                onClick={onClose}
            >
                <div
                    className="bg-white w-full max-w-3xl h-[70vh] max-h-[800px] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden relative animate-scale-up border border-white/50"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* 헤더 */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white flex-shrink-0 relative z-10">
                        <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                        </button>
                        <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                            <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                                {format(headerDateObj, "yyyy년 MM월 dd일")}
                            </h2>
                            <span className="text-[11px] text-slate-400">{getCreatedTimeDisplay()} 작성됨</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => onEdit(diary)} className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
                            </button>
                            <button onClick={handleDelete} className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">

                        {/* 1. 왼쪽: 사진 (대화 보기 중이 아닐 때만 표시) */}
                        {!showChat && hasImages && (
                            <div className="w-full md:w-[45%] h-64 md:h-full bg-slate-50 border-b md:border-b-0 md:border-r border-slate-100 p-6 overflow-y-auto custom-scrollbar">
                                <div className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-wider">Photo Log</div>
                                <div className="flex flex-col gap-4">
                                    {diary.imageUrl ? (
                                        <div className="w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
                                            <img src={diary.imageUrl} alt="main" className="w-full h-auto object-contain" />
                                        </div>
                                    ) : (
                                        diary.images?.map((img: any, idx: number) => {
                                            const url = typeof img === 'string' ? img : img.url;
                                            return (
                                                <div key={idx} className="w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
                                                    <img src={url} alt={`img-${idx}`} className="w-full h-auto object-contain" />
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 2. 오른쪽: 텍스트 or 대화 내역 */}
                        <div className={`flex-1 flex flex-col overflow-y-auto custom-scrollbar p-8 md:p-10 relative ${(!showChat && hasImages) ? "" : "mx-auto w-full max-w-3xl"}`}>

                            {/* ✨ 일기 보기 모드 */}
                            {!showChat && (
                                <div className="animate-fade-in flex-1 flex flex-col">
                                    <h1 className="text-xl font-bold text-slate-800 leading-tight text-center break-keep mb-4">
                                        {diary.title || "제목 없음"}
                                    </h1>

                                    {diary.tags && diary.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 justify-center mb-6">
                                            {diary.tags.map((tag: any, idx: number) => {
                                                const name = typeof tag === 'string' ? tag : tag.name;
                                                return (
                                                    <span key={idx} className="bg-primary-50 text-primary-600 px-3 py-1 rounded-full text-xs font-bold shadow-sm border border-primary-100">
                                                        #{name}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    )}

                                    <div className="flex-1 w-full">
                                        <div className="prose prose-slate max-w-none">
                                            <p className="whitespace-pre-wrap text-slate-600 leading-relaxed text-base text-center font-medium">
                                                {diary.content}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-12 mb-8 flex justify-center opacity-20">
                                        <div className="w-16 h-1 bg-slate-200 rounded-full"></div>
                                    </div>
                                </div>
                            )}

                            {/* ✨ 대화 내역 보기 모드 (API 데이터 연동) */}
                            {showChat && (
                                <div className="animate-fade-in flex-1 flex flex-col pb-16">
                                    <div className="flex items-center justify-center gap-2 mb-8 border-b border-slate-100 pb-4">
                                        <span className="text-2xl">💬</span>
                                        <h2 className="text-lg font-bold text-slate-800">이날의 대화</h2>
                                    </div>

                                    <div className="flex-1 flex flex-col gap-4">
                                        {isChatLoading ? (
                                            <div className="flex flex-col items-center justify-center py-10 opacity-50">
                                                <div className="w-8 h-8 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin mb-3"></div>
                                                <p className="text-sm font-bold text-slate-500">대화 기록을 불러오는 중...</p>
                                            </div>
                                        ) : chatHistory.length === 0 ? (
                                            <div className="text-center py-10 text-slate-400 font-medium">
                                                {diary?.sessionSeq ? "대화 내역이 없습니다." : "채팅으로 작성된 일기가 아닙니다. 📝"}
                                            </div>
                                        ) : (
                                            chatHistory.map((chat) => {
                                                // Role 판별 (User, user 모두 처리)
                                                const isUser = chat.role.toLowerCase() === "user";

                                                return (
                                                    <div key={chat.messageSeq} className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
                                                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed shadow-sm border ${isUser
                                                                ? "bg-primary-600 text-white border-primary-500 rounded-tr-sm"
                                                                : "bg-white text-slate-700 border-slate-200 rounded-tl-sm"
                                                            }`}>
                                                            {chat.content}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ✨ 토글 플로팅 버튼 (오른쪽 아래 고정) */}
                            <button
                                onClick={handleToggleChat}
                                className="absolute bottom-6 right-6 w-12 h-12 bg-primary-600 text-white rounded-full shadow-lg shadow-primary-200 hover:bg-primary-700 hover:scale-105 transition-all flex items-center justify-center z-20 group"
                                title={showChat ? "일기 보기" : "대화 내역 보기"}
                            >
                                <span className="text-xl transform transition-transform group-hover:-rotate-12">
                                    {showChat ? "📝" : "💬"}
                                </span>
                            </button>

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
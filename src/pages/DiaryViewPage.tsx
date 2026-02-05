import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, formatDistanceToNow, differenceInHours } from "date-fns";
import { ko } from "date-fns/locale";
import { diaryApi } from "../api/diaryApi";
import type { DiaryDetail } from "../types/diary";

export default function DiaryViewPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [diary, setDiary] = useState<DiaryDetail | null>(null);
    const [loading, setLoading] = useState(true);

    // 1. 데이터 로드
    useEffect(() => {
        const fetchDetail = async () => {
            if (!id || isNaN(Number(id))) return;
            try {
                const response = await diaryApi.getDiaryDetail(Number(id));

                // 🔍 [디버깅용]
                console.log("📌 백엔드 응답 데이터:", response.result);

                if (response && response.result) {
                    setDiary(response.result);
                } else {
                    throw new Error("데이터가 없습니다.");
                }
            } catch (error) {
                console.error("일기 로드 실패", error);
                alert("일기를 불러올 수 없습니다.");
                navigate("/app/calendar");
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id, navigate]);

    // 2. 삭제 핸들러
    const handleDelete = async () => {
        if (!id) return;
        if (!window.confirm("정말 이 일기를 삭제하시겠습니까? (복구 불가)")) return;
        try {
            await diaryApi.deleteDiary(Number(id));
            alert("삭제되었습니다.");
            navigate("/app/calendar", { replace: true });
        } catch (error) {
            console.error("삭제 실패", error);
            alert("삭제 중 오류가 발생했습니다.");
        }
    };

    // 3. 수정 핸들러
    const handleEdit = () => {
        if (!id || !diary) return;
        const targetDate = diary.diaryDate || diary.createdAt;
        navigate(`/app/diary/${id}/edit`, {
            state: { mode: "edit", date: targetDate }
        });
    };

    // 🕒 '작성 시간' 표시 함수
    const getCreatedTimeDisplay = () => {
        if (!diary) return "";
        const dateStr = diary.createdAt || diary.createAt;
        if (!dateStr) return "";

        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return "";

            const now = new Date();
            const hoursDiff = differenceInHours(now, date);

            if (hoursDiff < 24) {
                // 24시간 미만: "3시간 전" (기존 유지)
                return formatDistanceToNow(date, { addSuffix: true, locale: ko });
            }
            // ✨ [수정됨] 24시간 이상: "2024.02.05" 날짜 표시
            return format(date, "yyyy.MM.dd");
        } catch {
            return "";
        }
    };

    if (loading) {
        return (
            <div className="h-[calc(100vh-120px)] flex items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-slate-400 animate-pulse">로딩 중...</div>
            </div>
        );
    }

    if (!diary) return null;

    // 헤더 날짜 결정 로직
    let headerDateObj = new Date();
    if (diary.diaryDate) {
        headerDateObj = new Date(diary.diaryDate);
    } else if (diary.createdAt || diary.createAt) {
        headerDateObj = new Date(diary.createdAt || diary.createAt || "");
    }

    const hasImages = !!diary.imageUrl || (diary.images?.length ?? 0) > 0;

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm relative">

            {/* 헤더 */}
            <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-slate-100 flex-shrink-0">
                <button
                    onClick={() => navigate("/app/calendar")}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition"
                >
                    ←
                </button>

                {/* 중앙 날짜 표시 */}
                <div className="font-bold text-slate-800 text-lg absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center leading-tight">
                    <span>{format(headerDateObj, "yyyy년 MM월 dd일")}</span>
                    <span className="text-[10px] text-primary-500 font-medium">
                        {format(headerDateObj, "EEEE", { locale: ko })}
                    </span>
                </div>

                {/* 우측 상단 버튼 그룹 */}
                <div className="flex items-center gap-2">
                    {/* 작성 시간 (오른쪽 상단엔 언제 썼는지가 나옵니다) */}
                    <span className="text-[11px] text-slate-400 font-medium mr-2 hidden md:block">
                        {getCreatedTimeDisplay()} 작성
                    </span>

                    {/* 수정 버튼 */}
                    <button
                        onClick={handleEdit}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-green-600 hover:bg-green-50 transition"
                        title="수정하기"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                    </button>

                    {/* 삭제 버튼 */}
                    <button
                        onClick={handleDelete}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                        title="삭제하기"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* 본문 영역 */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* 왼쪽: 사진 */}
                {hasImages && (
                    <div className="w-full md:w-[400px] bg-slate-50 border-b md:border-b-0 md:border-r border-slate-100 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                        <div className="text-xs font-bold text-slate-400 mb-1 text-center md:text-left">Photo Log</div>
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
                )}

                {/* 오른쪽: 제목/태그/내용 */}
                <div className={`flex-1 flex flex-col overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-4 items-center text-center relative ${hasImages ? "" : "max-w-3xl mx-auto w-full"}`}>

                    <h1 className="text-2xl font-bold text-slate-900 leading-tight break-keep pt-2">
                        {diary.title || "제목 없음"}
                    </h1>

                    {diary.tags && diary.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 justify-center">
                            {diary.tags.map((tag: any, idx: number) => {
                                const name = typeof tag === 'string' ? tag : tag.name;
                                return (
                                    <span key={idx} className="bg-primary-50 text-primary-700 px-3 py-1 rounded-lg text-sm font-bold">
                                        #{name}
                                    </span>
                                );
                            })}
                        </div>
                    )}

                    <hr className="border-slate-100 w-full my-4" />

                    <div className="prose prose-slate max-w-none flex-1 w-full">
                        <p className="whitespace-pre-wrap text-slate-700 leading-relaxed text-base text-center">
                            {diary.content}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
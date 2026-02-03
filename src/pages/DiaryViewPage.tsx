import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
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
        if (!id) return;
        navigate(`/app/diary/${id}/edit`, {
            state: { mode: "edit", date: diary?.diaryDate }
        });
    };

    // 로딩 UI
    if (loading || !diary) {
        return (
            <div className="h-[calc(100vh-120px)] flex items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-slate-400 animate-pulse">{loading ? "로딩 중..." : "일기가 없습니다."}</div>
            </div>
        );
    }

    // 날짜 표시용
    const displayDate = diary.diaryDate
        ? new Date(diary.diaryDate)
        : (diary.createdAt ? new Date(diary.createdAt) : new Date());

    // 이미지 존재 여부 확인
    const hasImages = (diary.images && diary.images.length > 0) || !!diary.imageUrl;

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
                <div className="font-bold text-slate-800 text-lg">
                    {format(displayDate, "yyyy년 MM월 dd일")}
                </div>
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

            {/* ✅ 메인 콘텐츠 */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

                {/* 👈 [왼쪽] 글 영역 (가운데 정렬 적용됨) */}
                <div className={`flex-1 flex flex-col overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-6 items-center text-center ${hasImages ? "" : "max-w-3xl mx-auto w-full"}`}>

                    {/* 제목 (가운데 정렬) */}
                    <h1 className="text-2xl font-bold text-slate-900 leading-tight break-keep">
                        {diary.title}
                    </h1>

                    {/* ✅ 태그 (다시 추가됨 & 가운데 정렬) */}
                    {diary.tags && diary.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 justify-center">
                            {diary.tags.map((tag: any, idx: number) => {
                                const tagName = typeof tag === 'string' ? tag : tag.name;
                                return (
                                    <span key={idx} className="bg-primary-50 text-primary-700 px-3 py-1 rounded-lg text-sm font-bold">
                                        #{tagName}
                                    </span>
                                );
                            })}
                        </div>
                    )}

                    <hr className="border-slate-100 w-full" />

                    {/* 본문 내용 (가운데 정렬) */}
                    <div className="prose prose-slate max-w-none flex-1 w-full">
                        <p className="whitespace-pre-wrap text-slate-700 leading-relaxed text-base text-center">
                            {diary.content}
                        </p>
                    </div>
                </div>

                {/* 👉 [오른쪽] 사진 영역 (사진이 있을 때만 렌더링) */}
                {hasImages && (
                    <div className="w-full md:w-[400px] bg-slate-50 border-t md:border-t-0 md:border-l border-slate-100 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                        <div className="text-xs font-bold text-slate-400 mb-1 text-center md:text-left">Photo Log</div>

                        {/* 이미지 리스트 */}
                        {diary.images && diary.images.length > 0 ? (
                            diary.images.map((img: any, idx: number) => {
                                const imgUrl = typeof img === 'string' ? img : img.url;
                                return (
                                    <div key={idx} className="w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
                                        <img src={imgUrl} alt={`img-${idx}`} className="w-full h-auto object-contain" />
                                    </div>
                                );
                            })
                        ) : diary.imageUrl ? (
                            <div className="w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
                                <img src={diary.imageUrl} alt="main-img" className="w-full h-auto object-contain" />
                            </div>
                        ) : null}
                    </div>
                )}
            </div>

            {/* 하단 버튼 (✅ 원래 색상 복구: bg-primary-600) */}
            <div className="p-4 bg-white border-t border-slate-100 flex-shrink-0 z-10 flex justify-center">
                <button
                    onClick={handleEdit}
                    className="w-1/2 bg-primary-600 text-white py-3 rounded-xl font-bold text-lg 
                    shadow-lg shadow-primary-200 hover:bg-primary-700 transition active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    <span>수정하기</span>
                </button>
            </div>
        </div>
    );
}

/**
 * ㅁㄴㅇㅁㄴㅇ
 */
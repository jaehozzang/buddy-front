import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, getYear, getMonth } from "date-fns";
import { diaryApi } from "../api/diaryApi";
import type { DiarySummary } from "../types/diary";
import { IS_TEST_MODE } from "../config";

export default function CalendarPage() {
  const navigate = useNavigate();

  // 1. 상태 관리
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyDiaries, setDailyDiaries] = useState<DiarySummary[]>([]);
  const [monthlyDiaries, setMonthlyDiaries] = useState<DiarySummary[]>([]);
  const [loading, setLoading] = useState(false);

  // 달력 계산
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // 월간 데이터 날짜 Set
  const markedDates = useMemo(() => {
    if (!monthlyDiaries || !Array.isArray(monthlyDiaries)) return new Set<string>();
    return new Set(monthlyDiaries.map(diary => {
      if (!diary.createAt) return "";
      return diary.createAt.split('T')[0];
    }));
  }, [monthlyDiaries]);

  // 월간 데이터 요청
  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        if (!IS_TEST_MODE) {
          const year = getYear(currentMonth);
          const month = getMonth(currentMonth) + 1;
          const response = await diaryApi.getMonthlyDiaries(year, month);
          if (response && Array.isArray(response.result)) {
            setMonthlyDiaries(response.result);
          }
        }
      } catch (error) {
        console.error("월간 데이터 로드 실패", error);
      }
    };
    fetchMonthlyData();
  }, [currentMonth]);

  // 일간 데이터 요청
  useEffect(() => {
    const fetchDiaries = async () => {
      setLoading(true);
      const dateStr = format(selectedDate, "yyyy-MM-dd");

      try {
        if (IS_TEST_MODE) {
          // 테스트 모드
          setDailyDiaries(Array(5).fill(null).map((_, i) => ({
            diarySeq: i + 1,
            title: `레이아웃 확인용 ${i + 1}`,
            summary: "텍스트는 왼쪽에 나오고, 사진은 오른쪽에 작게 나와야 합니다.",
            createAt: dateStr + `T10:00:00`,
            tags: ["디자인", "수정"],
            images: i % 2 === 0 ? ["https://picsum.photos/200"] : []
          } as any)));
        } else {
          const response = await diaryApi.getDiariesByDate(dateStr);
          // 🚨 데이터 확인용 로그
          console.log("리스트 조회 데이터:", response.result);

          if (response.result && Array.isArray(response.result)) {
            setDailyDiaries(response.result);
          } else {
            setDailyDiaries([]);
          }
        }
      } catch (error) {
        console.error("일기 로드 실패", error);
        setDailyDiaries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDiaries();
  }, [selectedDate]);

  // 핸들러들
  const handleDiaryClick = (diarySeq: number) => navigate(`/app/diary/${diarySeq}`);

  const handleWriteNew = () => navigate("/app/diary/new", { state: { date: format(selectedDate, "yyyy-MM-dd") } });

  // ✅ [삭제됨] handleEditClick 함수 제거 (리스트에서 수정 버튼 뺐으니까 필요 없음)

  // 달력 렌더링 함수들
  const renderCells = () => {
    const rows = [];
    let days = [];
    let day = startDate;
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, "d");
        const dateKey = format(day, "yyyy-MM-dd");
        const cloneDay = day;
        const isSelected = isSameDay(day, selectedDate);
        const isNotCurrentMonth = !isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());
        const hasDiary = markedDates.has(dateKey);

        days.push(
          <div
            key={day.toString()}
            className={`relative h-20 md:h-auto md:flex-1 border-r border-b border-slate-100 flex flex-col items-start justify-start p-2 cursor-pointer transition-colors
              ${isNotCurrentMonth ? "text-slate-300 bg-slate-50/50" : "text-slate-700 bg-white"}
              ${isSelected ? "bg-primary-50 ring-2 ring-inset ring-primary-200 z-10" : "hover:bg-slate-50"}
            `}
            onClick={() => setSelectedDate(cloneDay)}
          >
            {hasDiary && !isNotCurrentMonth && (
              <div className="absolute inset-1 bg-green-100/50 rounded pointer-events-none" />
            )}
            <span className={`relative z-10 text-sm font-medium ${isToday ? "bg-primary-600 text-white w-6 h-6 rounded-full flex items-center justify-center" : ""}`}>
              {formattedDate}
            </span>
            {hasDiary && !isNotCurrentMonth && (
              <div className="relative z-10 mt-1 w-1.5 h-1.5 bg-green-500 rounded-full" />
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 flex-1 border-l border-slate-100" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return rows;
  };

  const renderDays = () => {
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    return (
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 flex-shrink-0">
        {days.map((d, i) => (
          <div key={i} className={`py-3 text-center text-xs font-bold ${i === 0 ? "text-red-400" : "text-slate-500"}`}>
            {d}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col md:flex-row bg-white overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
      {/* [왼쪽] 달력 */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-800">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-500">‹</button>
            <button onClick={nextMonth} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-500">›</button>
          </div>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          {renderDays()}
          <div className="flex-1 flex flex-col border-t border-slate-100">
            {renderCells()}
          </div>
        </div>
      </div>

      {/* [오른쪽] 일기 리스트 */}
      <div className="w-full md:w-[400px] border-t md:border-t-0 md:border-l border-slate-200 bg-slate-50/50 flex flex-col h-[45%] md:h-full overflow-hidden">
        {/* 리스트 헤더 */}
        <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between flex-shrink-0 z-10 shadow-sm h-[70px]">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              {format(selectedDate, "yyyy. MM. dd")}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {loading ? "로딩 중..." : `${dailyDiaries.length}개의 기록`}
            </p>
          </div>
          <button
            onClick={handleWriteNew}
            className="text-xs font-bold bg-primary-600 text-white hover:bg-primary-700 px-3 py-2 rounded-lg transition shadow-md flex items-center gap-1"
          >
            <span>+</span> 기록하기
          </button>
        </div>

        {/* 리스트 본문 */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">불러오는 중...</div>
          ) : dailyDiaries.length > 0 ? (
            <div className="space-y-3 animate-[fade-in_0.3s] pb-10">
              {dailyDiaries.map((diary) => {
                // 🖼️ 이미지 찾기 로직
                const imgList = (diary as any).images || [];
                const singleImg = (diary as any).imageUrl || (diary as any).thumbnail;

                let previewUrl = null;
                if (Array.isArray(imgList) && imgList.length > 0) {
                  const firstItem = imgList[0];
                  previewUrl = typeof firstItem === 'string' ? firstItem : firstItem.url;
                } else if (singleImg) {
                  previewUrl = singleImg;
                }

                return (
                  <div
                    key={diary.diarySeq}
                    onClick={() => handleDiaryClick(diary.diarySeq)}
                    className="group bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-primary-300 transition cursor-pointer relative overflow-hidden"
                  >
                    {/* ✅ 레이아웃: flex로 좌우 분할 */}
                    <div className="flex gap-4">

                      {/* 👈 [왼쪽] 텍스트 정보 (flex-1) */}
                      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                        {/* 상단: 제목 + 시간 */}
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-slate-800 text-sm truncate pr-1">
                            {diary.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded flex-shrink-0">
                            {diary.createAt.split('T')[1]?.substring(0, 5)}
                          </span>
                        </div>

                        {/* 요약 내용 (최대 2줄) */}
                        <p className="text-slate-600 text-xs leading-relaxed line-clamp-2">
                          {diary.summary}
                        </p>

                        {/* 태그 */}
                        {diary.tags && (
                          <div className="flex flex-wrap gap-1 mt-auto pt-1">
                            {diary.tags.map((tag: any, idx) => {
                              const tagName = typeof tag === 'string' ? tag : tag.name;
                              return (
                                <span key={idx} className="text-[10px] text-primary-600 font-bold bg-primary-50 px-1.5 py-0.5 rounded-md">
                                  #{tagName}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* 👉 [오른쪽] 썸네일 이미지 (사진 있을 때만 렌더링) */}
                      {previewUrl && (
                        <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                          <img
                            src={previewUrl}
                            alt="thumbnail"
                            className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500"
                          />
                        </div>
                      )}

                    </div>
                    {/* 🗑️ 수정 버튼 제거 완료! */}
                  </div>
                );
              })}
            </div>
          ) : (
            // 데이터 없을 때
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 text-2xl">
                📅
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-600">작성된 기록이 없어요</p>
                <p className="text-xs text-slate-400 mt-1">오늘 하루는 어땠나요?</p>
              </div>
              <button
                onClick={handleWriteNew}
                className="mt-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition"
              >
                첫 기록 남기기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
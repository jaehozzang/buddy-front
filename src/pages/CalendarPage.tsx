import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay } from "date-fns";
import { diaryApi } from "../api/diaryApi";
import type { DiarySummary } from "../types/diary";
import { IS_TEST_MODE } from "../config";

export default function CalendarPage() {
  const navigate = useNavigate();

  // 1. 상태 관리
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyDiaries, setDailyDiaries] = useState<DiarySummary[]>([]);
  const [loading, setLoading] = useState(false);

  // 달력 계산
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  useEffect(() => {
    const fetchDiaries = async () => {
      setLoading(true);
      const dateStr = format(selectedDate, "yyyy-MM-dd");

      try {
        if (IS_TEST_MODE) {
          // 테스트용 데이터 (스크롤 확인용으로 많이 생성)
          setDailyDiaries(Array(10).fill(null).map((_, i) => ({
            diarySeq: i + 1,
            title: `스크롤 테스트 ${i + 1}`,
            summary: "일기가 많아지면 스크롤이 생겨야 합니다. ".repeat(2),
            createAt: dateStr + `T10:00:00`,
            tags: ["테스트"]
          })));
        } else {
          const response = await diaryApi.getDiariesByDate(dateStr);
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

  const handleDiaryClick = (diarySeq: number) => {
    navigate(`/app/diary/${diarySeq}`);
  };

  const handleWriteNew = () => {
    navigate("/app/diary/new", {
      state: { date: format(selectedDate, "yyyy-MM-dd") }
    });
  };

  const handleEditClick = (e: React.MouseEvent, diarySeq: number) => {
    e.stopPropagation();
    navigate(`/app/diary/${diarySeq}`, { state: { mode: "edit" } });
  };

  // 날짜 렌더링
  const renderCells = () => {
    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, "d");
        const cloneDay = day;
        const isSelected = isSameDay(day, selectedDate);
        const isNotCurrentMonth = !isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());

        days.push(
          <div
            key={day.toString()}
            className={`relative h-20 md:h-auto md:flex-1 border-r border-b border-slate-100 flex flex-col items-start justify-start p-2 cursor-pointer transition-colors
              ${isNotCurrentMonth ? "text-slate-300 bg-slate-50/50" : "text-slate-700 bg-white"}
              ${isSelected ? "bg-primary-50 ring-2 ring-inset ring-primary-200 z-10" : "hover:bg-slate-50"}
            `}
            onClick={() => setSelectedDate(cloneDay)}
          >
            <span className={`text-sm font-medium ${isToday ? "bg-primary-600 text-white w-6 h-6 rounded-full flex items-center justify-center" : ""}`}>
              {formattedDate}
            </span>
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
    // 🚨 [핵심 수정 1] h-full을 지우고, calc()로 높이를 강제 고정합니다.
    // 100vh(전체화면) - 80px(헤더높이+여백) = 남은 공간 꽉 채우기
    <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row bg-white overflow-hidden rounded-2xl border border-slate-200 shadow-sm">

      {/* [왼쪽] 달력 영역 */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* 달력 헤더 */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-800">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-500">‹</button>
            <button onClick={nextMonth} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-500">›</button>
          </div>
        </div>
        
        {/* 달력 그리드 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {renderDays()}
          <div className="flex-1 flex flex-col border-t border-slate-100">
            {renderCells()}
          </div>
        </div>
      </div>

      {/* [오른쪽] 일기 리스트 영역 */}
      {/* 🚨 [핵심 수정 2] h-full과 overflow-hidden 필수 */}
      <div className="w-full md:w-[400px] border-t md:border-t-0 md:border-l border-slate-200 bg-slate-50/50 flex flex-col h-[45%] md:h-full overflow-hidden">

        {/* 리스트 헤더 (고정) */}
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

        {/* 리스트 스크롤 영역 */}
        {/* 🚨 [핵심 수정 3] flex-1로 남은 공간 다 차지하고, 넘치면 여기서 스크롤(overflow-y-auto) */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">불러오는 중...</div>
          ) : dailyDiaries.length > 0 ? (
            <div className="space-y-4 animate-[fade-in_0.3s] pb-10">
              {dailyDiaries.map((diary) => (
                <div
                  key={diary.diarySeq}
                  onClick={() => handleDiaryClick(diary.diarySeq)}
                  className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-primary-300 transition cursor-pointer relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-800 text-sm truncate pr-2 flex-1">
                      {diary.title}
                    </h4>
                    <button
                      onClick={(e) => handleEditClick(e, diary.diarySeq)}
                      className="text-[10px] text-slate-300 hover:text-primary-600 font-bold px-2 py-1 rounded hover:bg-primary-50 transition"
                    >
                      수정 ›
                    </button>
                  </div>
                  <div className="mb-2">
                    <span className="text-[10px] text-slate-400">
                      {diary.createAt.split('T')[1]?.substring(0, 5)}
                    </span>
                  </div>
                  <div className="mb-3">
                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
                      {diary.summary}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {diary.tags.map((tag: any, idx) => {
                      const tagName = typeof tag === 'string' ? tag : tag.name;
                      return (
                        <span key={idx} className="bg-slate-50 border border-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-medium">
                          #{tagName}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
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
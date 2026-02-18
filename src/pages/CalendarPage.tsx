import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, getYear, getMonth } from "date-fns";
import { diaryApi, type DailyDiaryCount } from "../api/diaryApi";
import type { DiarySummary } from "../types/diary";
import { IS_TEST_MODE } from "../config";

// 팝업 컴포넌트
import DiaryViewPage from "./DiaryViewPage";
import DiaryPage from "./DiaryPage";

export default function CalendarPage() {
  const location = useLocation();

  // 1. 달력 관련 State
  const [selectedDate, setSelectedDate] = useState(() => {
    const savedDate = sessionStorage.getItem("calendarDate");
    return savedDate ? new Date(savedDate) : new Date();
  });

  const [currentMonth, setCurrentMonth] = useState(() => {
    const savedDate = sessionStorage.getItem("calendarDate");
    return savedDate ? new Date(savedDate) : new Date();
  });

  const [dailyDiaries, setDailyDiaries] = useState<DiarySummary[]>([]);
  const [monthlyCounts, setMonthlyCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  // 2. 모달 관련 State
  const [viewingDiaryId, setViewingDiaryId] = useState<number | null>(null);
  const [writeMode, setWriteMode] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    diaryId?: number;
    date?: string;
    sessionId?: number;
  }>({ isOpen: false, mode: "create" });

  // 3. 외부에서 넘어왔을 때 처리
  useEffect(() => {
    if (location.state?.sessionId) {
      setWriteMode({
        isOpen: true,
        mode: "create",
        date: location.state.date || new Date().toISOString().split("T")[0],
        sessionId: location.state.sessionId
      });
      window.history.replaceState({}, document.title);
    }

    if (location.state?.openDiaryId) {
      setViewingDiaryId(location.state.openDiaryId);
      if (location.state.targetDate) {
        const target = new Date(location.state.targetDate);
        setSelectedDate(target);
        setCurrentMonth(target);
      }
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // 날짜 저장
  useEffect(() => {
    sessionStorage.setItem("calendarDate", selectedDate.toISOString());
  }, [selectedDate]);

  // 달력 계산
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // --- 데이터 로드 ---
  const fetchMonthlyData = async () => {
    try {
      if (IS_TEST_MODE) {
        const dummyCounts: Record<string, number> = {};
        let day = startDate;
        while (day <= endDate) {
          if (Math.random() > 0.5) {
            dummyCounts[format(day, "yyyy-MM-dd")] = Math.floor(Math.random() * 3) + 1;
          }
          day = addDays(day, 1);
        }
        setMonthlyCounts(dummyCounts);
      } else {
        const year = getYear(currentMonth);
        const month = getMonth(currentMonth) + 1;
        const response = await diaryApi.getMonthlyDiaryCounts(year, month);
        const countMap: Record<string, number> = {};
        if (response.result && Array.isArray(response.result)) {
          response.result.forEach((item: DailyDiaryCount) => {
            countMap[item.date] = item.count;
          });
        }
        setMonthlyCounts(countMap);
      }
    } catch (error) {
      console.error("데이터 로드 실패", error);
    }
  };

  const fetchDailyDiaries = async () => {
    setLoading(true);
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    try {
      if (IS_TEST_MODE) {
        setDailyDiaries(Array(3).fill(null).map((_, i) => ({
          diarySeq: i + 1,
          title: `테스트 일기 ${i + 1}`,
          summary: "테스트 내용입니다.",
          createAt: dateStr + `T10:00:00`,
          tags: ["테스트"],
          images: []
        } as any)));
      } else {
        const response = await diaryApi.getDiariesByDate(dateStr);
        setDailyDiaries(response.result && Array.isArray(response.result) ? response.result : []);
      }
    } catch (error) {
      setDailyDiaries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMonthlyData(); }, [currentMonth]);
  useEffect(() => { fetchDailyDiaries(); }, [selectedDate]);

  const refreshData = () => {
    fetchMonthlyData();
    fetchDailyDiaries();
  };

  // --- 핸들러 ---
  const handleDiaryClick = (diarySeq: number) => setViewingDiaryId(diarySeq);
  const handleWriteNew = () => setWriteMode({
    isOpen: true,
    mode: "create",
    date: format(selectedDate, "yyyy-MM-dd")
  });
  const handleSwitchToEdit = (diary: any) => {
    setViewingDiaryId(null);
    setWriteMode({
      isOpen: true,
      mode: "edit",
      diaryId: diary.diarySeq || diary.id,
      date: diary.diaryDate
    });
  };
  const closeModalsAndRefresh = () => {
    setViewingDiaryId(null);
    setWriteMode({ ...writeMode, isOpen: false });
    refreshData();
  };

  // --- 렌더링 ---
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
        const count = monthlyCounts[dateKey] || 0;

        let dotColorClass = "";
        if (!isNotCurrentMonth && count > 0) {
          if (count === 1) dotColorClass = "bg-primary-300";
          else if (count === 2) dotColorClass = "bg-primary-500";
          else dotColorClass = "bg-primary-700";
        }

        days.push(
          <div
            key={day.toString()}
            // ✨ [수정] 날짜 셀 스타일 (다크모드 대응)
            // - 기본: bg-white -> dark:bg-slate-900
            // - 이번달 아님: bg-slate-50/50 -> dark:bg-slate-800/50, text-slate-300 -> dark:text-slate-600
            // - 테두리: border-slate-100 -> dark:border-slate-800
            className={`
              relative h-20 md:h-auto md:flex-1 border-r border-b border-slate-100 dark:border-slate-800
              flex flex-col items-start justify-start p-2 cursor-pointer transition-colors
              ${isNotCurrentMonth
                ? "text-slate-300 dark:text-slate-600 bg-slate-50/50 dark:bg-slate-800/50"
                : "text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"}
              ${isSelected ? "ring-2 ring-inset ring-primary-400 z-10" : ""}
            `}
            onClick={() => {
              setSelectedDate(cloneDay);
              if (!isSameMonth(cloneDay, currentMonth)) {
                setCurrentMonth(cloneDay);
              }
            }}
          >
            <span className={`text-sm font-medium z-10 ${isToday ? "bg-primary-600 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-sm" : ""}`}>
              {formattedDate}
            </span>
            {dotColorClass && (
              <div className={`absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full ${dotColorClass}`} />
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        // ✨ [수정] 행 테두리: border-slate-100 -> dark:border-slate-800
        <div className="grid grid-cols-7 flex-1 border-l border-slate-100 dark:border-slate-800" key={day.toString()}>
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
      // ✨ [수정] 요일 행 배경: bg-slate-50 -> dark:bg-slate-800, 테두리
      <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex-shrink-0">
        {days.map((d, i) => (
          // ✨ [수정] 텍스트 색상
          <div key={i} className={`py-3 text-center text-xs font-bold ${i === 0 ? "text-red-400" : "text-slate-500 dark:text-slate-400"}`}>
            {d}
          </div>
        ))}
      </div>
    );
  };

  return (
    // ✨ [수정] 전체 컨테이너: bg-white -> dark:bg-slate-900, border
    <div className="h-[calc(100vh-160px)] flex flex-col md:flex-row bg-white dark:bg-slate-900 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative transition-colors duration-300">

      {/* [왼쪽] 달력 */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* ✨ [수정] 달력 헤더: border */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex-shrink-0">
          {/* ✨ [수정] 월/년 텍스트: text-slate-800 -> dark:text-white */}
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <div className="flex gap-2">
            {/* ✨ [수정] 이동 버튼: border, text, hover */}
            <button onClick={prevMonth} className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-600 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400">‹</button>
            <button onClick={nextMonth} className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-600 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400">›</button>
          </div>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          {renderDays()}
          {/* ✨ [수정] 달력 격자 상단 테두리: border-slate-100 -> dark:border-slate-700 */}
          <div className="flex-1 flex flex-col border-t border-slate-100 dark:border-slate-700">
            {renderCells()}
          </div>
        </div>
      </div>

      {/* [오른쪽] 일기 리스트 */}
      {/* ✨ [수정] 리스트 배경: bg-slate-50/50 -> dark:bg-slate-800, border */}
      <div className="w-full md:w-[400px] border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 flex flex-col h-[45%] md:h-full overflow-hidden transition-colors">

        {/* 리스트 헤더 */}
        {/* ✨ [수정] 헤더 배경: bg-white -> dark:bg-slate-800, border */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between flex-shrink-0 z-10 shadow-sm h-[73px]">
          <div>
            {/* ✨ [수정] 날짜 텍스트: text-slate-800 -> dark:text-white */}
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
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

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">불러오는 중...</div>
          ) : dailyDiaries.length > 0 ? (
            <div className="space-y-3 animate-[fade-in_0.3s] pb-10">
              {dailyDiaries.map((diary) => {
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
                    // ✨ [수정] 일기 카드: bg-white -> dark:bg-slate-700, border, hover
                    className="group bg-white dark:bg-slate-700 p-4 rounded-2xl border border-slate-200 dark:border-slate-600 shadow-sm hover:shadow-md hover:border-primary-300 dark:hover:border-slate-500 transition cursor-pointer relative overflow-hidden"
                  >
                    <div className="flex gap-4">
                      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                        <div className="flex justify-between items-start">
                          {/* ✨ [수정] 제목: text-slate-800 -> dark:text-white */}
                          <h4 className="font-bold text-slate-800 dark:text-white text-sm truncate pr-1">
                            {diary.title}
                          </h4>
                        </div>
                        {/* ✨ [수정] 요약: text-slate-600 -> dark:text-slate-300 */}
                        <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed line-clamp-2">
                          {diary.summary}
                        </p>
                        {diary.tags && (
                          <div className="flex flex-wrap gap-1 mt-auto pt-1">
                            {diary.tags.map((tag: any, idx) => {
                              const tagName = typeof tag === 'string' ? tag : tag.name;
                              return (
                                // ✨ [수정] 태그: bg-primary-50 -> dark:bg-primary-900/40, text
                                <span key={idx} className="text-[10px] text-primary-600 dark:text-primary-300 font-bold bg-primary-50 dark:bg-primary-900/40 px-1.5 py-0.5 rounded-md">
                                  #{tagName}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      {previewUrl && (
                        // ✨ [수정] 썸네일 박스: border, bg
                        <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-600 bg-slate-50 dark:bg-slate-600">
                          <img
                            src={previewUrl}
                            alt="thumbnail"
                            className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
              {/* ✨ [수정] 빈 아이콘 박스: bg-white -> dark:bg-slate-700 */}
              <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-600 text-2xl">
                📅
              </div>
              <div className="text-center">
                {/* ✨ [수정] 빈 텍스트 */}
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">작성된 기록이 없어요</p>
                <p className="text-xs text-slate-400 mt-1">오늘 하루는 어땠나요?</p>
              </div>
              <button
                onClick={handleWriteNew}
                // ✨ [수정] 첫 기록 버튼: bg-white -> dark:bg-slate-700, border, text
                className="mt-2 px-6 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 text-sm font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition"
              >
                첫 기록 남기기
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 팝업들 (얘네는 각각 파일에서 dark 모드 처리해야 함) */}
      {viewingDiaryId && (
        <DiaryViewPage
          diaryId={viewingDiaryId}
          onClose={() => setViewingDiaryId(null)}
          onEdit={handleSwitchToEdit}
          onDeleteSuccess={closeModalsAndRefresh}
        />
      )}

      {writeMode.isOpen && (
        <DiaryPage
          mode={writeMode.mode}
          initialDate={writeMode.date}
          diaryId={writeMode.diaryId}
          sessionId={writeMode.sessionId}
          onClose={() => setWriteMode({ ...writeMode, isOpen: false })}
          onSaveSuccess={closeModalsAndRefresh}
        />
      )}

    </div>
  );
}
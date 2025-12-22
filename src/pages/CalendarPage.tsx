import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDiaryStore } from "../store/useDiaryStore";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay } from "date-fns";

export default function CalendarPage() {
  const navigate = useNavigate();
  const { diaries } = useDiaryStore();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const selectedDiary = diaries.find((d) => d.date === selectedDateStr);

  // 달력 계산
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // --- 수정하기 핸들러 ---
  const handleEdit = () => {
    if (!selectedDiary) return;
    navigate("/app/diary/new", { state: { date: selectedDateStr, originDiary: selectedDiary } });
  };

  // --- 새로 쓰기 핸들러 ---
  const handleWriteNew = () => {
    navigate("/app/diary/new", { state: { date: selectedDateStr } });
  };

  // --- 날짜 칸 렌더링 ---
  const renderCells = () => {
    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, "d");
        const cloneDay = day;
        const dateKey = format(day, "yyyy-MM-dd");
        const hasDiary = diaries.some((d) => d.date === dateKey);
        const isSelected = isSameDay(day, selectedDate);
        const isNotCurrentMonth = !isSameMonth(day, monthStart);

        days.push(
          <div
            key={day.toString()}
            // 높이를 h-20 ~ md:h-24 정도로 잡아서 적당한 크기 유지
            className={`relative h-20 md:h-24 border-r border-b border-slate-100 flex flex-col items-start justify-start p-2 cursor-pointer transition-colors
              ${isNotCurrentMonth ? "text-slate-300 bg-slate-50/50" : "text-slate-700 bg-white"}
              ${isSelected ? "bg-primary-50 ring-2 ring-inset ring-primary-200 z-10" : "hover:bg-slate-50"}
            `}
            onClick={() => setSelectedDate(cloneDay)}
          >
            <span className={`text-sm font-medium ${isSameDay(day, new Date()) ? "bg-primary-600 text-white w-6 h-6 rounded-full flex items-center justify-center" : ""}`}>
              {formattedDate}
            </span>
            {hasDiary && (
              <div className="mt-auto self-center mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mx-auto"></div>
              </div>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 border-l border-slate-100" key={day.toString()}>
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
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
        {days.map((d, i) => (
          <div key={i} className={`py-3 text-center text-xs font-bold ${i === 0 ? "text-red-400" : "text-slate-500"}`}>
            {d}
          </div>
        ))}
      </div>
    );
  };

  return (
    // ✨ [수정 포인트]
    // 1. rounded-2xl: 모서리를 둥글게
    // 2. border border-slate-200: 전체를 감싸는 회색 테두리 추가
    // 3. shadow-md: 살짝 그림자를 줘서 떠있는 느낌 (선택사항)
    <div className="h-full flex flex-col md:flex-row bg-white overflow-hidden rounded-2xl border border-slate-200 ">

      {/* -------------------- */}
      {/* [왼쪽] 달력 영역 */}
      {/* -------------------- */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* 달력 헤더 */}
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="text-xl font-bold text-slate-800">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-500">‹</button>
            <button onClick={nextMonth} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-500">›</button>
          </div>
        </div>

        {/* 달력 그리드 */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {renderDays()}
          <div className="border-t border-slate-100">
            {renderCells()}
          </div>
        </div>
      </div>

      {/* -------------------- */}
      {/* [오른쪽] 일기 상세 영역 */}
      {/* -------------------- */}
      <div className="w-full md:w-[380px] border-t md:border-t-0 md:border-l border-slate-200 bg-slate-50/50 flex flex-col h-[40%] md:h-full">

        {/* 상세 영역 헤더 */}
        <div className="px-6 py-5 border-b border-slate-200 bg-white flex items-center justify-between flex-shrink-0">
          <h3 className="text-sm font-bold text-slate-800">
            {format(selectedDate, "yyyy. MM. dd")} (Today)
          </h3>
          {/* 수정 버튼 */}
          {selectedDiary && (
            <button
              onClick={handleEdit}
              className="text-xs font-bold text-primary-600 hover:bg-primary-50 px-3 py-1.5 rounded-full transition border border-primary-200"
            >
              ✏️ Edit
            </button>
          )}
        </div>

        {/* 상세 내용 */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedDiary ? (
            <div className="space-y-4 animate-[fade-in_0.3s]">
              {/* 기분 태그 */}
              <div className="flex items-center gap-2">
                <span className="bg-white border border-primary-200 text-primary-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                  {selectedDiary.mood}
                </span>
              </div>

              {/* 일기 본문 */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-slate-600 text-sm leading-7 whitespace-pre-wrap">
                {selectedDiary.content}
              </div>
            </div>
          ) : (
            // 일기 없을 때
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
                className="mt-2 px-6 py-2.5 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 transition shadow-lg shadow-primary-200"
              >
                새 일기 작성하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
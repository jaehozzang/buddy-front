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

  // ✨ [변경 1] 해당 날짜의 일기 '모두' 가져오기 (find -> filter)
  const dailyDiaries = diaries.filter((d) => d.date === selectedDateStr);

  // 달력 계산 (기존 동일)
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // --- 수정하기 핸들러 (특정 일기를 클릭했을 때) ---
  const handleEdit = (diary: any) => {
    // mode: 'edit'를 명시적으로 넘겨주어 DiaryPage에서 인식하게 함
    navigate("/app/diary/new", {
      state: {
        mode: "edit", // DiaryPage props에 맞게 전달
        date: selectedDateStr,
        originDiary: diary
      }
    });
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

        // ✨ [변경 2] 점 찍기 로직: 해당 날짜에 일기가 1개라도 있으면 표시
        const hasDiary = diaries.some((d) => d.date === dateKey);

        const isSelected = isSameDay(day, selectedDate);
        const isNotCurrentMonth = !isSameMonth(day, monthStart);

        days.push(
          <div
            key={day.toString()}
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
    <div className="h-full flex flex-col md:flex-row bg-white overflow-hidden rounded-2xl border border-slate-200">

      {/* [왼쪽] 달력 영역 (기존과 동일) */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="text-xl font-bold text-slate-800">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-500">‹</button>
            <button onClick={nextMonth} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-500">›</button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {renderDays()}
          <div className="border-t border-slate-100">
            {renderCells()}
          </div>
        </div>
      </div>

      {/* -------------------- */}
      {/* ✨ [오른쪽] 일기 상세 영역 (대폭 수정됨) */}
      {/* -------------------- */}
      <div className="w-full md:w-[400px] border-t md:border-t-0 md:border-l border-slate-200 bg-slate-50/50 flex flex-col h-[45%] md:h-full">

        {/* 1. 상세 영역 헤더 */}
        <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between flex-shrink-0 z-10 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              {format(selectedDate, "yyyy. MM. dd")}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {dailyDiaries.length}개의 기록
            </p>
          </div>

          {/* ✨ [추가] 일기가 있어도 '새 글 작성' 가능하게 버튼 추가 */}
          <button
            onClick={handleWriteNew}
            className="text-xs font-bold bg-primary-600 text-white hover:bg-primary-700 px-3 py-2 rounded-lg transition shadow-md flex items-center gap-1"
          >
            <span>+</span> 기록하기
          </button>
        </div>

        {/* 2. 상세 내용 (리스트 형태) */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          {dailyDiaries.length > 0 ? (
            <div className="space-y-4 animate-[fade-in_0.3s]">
              {dailyDiaries.map((diary) => (
                <div
                  key={diary.id}
                  onClick={() => handleEdit(diary)} // 클릭 시 수정 페이지로
                  className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-primary-300 transition cursor-pointer relative overflow-hidden"
                >
                  {/* 기분 & 시간(선택) */}
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-slate-50 border border-slate-200 text-slate-600 px-2 py-1 rounded-md text-xs font-bold">
                      {diary.mood}
                    </span>
                    <span className="text-[10px] text-slate-300 group-hover:text-primary-400 transition">
                      수정하기 ›
                    </span>
                  </div>

                  {/* 본문 & 썸네일 */}
                  <div className="flex gap-4">
                    {/* 텍스트 (줄임 처리) */}
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                        {diary.content}
                      </p>
                    </div>

                    {/* ✨ 이미지가 있으면 썸네일 표시 */}
                    {diary.images && diary.images.length > 0 && (
                      <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-100">
                        <img
                          src={diary.images[0]}
                          alt="thumb"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // 일기 없을 때 (기존 디자인 유지)
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
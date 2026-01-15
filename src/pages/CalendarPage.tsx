import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay } from "date-fns";
import { diaryApi } from "../api/diaryApi"; // ✨ API 함수 임포트
import type { DiarySummary } from "../types/diary"; // ✨ 타입 임포트
import { IS_TEST_MODE } from "../config";

export default function CalendarPage() {
  const navigate = useNavigate();

  // 1. 상태 관리
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // 서버에서 받아온 일기 목록
  const [dailyDiaries, setDailyDiaries] = useState<DiarySummary[]>([]);
  const [loading, setLoading] = useState(false);

  // 달력 계산
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // ✨ [변경] 날짜가 변경되면 서버에 요청보내기
  useEffect(() => {
    const fetchDiaries = async () => {
      setLoading(true);
      const dateStr = format(selectedDate, "yyyy-MM-dd");

      try {

        if (IS_TEST_MODE) {
          console.log(`[TEST] ${dateStr} 일기 조회`);
          await new Promise(r => setTimeout(r, 300)); // 로딩 흉내
          // 가짜 데이터 (명세서 구조에 맞춤)
          setDailyDiaries([
            {
              diarySeq: 1,
              title: "멋진 UI 디자인",
              summary: "오늘은 캘린더 디자인을 새로 짰다. 왼쪽엔 달력, 오른쪽엔 리스트!",
              createAt: dateStr + "T10:00:00",
              tags: ["코딩", "디자인"]
            }
          ]);
        } else {
          // 🚀 [REAL] 서버 통신
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
  }, [selectedDate]); // selectedDate가 바뀔 때마다 실행

  // --- 상세 페이지 이동 ---
  const handleDiaryClick = (diarySeq: number) => {
    // 상세 페이지로 이동 (ID만 넘김)
    navigate(`/app/diary/${diarySeq}`);
  };

  // --- 새로 쓰기 핸들러 ---
  const handleWriteNew = () => {
    // 작성 페이지로 날짜 전달
    navigate("/app/diary/new", {
      state: { date: format(selectedDate, "yyyy-MM-dd") }
    });
  };

  // ✨ [추가] 수정 버튼 핸들러
  const handleEditClick = (e: React.MouseEvent, diarySeq: number) => {
    e.stopPropagation(); // 카드를 누른 게 아니라 수정 버튼만 누른 것으로 처리
    // 수정 모드로 이동 (DiaryPage가 id를 받아서 API 호출함)
    navigate(`/app/diary/${diarySeq}`, { state: { mode: "edit" } });
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
        // const dateKey = format(day, "yyyy-MM-dd");

        const isSelected = isSameDay(day, selectedDate);
        const isNotCurrentMonth = !isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());

        days.push(
          <div
            key={day.toString()}
            className={`relative h-20 md:h-24 border-r border-b border-slate-100 flex flex-col items-start justify-start p-2 cursor-pointer transition-colors
              ${isNotCurrentMonth ? "text-slate-300 bg-slate-50/50" : "text-slate-700 bg-white"}
              ${isSelected ? "bg-primary-50 ring-2 ring-inset ring-primary-200 z-10" : "hover:bg-slate-50"}
            `}
            onClick={() => setSelectedDate(cloneDay)}
          >
            <span className={`text-sm font-medium ${isToday ? "bg-primary-600 text-white w-6 h-6 rounded-full flex items-center justify-center" : ""}`}>
              {formattedDate}
            </span>

            {/* ✨ [참고] 현재 API 구조상 월간 데이터(어디에 일기가 있는지)를 
               한번에 알 수 없어서 점 찍기는 잠시 숨겨둡니다. 
               나중에 백엔드에 '월간 조회 API'를 요청하면 살릴 수 있습니다!
            */}
            {/* {hasDiary && (
              <div className="mt-auto self-center mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mx-auto"></div>
              </div>
            )} 
            */}
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

      {/* [왼쪽] 달력 영역 */}
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
      {/* [오른쪽] 일기 상세 영역 */}
      {/* -------------------- */}
      <div className="w-full md:w-[400px] border-t md:border-t-0 md:border-l border-slate-200 bg-slate-50/50 flex flex-col h-[45%] md:h-full">

        {/* 1. 헤더 */}
        <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between flex-shrink-0 z-10 shadow-sm">
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

        {/* 2. 리스트 */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          {loading ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">불러오는 중...</div>
          ) : dailyDiaries.length > 0 ? (
            <div className="space-y-4 animate-[fade-in_0.3s]">
              {dailyDiaries.map((diary) => (
                <div
                  key={diary.diarySeq}
                  onClick={() => handleDiaryClick(diary.diarySeq)}
                  className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-primary-300 transition cursor-pointer relative overflow-hidden"
                >
                  {/* ✨ [수정됨] 제목 & 수정 버튼 영역 */}
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-800 text-sm truncate pr-2 flex-1">
                      {diary.title}
                    </h4>

                    {/* 여기에 수정 버튼 다시 추가! */}
                    <button
                      onClick={(e) => handleEditClick(e, diary.diarySeq)}
                      className="text-[10px] text-slate-300 hover:text-primary-600 font-bold px-2 py-1 rounded hover:bg-primary-50 transition"
                    >
                      수정 ›
                    </button>
                  </div>

                  {/* 시간 표시 */}
                  <div className="mb-2">
                    <span className="text-[10px] text-slate-400">
                      {diary.createAt.split('T')[1]?.substring(0, 5)}
                    </span>
                  </div>

                  {/* 본문 (요약) */}
                  <div className="mb-3">
                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
                      {diary.summary}
                    </p>
                  </div>

                  {/* 태그 (Mood 대신 Tag 사용) */}
                  <div className="flex flex-wrap gap-1.5">
                    {diary.tags.map((tag: any, idx) => {
                      // ✨ [안전장치] 태그가 문자열이면 그대로, 객체라면 name 프로퍼티 사용
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
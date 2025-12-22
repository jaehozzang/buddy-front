import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDiaryStore } from "../store/useDiaryStore";

export default function DiaryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addDiary } = useDiaryStore();

  // 1. 전달받은 데이터 꺼내기
  // date: 날짜, originDiary: 수정할 경우 넘어오는 기존 일기 데이터
  const { date, originDiary } = location.state || {};

  // 날짜가 없으면 오늘 날짜로 방어 코드
  const targetDate = date || new Date().toISOString().split("T")[0];

  // 2. 상태 초기값 설정 (수정이면 기존 내용, 아니면 빈 값)
  const [content, setContent] = useState(originDiary ? originDiary.content : "");
  const [mood, setMood] = useState(originDiary ? originDiary.mood : "행복");

  const moods = ["행복", "설렘", "평온", "우울", "화남", "피곤"];

  const handleSave = () => {
    if (!content.trim()) {
      alert("일기 내용을 작성해주세요!");
      return;
    }

    // 3. 스토어에 저장 (같은 날짜면 덮어쓰기 됨)
    addDiary({
      id: Date.now().toString(), // ID는 새로 따거나 유지해도 되지만, 덮어쓰기라 상관없음
      date: targetDate,
      mood: mood,
      content: content,
    });

    alert("일기가 저장되었습니다! ✍️");
    navigate("/app/calendar");
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* 상단 헤더 */}
      <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="text-xl text-slate-400 hover:text-slate-600">
          ←
        </button>
        <span className="font-bold text-slate-800">{targetDate} 기록</span>
        <div className="w-6" />
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* 기분 선택 */}
        <section>
          <h3 className="text-sm font-bold text-slate-500 mb-3">오늘의 기분은 어땠나요?</h3>
          <div className="flex flex-wrap gap-2">
            {moods.map((m) => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${mood === m
                    ? "bg-primary-600 text-white shadow-md shadow-primary-300/40 transform scale-105"
                    : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-100"
                  }`}
              >
                {m}
              </button>
            ))}
          </div>
        </section>

        {/* 내용 작성 */}
        <section className="flex-1 h-full">
          <h3 className="text-sm font-bold text-slate-500 mb-3">오늘의 이야기</h3>
          <textarea
            className="w-full h-80 p-5 rounded-2xl border border-slate-200 bg-white text-slate-700 leading-relaxed 
            focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-50 resize-none shadow-sm placeholder:text-slate-300"
            placeholder="오늘 하루는 어땠나요? 자유롭게 기록해보세요."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </section>

      </div>

      {/* 하단 저장 버튼 */}
      <div className="p-4 bg-white border-t border-gray-100">
        <button
          onClick={handleSave}
          className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold text-lg 
          shadow-lg shadow-primary-300/30 hover:bg-primary-700 transition active:scale-[0.98]"
        >
          {originDiary ? "수정완료" : "저장하기"}
        </button>
      </div>
    </div>
  );
}
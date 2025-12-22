import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom"; // useParams 추가
import { useDiaryStore } from "../store/useDiaryStore";

// ✨ 1. Props 타입 정의 (mode를 받을 수 있게 선언)
interface DiaryPageProps {
  mode?: "create" | "edit";
}

// ✨ 2. 컴포넌트에서 props 받기 ({ mode })
export default function DiaryPage({ mode = "create" }: DiaryPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams(); // URL에 있는 id 가져오기 (예: /diary/123)
  const { addDiary, diaries } = useDiaryStore();

  // 3. 넘어온 데이터 확인 (캘린더에서 클릭해서 왔을 때)
  const { date, originDiary } = location.state || {};

  // 날짜 기본값 설정
  const initialDate = date || new Date().toISOString().split("T")[0];

  // 4. 상태 관리
  const [targetDate, setTargetDate] = useState(initialDate);
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("행복");

  const moods = ["행복", "설렘", "평온", "우울", "화남", "피곤"];

  // ✨ 5. [중요] 수정 모드일 때 데이터 채워넣기 (새로고침 대응)
  useEffect(() => {
    if (mode === "edit") {
      // 1순위: 캘린더에서 state로 넘겨준 데이터 사용
      if (originDiary) {
        setTargetDate(originDiary.date);
        setContent(originDiary.content);
        setMood(originDiary.mood);
      }
      // 2순위: 새로고침해서 state가 날아갔으면 URL의 id로 스토어에서 찾기
      else if (id) {
        const foundDiary = diaries.find(d => d.id === id);
        if (foundDiary) {
          setTargetDate(foundDiary.date);
          setContent(foundDiary.content);
          setMood(foundDiary.mood);
        } else {
          alert("존재하지 않는 일기입니다.");
          navigate("/app/calendar");
        }
      }
    } else {
      // 생성 모드일 때 날짜가 state로 넘어왔으면 적용
      if (date) setTargetDate(date);
    }
  }, [mode, originDiary, id, diaries, date, navigate]);


  const handleSave = () => {
    if (!content.trim()) {
      alert("일기 내용을 작성해주세요!");
      return;
    }

    // ID 결정: 수정이면 기존 ID 유지, 생성이면 새 ID 발급
    // (URL 파라미터 id가 있으면 그걸 쓰고, 없으면 originDiary의 id, 그것도 없으면 새거)
    const diaryId = id || originDiary?.id || Date.now().toString();

    addDiary({
      id: diaryId,
      date: targetDate,
      mood: mood,
      content: content,
    });

    alert(mode === "edit" ? "일기가 수정되었습니다! ✏️" : "일기가 등록되었습니다! ✍️");
    navigate("/app/calendar");
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* 상단 헤더 */}
      <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="text-xl text-slate-400 hover:text-slate-600">
          ←
        </button>
        <span className="font-bold text-slate-800">
          {targetDate} {mode === "edit" ? "수정하기" : "기록하기"}
        </span>
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
          {mode === "edit" ? "수정완료" : "저장하기"}
        </button>
      </div>
    </div>
  );
}
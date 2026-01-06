import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDiaryStore } from "../store/useDiaryStore";
import { useAuthStore } from "../store/useAuthStore";

interface DiaryPageProps {
  mode?: "create" | "edit";
}

export default function DiaryPage({ mode = "create" }: DiaryPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const { user } = useAuthStore();
  const { addDiary, diaries } = useDiaryStore();

  const { date, originDiary } = location.state || {};
  const initialDate = date || new Date().toISOString().split("T")[0];

  // 상태 관리
  const [targetDate, setTargetDate] = useState(initialDate);
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("행복");
  // ✨ [추가] 이미지 상태 관리 (문자열 배열)
  const [images, setImages] = useState<string[]>([]);

  // ✨ [추가] 파일 인풋 제어용 Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const moods = ["행복", "설렘", "평온", "우울", "화남", "피곤"];

  // 데이터 불러오기 (수정 모드일 때)
  useEffect(() => {
    if (mode === "edit") {
      if (originDiary) {
        setTargetDate(originDiary.date);
        setContent(originDiary.content);
        setMood(originDiary.mood);
        // ✨ 기존 이미지가 있다면 불러오기 (없으면 빈 배열)
        setImages(originDiary.images || []);
      }
      else if (id) {
        const foundDiary = diaries.find(d => d.id === id);
        if (foundDiary) {
          setTargetDate(foundDiary.date);
          setContent(foundDiary.content);
          setMood(foundDiary.mood);
          setImages(foundDiary.images || []);
        } else {
          alert("존재하지 않는 일기입니다.");
          navigate("/app/calendar");
        }
      }
    } else {
      if (date) setTargetDate(date);
    }
  }, [mode, originDiary, id, diaries, date, navigate]);

  // ✨ [추가] 이미지 파일 선택 핸들러
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 용량 제한 (예: 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("사진 용량이 너무 큽니다. (2MB 이하만 가능)");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      // Base64 문자열을 images 배열에 추가
      if (typeof reader.result === "string") {
        setImages((prev) => [...prev, reader.result as string]);
      }
    };
    reader.readAsDataURL(file);

    // 같은 파일 연속 선택 가능하게 초기화
    e.target.value = "";
  };

  // ✨ [추가] 이미지 삭제 핸들러
  const removeImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSave = () => {
    if (!content.trim()) {
      alert("일기 내용을 작성해주세요!");
      return;
    }

    const diaryId = id || originDiary?.id || Date.now().toString();

    addDiary({
      id: diaryId,
      userId: user?.id || "",
      date: targetDate,
      mood: mood,
      content: content,
      // ✨ 저장할 때 이미지 배열도 같이 저장
      images: images,
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
          <h3 className="text-sm font-bold text-slate-500 mb-3">오늘의 기분</h3>
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

        {/* 내용 작성 영역 */}
        <section className="flex-1 flex flex-col gap-4">
          <div className="flex justify-between items-end">
            <h3 className="text-sm font-bold text-slate-500">오늘의 이야기</h3>

            {/* ✨ [추가] 사진 첨부 버튼 */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs flex items-center gap-1 text-primary-600 font-bold bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition"
            >
              📷 사진 추가
            </button>
            {/* 숨겨진 파일 인풋 */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* ✨ [추가] 이미지 미리보기 영역 */}
          {images.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
              {images.map((imgSrc, idx) => (
                <div key={idx} className="relative flex-shrink-0 w-24 h-24 rounded-xl border border-gray-200 overflow-hidden group">
                  <img src={imgSrc} alt="uploaded" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-black/50 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <textarea
            className="w-full h-64 p-5 rounded-2xl border border-slate-200 bg-white text-slate-700 leading-relaxed 
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
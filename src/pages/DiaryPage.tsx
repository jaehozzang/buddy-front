import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { diaryApi } from "../api/diaryApi";
import { IS_TEST_MODE } from "../config";

interface DiaryPageProps {
  mode?: "create" | "edit";
}

export default function DiaryPage({ mode = "create" }: DiaryPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  // CalendarPage 또는 ChatPage에서 넘겨준 날짜 (없으면 오늘)
  const { date } = location.state || {};

  const [targetDate, setTargetDate] = useState(date || new Date().toISOString().split("T")[0]);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [inputTag, setInputTag] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✨ 1. [추가] AI 로딩 상태 관리
  const [isAiLoading, setIsAiLoading] = useState(false);

  // --- 데이터 불러오기 로직 ---
  useEffect(() => {
    // 1. 수정 모드일 때 (기존 일기 조회)
    if (mode === "edit" && id) {
      fetchDiaryDetail(Number(id));
    }
    // 2. [생성 모드] 채팅방에서 넘어온 sessionId가 있을 때 (AI 일기 생성)
    else if (mode === "create" && location.state?.sessionId) {
      fetchAIDiary(location.state.sessionId);
    }
  }, [mode, id, location.state]);

  // ✨ 2. [수정] AI 일기 초안 가져오기 (로딩 상태 연결)
  const fetchAIDiary = async (sessionId: number) => {
    setIsAiLoading(true); // 🚀 로딩 시작!
    try {
      const response = await diaryApi.createDiaryFromChat(sessionId);

      if (response.result) {
        const d = response.result;
        setTitle(d.title);
        setContent(d.content);

        // 태그 처리 (객체 배열이면 이름만 추출)
        if (d.tags) {
          setTags(d.tags.map((t: any) => (typeof t === "string" ? t : t.name)));
        }
      }
    } catch (error) {
      console.error("AI 일기 생성 실패", error);
      alert("AI 일기 초안을 불러오지 못했습니다.");
    } finally {
      setIsAiLoading(false); // 🏁 로딩 끝! (성공하든 실패하든 꺼짐)
    }
  };

  const fetchDiaryDetail = async (diarySeq: number) => {
    try {
      if (IS_TEST_MODE) {
        setTitle("테스트 일기");
        setContent("서버에서 불러온 내용입니다.");
        setTags(["행복", "코딩"]);
      } else {
        const response = await diaryApi.getDiaryDetail(diarySeq);
        if (response.result) {
          const d = response.result;
          setTitle(d.title);
          setContent(d.content);
          setTags(d.tags.map(t => t.name));
        }
      }
    } catch (error) {
      console.error("일기 상세 조회 실패", error);
      alert("일기를 불러오지 못했습니다.");
      navigate("/app/calendar");
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter" && inputTag.trim()) {
      e.preventDefault();
      if (!tags.includes(inputTag.trim())) {
        setTags([...tags, inputTag.trim()]);
      }
      setInputTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return alert("2MB 이하만 가능합니다.");

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setImages([...images, reader.result]);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleDelete = async () => {
    if (!window.confirm("정말 이 일기를 삭제하시겠습니까? (복구 불가)")) return;
    try {
      if (IS_TEST_MODE) {
        alert("삭제 완료 (테스트)");
      } else if (id) {
        await diaryApi.deleteDiary(Number(id));
        alert("일기가 삭제되었습니다.");
      }
      navigate("/app/calendar", { replace: true });
    } catch (error) {
      console.error("삭제 실패", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요!");
      return;
    }
    if (!targetDate) {
      alert("날짜가 선택되지 않았습니다.");
      return;
    }

    try {
      if (IS_TEST_MODE) {
        // 테스트 모드 로직...
      } else {
        const formData = new FormData();

        const diaryData = {
          title: title,
          content: content,
          tags: tags,
          diaryDate: targetDate,
        };

        // Swagger 스타일 (문자열 전송)
        formData.append("request", JSON.stringify(diaryData));

        const file = fileInputRef.current?.files?.[0];
        if (file) {
          formData.append("image", file);
        }

        if (mode === "edit" && id) {
          await diaryApi.updateDiary(Number(id), formData);
          alert("일기가 수정되었습니다!");
        } else {
          await diaryApi.createDiary(formData);
          alert("일기가 등록되었습니다!");
        }
        navigate("/app/calendar");
      }
    } catch (error) {
      console.error("저장 실패:", error);

      const err = error as any;
      const status = err.response?.status;
      const errMsg = err.response?.data?.message || "알 수 없는 서버 에러";

      if (status === 500) {
        alert(`[500 에러] 서버가 데이터를 처리하지 못했습니다.\nJSON 문자열 방식도 실패했다면 서버 로그 확인이 필요합니다.`);
      } else if (status === 400) {
        alert(`[400 에러] 요청 형식이 잘못되었습니다.\n메시지: ${errMsg}`);
      } else {
        alert(`저장 실패: ${status}\n${errMsg}`);
      }
    }
  };

  return (
    // ✨ 3. [수정] 최상위 div에 relative 추가 (로딩창을 안에 가두기 위해)
    <div className="h-full flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm relative">

      {/* ✨ 4. [추가] 로딩 오버레이 UI */}
      {isAiLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm animate-[fade-in_0.3s]">
          {/* 스피너 아이콘 */}
          <div className="w-16 h-16 border-4 border-slate-100 border-t-primary-500 rounded-full animate-spin mb-6 shadow-sm"></div>

          {/* 안내 텍스트 */}
          <h3 className="text-xl font-bold text-slate-800 mb-2 animate-pulse">
            AI가 일기를 쓰고 있어요 ✍️
          </h3>
          <p className="text-slate-500 text-sm text-center">
            대화 내용을 바탕으로 정리 중입니다.<br />
            잠시만 기다려주세요!
          </p>
        </div>
      )}

      {/* 헤더 */}
      <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-slate-100 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition"
        >
          ←
        </button>

        <input
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          className="font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer text-center hover:bg-slate-50 px-2 py-1 rounded transition"
        />

        {mode === 'edit' ? (
          <button
            onClick={handleDelete}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
            title="삭제하기"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
        ) : (
          <div className="w-8" />
        )}
      </div>

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {/* 제목 입력 */}
        <section>
          <input
            type="text"
            placeholder="제목을 입력하세요"
            className="w-full text-2xl font-bold bg-transparent border-b border-slate-100 py-3 focus:outline-none focus:border-primary-400 placeholder:text-slate-300 transition-colors"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </section>

        {/* 태그 입력 */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-bold text-slate-500">태그</span>
            <span className="text-[10px] text-slate-300 bg-slate-50 px-1.5 py-0.5 rounded">Enter로 추가</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag) => (
              <span key={tag} className="bg-primary-50 text-primary-700 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2">
                #{tag}
                <button onClick={() => removeTag(tag)} className="hover:text-primary-900 text-lg leading-3">×</button>
              </span>
            ))}
            <input
              type="text"
              value={inputTag}
              onChange={(e) => setInputTag(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="태그 입력..."
              className="bg-transparent min-w-[100px] text-sm py-1.5 focus:outline-none placeholder:text-slate-300"
            />
          </div>
        </section>

        {/* 내용 및 사진 */}
        <section className="flex-1 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-500">오늘의 이야기</h3>
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs flex items-center gap-1 text-slate-500 font-bold bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                📷 사진 추가
              </button>
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {images.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
              {images.map((imgSrc, idx) => (
                <div key={idx} className="relative flex-shrink-0 w-32 h-32 rounded-xl border border-slate-100 overflow-hidden group shadow-sm">
                  <img src={imgSrc} alt="uploaded" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 bg-black/60 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition backdrop-blur-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <textarea
            className="w-full h-80 p-5 rounded-2xl border border-slate-200 bg-slate-50/30 text-slate-700 leading-relaxed 
            focus:outline-none focus:border-primary-300 focus:bg-white focus:ring-4 focus:ring-primary-50 transition-all resize-none placeholder:text-slate-300"
            placeholder="자유롭게 기록해보세요."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </section>
      </div>

      {/* 하단 버튼 영역 */}
      <div className="p-4 bg-white border-t border-slate-100 flex-shrink-0">
        <button
          onClick={handleSave}
          className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold text-lg 
    shadow-lg shadow-primary-200 hover:bg-primary-700 transition active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <span>{mode === "edit" ? "수정 완료" : "기록 저장하기"}</span>
          {mode !== "edit" && <span className="opacity-70 text-sm font-normal">Enter</span>}
        </button>
      </div>
    </div>
  );
}
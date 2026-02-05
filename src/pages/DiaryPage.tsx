import { useState, useEffect, useRef } from "react";
import { diaryApi } from "../api/diaryApi";
import { IS_TEST_MODE } from "../config";

// ✨ [수정] Props로 필요한 데이터 받기
interface DiaryPageProps {
  mode: "create" | "edit";
  initialDate?: string;     // 생성 시 기본 날짜
  diaryId?: number;         // 수정 시 ID
  sessionId?: number;       // AI 채팅 세션 ID (있을 경우)
  onClose: () => void;      // 닫기 함수
  onSaveSuccess: () => void; // 저장 완료 시 부모에게 알림
}

export default function DiaryPage({
  mode,
  initialDate,
  diaryId,
  sessionId,
  onClose,
  onSaveSuccess
}: DiaryPageProps) {

  const [targetDate, setTargetDate] = useState(initialDate || new Date().toISOString().split("T")[0]);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [inputTag, setInputTag] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 데이터 불러오기 ---
  useEffect(() => {
    if (mode === "edit" && diaryId) {
      fetchDiaryDetail(diaryId);
    } else if (mode === "create" && sessionId) {
      fetchAIDiary(sessionId);
    }
  }, [mode, diaryId, sessionId]);

  const fetchAIDiary = async (sessionId: number) => {
    setIsAiLoading(true);
    try {
      const response = await diaryApi.createDiaryFromChat(sessionId);
      if (response.result) {
        const d = response.result;
        setTitle(d.title);
        setContent(d.content);
        if (d.tags) setTags(d.tags.map((t: any) => (typeof t === "string" ? t : t.name)));
      }
    } catch (error) {
      console.error("AI 일기 생성 실패", error);
      alert("AI 일기 초안을 불러오지 못했습니다.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const fetchDiaryDetail = async (diarySeq: number) => {
    try {
      if (IS_TEST_MODE) {
        setTitle("테스트 일기");
        setContent("내용");
      } else {
        const response = await diaryApi.getDiaryDetail(diarySeq);
        if (response.result) {
          const d = response.result;
          setTitle(d.title);
          setContent(d.content);
          setTags(d.tags.map((t: any) => t.name));

          // ✨ 기존 이미지 불러오기
          if (d.imageUrl) {
            setImages([d.imageUrl]);
          } else if (d.images && d.images.length > 0) {
            const imgUrls = d.images.map((img: any) =>
              typeof img === 'string' ? img : img.url
            );
            setImages(imgUrls);
          }

          // 수정 시 날짜도 기존 날짜로
          if (d.diaryDate) setTargetDate(d.diaryDate);
        }
      }
    } catch (error) {
      console.error("조회 실패", error);
      alert("일기를 불러오지 못했습니다.");
      onClose();
    }
  };

  // ... (태그/이미지 핸들러는 기존 로직과 동일) ...
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter" && inputTag.trim()) {
      e.preventDefault();
      if (!tags.includes(inputTag.trim())) setTags([...tags, inputTag.trim()]);
      setInputTag("");
    }
  };
  const removeTag = (t: string) => setTags(tags.filter((tag) => tag !== t));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return alert("5MB 이하만 가능합니다.");
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => { if (typeof reader.result === "string") setImages([reader.result]); };
    reader.readAsDataURL(file);
    e.target.value = "";
  };
  const removeImage = (index: number) => { setImages(images.filter((_, i) => i !== index)); setSelectedFile(null); };

  // 저장 핸들러
  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return alert("제목과 내용을 입력해주세요!");
    try {
      if (IS_TEST_MODE) {
        alert("테스트 저장 완료");
        onSaveSuccess();
      } else {
        const formData = new FormData();
        const diaryData = { title, content, tags, diaryDate: targetDate };
        formData.append("request", JSON.stringify(diaryData));
        if (selectedFile) formData.append("image", selectedFile);

        if (mode === "edit" && diaryId) {
          await diaryApi.updateDiary(diaryId, formData);
          alert("수정되었습니다!");
        } else {
          await diaryApi.createDiary(formData);
          alert("등록되었습니다!");
        }
        onSaveSuccess(); // 부모에게 완료 알림
      }
    } catch (error) {
      console.error("저장 실패", error);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  return (
    // ✨ 배경 오버레이 및 모달 스타일 적용
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-3xl h-[70vh] max-h-[800px] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden relative animate-[scale-up_0.2s_ease-out_forwards] border border-white/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 로딩 표시 */}
        {isAiLoading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
            <div className="w-16 h-16 border-4 border-slate-100 border-t-primary-500 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600 font-bold">AI가 일기를 쓰고 있어요...</p>
          </div>
        )}

        {/* 헤더 */}
        <div className="bg-white px-5 py-3 flex items-center justify-between border-b border-slate-100 flex-shrink-0">
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition">✕</button>
          <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer text-center hover:bg-slate-50 px-2 py-1 rounded transition" />
          <div className="w-8" />
        </div>

        {/* 메인 입력 영역 */}
        <div className="flex-1 flex flex-col p-6 space-y-4 overflow-y-auto custom-scrollbar">
          <input type="text" placeholder="제목을 입력하세요" className="w-full text-2xl font-bold bg-transparent border-b border-slate-100 py-2 focus:outline-none focus:border-primary-400 placeholder:text-slate-300 transition-colors" value={title} onChange={(e) => setTitle(e.target.value)} />

          {/* 태그 */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-bold text-slate-400 mr-1">#Tags</span>
            {tags.map((tag) => (
              <span key={tag} className="bg-primary-50 text-primary-700 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                #{tag}<button onClick={() => removeTag(tag)} className="hover:text-primary-900">×</button>
              </span>
            ))}
            <input type="text" value={inputTag} onChange={(e) => setInputTag(e.target.value)} onKeyDown={handleTagKeyDown} placeholder="태그 입력..." className="bg-transparent min-w-[80px] text-xs py-1 focus:outline-none placeholder:text-slate-300" />
          </div>

          {/* 사진 & 내용 */}
          <div className="flex-1 flex flex-col gap-3 min-h-0">
            <div className="flex justify-end">
              <button onClick={() => fileInputRef.current?.click()} className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full hover:bg-slate-200 transition">📷 사진 추가</button>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
            </div>
            {images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((imgSrc, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 group">
                    <img src={imgSrc} alt="preview" className="w-full h-full object-cover" />
                    <button onClick={() => removeImage(idx)} className="absolute top-0 right-0 bg-black/50 text-white w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100">×</button>
                  </div>
                ))}
              </div>
            )}
            <textarea className="flex-1 w-full p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 leading-relaxed focus:outline-none focus:border-primary-300 focus:bg-white resize-none" placeholder="오늘의 이야기를 기록해보세요." value={content} onChange={(e) => setContent(e.target.value)} />
          </div>
        </div>

        {/* 푸터 */}
        <div className="p-4 bg-white border-t border-slate-100 flex-shrink-0">
          <button onClick={handleSave} className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold text-lg shadow-lg shadow-primary-200 hover:bg-primary-700 transition active:scale-[0.98]">
            {mode === "edit" ? "수정 완료" : "기록 저장하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
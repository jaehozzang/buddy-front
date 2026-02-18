import { useState, useEffect, useRef } from "react";
import { diaryApi } from "../api/diaryApi";
import { IS_TEST_MODE } from "../config";

interface DiaryPageProps {
  mode: "create" | "edit";
  initialDate?: string;
  diaryId?: number;
  sessionId?: number;
  onClose: () => void;
  onSaveSuccess: () => void;
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

          if (d.imageUrl) {
            setImages([d.imageUrl]);
          } else if (d.images && d.images.length > 0) {
            const imgUrls = d.images.map((img: any) =>
              typeof img === 'string' ? img : img.url
            );
            setImages(imgUrls);
          }
          if (d.diaryDate) setTargetDate(d.diaryDate);
        }
      }
    } catch (error) {
      console.error("조회 실패", error);
      alert("일기를 불러오지 못했습니다.");
      onClose();
    }
  };

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

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return alert("제목과 내용을 입력해주세요!");

    try {
      if (IS_TEST_MODE) {
        alert("테스트 저장 완료");
        onSaveSuccess();
      } else {
        const formData = new FormData();
        const diaryData = {
          title: title,
          content: content,
          tags: tags,
          diaryDate: targetDate,
          sessionSeq: sessionId
        };

        formData.append("request", JSON.stringify(diaryData));

        if (selectedFile) {
          formData.append("image", selectedFile);
        }

        if (mode === "edit" && diaryId) {
          await diaryApi.updateDiary(diaryId, formData);
          alert("수정되었습니다!");
        } else {
          await diaryApi.createDiary(formData);
          alert("등록되었습니다!");
        }
        onSaveSuccess();
      }
    } catch (error) {
      console.error("저장 실패", error);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  return (
    // ✨ [수정] 모달 배경: bg-slate-900/60 -> dark:bg-black/80
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm p-4 sm:p-8 transition-colors duration-300"
      onClick={onClose}
    >
      <div
        // ✨ [수정] 카드 본체: bg-white -> dark:bg-slate-800, border
        className="bg-white dark:bg-slate-800 w-full max-w-3xl h-[70vh] max-h-[800px] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden relative animate-[scale-up_0.2s_ease-out_forwards] border border-white/50 dark:border-slate-700 transition-colors duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 로딩 표시 */}
        {isAiLoading && (
          // ✨ [수정] 로딩 오버레이: bg-white/90 -> dark:bg-slate-900/90
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm transition-colors">
            <div className="w-16 h-16 border-4 border-slate-100 dark:border-slate-700 border-t-primary-500 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600 dark:text-slate-300 font-bold">AI가 일기를 쓰고 있어요...</p>
          </div>
        )}

        {/* 헤더 */}
        {/* ✨ [수정] 헤더: bg-white -> dark:bg-slate-800, border */}
        <div className="bg-white dark:bg-slate-800 px-5 py-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-700 flex-shrink-0 transition-colors">
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition">✕</button>

          {/* ✨ [수정] 날짜 입력: text-slate-800 -> dark:text-white */}
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="font-bold text-slate-800 dark:text-white bg-transparent focus:outline-none cursor-pointer text-center hover:bg-slate-50 dark:hover:bg-slate-700 px-2 py-1 rounded transition"
          />
          <div className="w-8" />
        </div>

        {/* 메인 입력 영역 */}
        <div className="flex-1 flex flex-col p-6 space-y-4 overflow-y-auto custom-scrollbar">

          {/* ✨ [수정] 제목 입력: text-slate-800 -> dark:text-white, border */}
          <input
            type="text"
            placeholder="제목을 입력하세요"
            className="w-full text-2xl font-bold bg-transparent border-b border-slate-100 dark:border-slate-700 py-2 
            text-slate-800 dark:text-white focus:outline-none focus:border-primary-400 placeholder:text-slate-300 dark:placeholder:text-slate-600 transition-colors"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* 태그 */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-bold text-slate-400 mr-1">#Tags</span>
            {tags.map((tag) => (
              // ✨ [수정] 태그 칩: bg-primary-50 -> dark:bg-primary-900/40, text
              <span key={tag} className="bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors">
                #{tag}<button onClick={() => removeTag(tag)} className="hover:text-primary-900 dark:hover:text-white">×</button>
              </span>
            ))}
            {/* ✨ [수정] 태그 입력: text-white */}
            <input
              type="text"
              value={inputTag}
              onChange={(e) => setInputTag(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="태그 입력..."
              className="bg-transparent min-w-[80px] text-xs py-1 focus:outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 text-slate-700 dark:text-slate-200"
            />
          </div>

          {/* 사진 & 내용 */}
          <div className="flex-1 flex flex-col gap-3 min-h-0">
            <div className="flex justify-end">
              <button
                onClick={() => fileInputRef.current?.click()}
                // ✨ [수정] 사진 추가 버튼: bg-slate-100 -> dark:bg-slate-700, text
                className="text-[11px] font-bold text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition"
              >
                📷 사진 추가
              </button>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
            </div>
            {images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((imgSrc, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600 group">
                    <img src={imgSrc} alt="preview" className="w-full h-full object-cover" />
                    <button onClick={() => removeImage(idx)} className="absolute top-0 right-0 bg-black/50 text-white w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100">×</button>
                  </div>
                ))}
              </div>
            )}

            {/* ✨ [수정] 내용 입력창: bg-slate-50 -> dark:bg-slate-900, text */}
            <textarea
              className="flex-1 w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 
              text-slate-700 dark:text-slate-200 leading-relaxed focus:outline-none focus:border-primary-300 focus:bg-white dark:focus:bg-slate-900 resize-none transition-colors"
              placeholder="오늘의 이야기를 기록해보세요."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        </div>

        {/* 푸터 */}
        {/* ✨ [수정] 푸터: bg-white -> dark:bg-slate-800, border */}
        <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex-shrink-0 transition-colors">
          <button
            onClick={handleSave}
            // ✨ [수정] 저장 버튼: 그림자 제거 (다크모드)
            className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold text-lg shadow-lg shadow-primary-200 dark:shadow-none hover:bg-primary-700 transition active:scale-[0.98]"
          >
            {mode === "edit" ? "수정 완료" : "기록 저장하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
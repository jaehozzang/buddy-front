import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { diaryApi } from "../api/diaryApi"; // ✨ API import
import { AxiosError } from "axios";
import { IS_TEST_MODE } from "../config";

interface DiaryPageProps {
  mode?: "create" | "edit";
}

export default function DiaryPage({ mode = "create" }: DiaryPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams(); // URL 파라미터로 넘어온 diarySeq (문자열)

  // CalendarPage에서 넘겨준 날짜나 데이터
  const { date } = location.state || {};

  // 상태 관리
  const [targetDate] = useState(date || new Date().toISOString().split("T")[0]);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState(""); // ✨ 제목 추가 (API 필수값)

  // ✨ 태그 관리 (Mood 대신 사용)
  const [tags, setTags] = useState<string[]>([]);
  const [inputTag, setInputTag] = useState("");

  // ✨ 이미지 (현재는 Base64 미리보기만 구현, 서버 전송 로직은 API 명세 확인 필요)
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 데이터 불러오기 (수정 모드일 때)
  useEffect(() => {
    if (mode === "edit" && id) {
      fetchDiaryDetail(Number(id));
    }
  }, [mode, id]);

  const fetchDiaryDetail = async (diarySeq: number) => {
    try {

      if (IS_TEST_MODE) {
        // [TEST] 가짜 데이터
        setTitle("테스트 일기");
        setContent("서버에서 불러온 내용입니다.");
        setTags(["행복", "코딩"]);
        // setImages(...)
      } else {
        const response = await diaryApi.getDiaryDetail(diarySeq);
        if (response.result) {
          const d = response.result;
          setTitle(d.title);
          setContent(d.content);
          // 서버 태그 구조({tagSeq, name})를 문자열 배열로 변환
          setTags(d.tags.map(t => t.name));
          // setImages(d.imageUrl ? [d.imageUrl] : []);
        }
      }
    } catch (error) {
      console.error("일기 상세 조회 실패", error);
      alert("일기를 불러오지 못했습니다.");
      navigate("/app/calendar");
    }
  };

  // 태그 추가 핸들러 (엔터 키)
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // ✨ [수정] 한글 조합 중(IME)일 때는 이벤트 무시! (이 코드가 핵심)
    if (e.nativeEvent.isComposing) return;

    if (e.key === "Enter" && inputTag.trim()) {
      e.preventDefault();
      if (!tags.includes(inputTag.trim())) {
        setTags([...tags, inputTag.trim()]);
      }
      setInputTag("");
    }
  };

  // 태그 삭제 핸들러
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // 이미지 업로드 (Base64 미리보기만)
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

  // ✨ 저장 핸들러
  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요!");
      return;
    }

    // 🚧 [주의] 태그 처리: API는 tagSeqs(숫자 배열)를 요구합니다.
    // 하지만 지금은 태그 목록 조회 API가 없어서, 임시로 [1] 같은 더미 ID를 보냅니다.
    // 실제로는 "태그 생성 API"를 먼저 호출하거나, 백엔드가 문자열 태그를 받아줘야 합니다.
    // const dummyTagSeqs = [1];

    // ✅ 변경: 명세서대로 'tags' 필드에 문자열 배열(tags state) 그대로 전송
    const requestData = {
      title: title,
      content: content,
      imageUrl: images[0] || "",
      tags: tags // ["행복", "맛집"] 형태의 문자열 배열
    };

    try {

      if (IS_TEST_MODE) {
        console.log("[TEST] 저장 데이터:", requestData);
        await new Promise(r => setTimeout(r, 500));
        alert(mode === "edit" ? "일기 수정 완료 (테스트)" : "일기 저장 완료 (테스트)");
        navigate("/app/calendar");
      } else {
        if (mode === "edit" && id) {
          await diaryApi.updateDiary(Number(id), requestData);
          alert("일기가 수정되었습니다!");
        } else {
          await diaryApi.createDiary(requestData);
          alert("일기가 등록되었습니다!");
        }
        navigate("/app/calendar");
      }
    } catch (error) {
      console.error("저장 실패", error);
      const err = error as AxiosError<{ message: string }>;
      alert(err.response?.data?.message || "저장에 실패했습니다.");
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* 헤더 */}
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

        {/* 1. 제목 입력 (API 필수값) */}
        <section>
          <input
            type="text"
            placeholder="제목을 입력하세요"
            className="w-full text-xl font-bold bg-transparent border-b border-slate-200 py-2 focus:outline-none focus:border-primary-500 placeholder:text-slate-300"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </section>

        {/* 2. 태그 입력 (Mood 대체) */}
        <section>
          <h3 className="text-sm font-bold text-slate-500 mb-3">태그 (Enter로 추가)</h3>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span key={tag} className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                #{tag}
                <button onClick={() => removeTag(tag)} className="hover:text-primary-900">×</button>
              </span>
            ))}
          </div>
          <input
            type="text"
            value={inputTag}
            onChange={(e) => setInputTag(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="예: 행복, 맛집"
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-400"
          />
        </section>

        {/* 3. 내용 및 사진 */}
        <section className="flex-1 flex flex-col gap-4">
          <div className="flex justify-between items-end">
            <h3 className="text-sm font-bold text-slate-500">오늘의 이야기</h3>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs flex items-center gap-1 text-primary-600 font-bold bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition"
            >
              📷 사진 추가
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* 이미지 미리보기 */}
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
            placeholder="자유롭게 기록해보세요."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </section>
      </div>

      {/* 저장 버튼 */}
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
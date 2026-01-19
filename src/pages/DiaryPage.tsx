import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { diaryApi } from "../api/diaryApi";
import { AxiosError } from "axios";
import { IS_TEST_MODE } from "../config";

interface DiaryPageProps {
  mode?: "create" | "edit";
}

export default function DiaryPage({ mode = "create" }: DiaryPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  // CalendarPage에서 넘겨준 날짜 (없으면 오늘)
  const { date } = location.state || {};

  // ✨ [수정 1] 날짜를 변경할 수 있도록 state 초기값 설정
  const [targetDate, setTargetDate] = useState(date || new Date().toISOString().split("T")[0]);

  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [inputTag, setInputTag] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 데이터 불러오기
  useEffect(() => {
    if (mode === "edit" && id) {
      fetchDiaryDetail(Number(id));
    }
  }, [mode, id]);

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
          // 만약 조회된 일기의 날짜도 불러와야 한다면 여기서 setTargetDate(d.date) 필요
        }
      }
    } catch (error) {
      console.error("일기 상세 조회 실패", error);
      alert("일기를 불러오지 못했습니다.");
      navigate("/app/calendar");
    }
  };

  // 태그 핸들러
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

  // 이미지 핸들러
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

  // ✨ [추가] 삭제 핸들러
  const handleDelete = async () => {
    if (!window.confirm("정말 이 일기를 삭제하시겠습니까? (복구 불가)")) return;

    try {
      if (IS_TEST_MODE) {
        alert("삭제 완료 (테스트)");
      } else if (id) {
        await diaryApi.deleteDiary(Number(id)); // API 함수 필요
        alert("일기가 삭제되었습니다.");
      }
      navigate("/app/calendar", { replace: true });
    } catch (error) {
      console.error("삭제 실패", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  // 저장 핸들러
  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요!");
      return;
    }

    const requestData = {
      title: title,
      content: content,
      imageUrl: images[0] || "",
      tags: tags,
      date: targetDate, // ✨ [수정 2] 날짜 데이터 포함 전송!
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

        {/* ✨ [수정 3] 날짜 선택기 (DatePicker) 적용 */}
        <input
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          className="font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
        />

        <div className="w-6" />
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* 1. 제목 */}
        <section>
          <input
            type="text"
            placeholder="제목을 입력하세요"
            className="w-full text-xl font-bold bg-transparent border-b border-slate-200 py-2 focus:outline-none focus:border-primary-500 placeholder:text-slate-300"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </section>

        {/* 2. 태그 */}
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

      {/* 저장 및 삭제 버튼 */}
      <div className="p-4 bg-white border-t border-gray-100 flex gap-3">

        {/* ✨ [추가] 삭제 버튼 (수정 모드일 때만 보임) */}
        {mode === 'edit' && (
          <button
            onClick={handleDelete}
            className="px-5 py-4 bg-red-50 text-red-500 font-bold rounded-xl hover:bg-red-100 transition"
          >
            삭제
          </button>
        )}

        <button
          onClick={handleSave}
          className="flex-1 bg-primary-600 text-white py-4 rounded-xl font-bold text-lg 
          shadow-lg shadow-primary-300/30 hover:bg-primary-700 transition active:scale-[0.98]"
        >
          {mode === "edit" ? "수정 완료" : "저장하기"}
        </button>
      </div>
    </div>
  );
}
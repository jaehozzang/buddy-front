import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore"; // 👈 스토어 불러오기
import { useDiaryStore } from "../store/useDiaryStore";

// 메시지 타입 정의
interface Message {
  id: number;
  text: string;
  sender: "user" | "character";
  timestamp: Date;
}

// 일기 데이터 타입 (임시)
interface GeneratedDiary {
  title: string;
  content: string;
  mood: string;
}

const HomePage = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ---------------------------------------------------------
  // 1. 내 정보(닉네임, 캐릭터) 가져오기 (Zustand)
  // ---------------------------------------------------------
  const { user } = useAuthStore();

  const { addDiary } = useDiaryStore();

  // 혹시라도 정보가 없으면 기본값으로 "rabbit", "알 수 없음" 사용
  const myNickname = user?.nickname || "알 수 없음";
  const myBuddyName = user?.buddyName || "Buddy";
  const myCharType = user?.characterType || "rabbit";

  // 캐릭터 타입에 따른 이미지 주소 연결 (매핑)
  const charImgMap: Record<string, string> = {
    capybara: "/characters/capybara.png",
    rabbit: "/characters/rabbit.png",
    turtle: "/characters/turtle.png",
    dog: "/characters/dog.png",
    cat: "/characters/cat.png",
  };

  // 현재 선택된 캐릭터의 이미지 주소
  const currentProfileImg = charImgMap[myCharType];

  // ---------------------------------------------------------

  // 2. 대화 목록 상태
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: `안녕, ${myNickname}! 오늘 하루는 어땠어? 특별한 일이 있었니?`, // 닉네임 반영
      sender: "character",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // 일기 생성 모달 상태
  const [showDiaryModal, setShowDiaryModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDiary, setGeneratedDiary] = useState<GeneratedDiary | null>(null);

  // 스크롤 자동 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // 3. 메시지 전송 핸들러
  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    // 내 메시지 추가
    const newUserMsg: Message = {
      id: Date.now(),
      text: inputText,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newUserMsg]);
    setInputText("");
    setIsTyping(true);

    // (임시) 캐릭터 응답 시뮬레이션
    setTimeout(() => {
      const botMsg: Message = {
        id: Date.now() + 1,
        text: `"${newUserMsg.text}" 라고? 끄덕끄덕.. 더 이야기 해줄래?`,
        sender: "character",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200);
  };

  // 4. 대화 종료 및 일기 생성 핸들러
  const handleEndConversation = () => {
    if (messages.length < 3) {
      alert("일기를 쓰기엔 대화가 너무 짧아요! 조금 더 이야기해요 ☺️");
      return;
    }

    setShowDiaryModal(true);
    setIsGenerating(true);

    // (임시) AI가 일기를 요약하는 척 시뮬레이션
    setTimeout(() => {
      setGeneratedDiary({
        title: "새로운 시작을 꿈꾸며",
        mood: "설렘",
        content: `오늘은 ${myNickname}님이 Buddy와 처음 대화를 나눈 날이다. 앞으로 내 감정을 솔직하게 털어놓을 수 있는 친구가 생긴 것 같아 기분이 좋다.`,
      });
      setIsGenerating(false);
    }, 2000);
  };

  // 5. 일기 저장 후 이동 (수정됨 ✨)
  const handleSaveDiary = () => {
    if (!generatedDiary) return;

    // 오늘 날짜를 "YYYY-MM-DD" 형식으로 만들기
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0]; // "2025-01-01"

    // 스토어에 저장
    addDiary({
      id: Date.now().toString(),
      date: dateStr,
      mood: generatedDiary.mood,
      content: generatedDiary.content,
    });

    alert("일기가 저장되었습니다! 📅");
    navigate("/app/calendar");
  };

  return (
    <div className="h-full flex flex-col relative max-w-4xl mx-auto w-full">

      {/* --- 상단 헤더 (내 캐릭터 정보 표시) --- */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          {/* 내가 선택한 캐릭터 이미지 표시 */}
          <div className="w-10 h-10 rounded-full bg-primary-100 border border-primary-200 overflow-hidden">
            <img src={currentProfileImg} alt="char" className="w-full h-full object-cover" />
          </div>
          <div>
            {/* 내가 설정한 닉네임 표시 */}
            <h2 className="text-sm font-bold text-slate-800">{myBuddyName}</h2>
            <p className="text-xs text-primary-500">대화 중...</p>
          </div>
        </div>

        <button
          onClick={handleEndConversation}
          className="px-4 py-2 bg-white border border-primary-200 text-primary-600 text-xs font-bold rounded-full 
          hover:bg-primary-50 transition shadow-sm hover:shadow-md"
        >
          오늘 대화 종료하기 ✨
        </button>
      </div>

      {/* --- 채팅 영역 --- */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
        {messages.map((msg) => {
          const isMe = msg.sender === "user";
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              {/* 캐릭터 메시지일 때 프사 표시 (토끼 이모지 대신 실제 이미지로 변경) */}
              {!isMe && (
                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 mr-2 flex-shrink-0 overflow-hidden">
                  <img src={currentProfileImg} alt="bot" className="w-full h-full object-cover" />
                </div>
              )}
              <div
                className={`max-w-[75%] px-5 py-3 text-sm leading-relaxed shadow-sm ${isMe
                  ? "bg-primary-600 text-white rounded-2xl rounded-br-none"
                  : "bg-white text-slate-700 border border-primary-100 rounded-2xl rounded-bl-none"
                  }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}

        {/* 타이핑 인디케이터 */}
        {isTyping && (
          <div className="flex justify-start animate-pulse">
            <div className="w-8 h-8 mr-2 rounded-full overflow-hidden border border-gray-200 bg-white">
              <img src={currentProfileImg} alt="bot" className="w-full h-full object-cover" />
            </div>
            <div className="bg-white border border-primary-100 px-4 py-3 rounded-2xl rounded-bl-none text-slate-400 text-xs">
              입력 중...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* --- 입력창 영역 --- */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            className="flex-1 rounded-md bg-white border border-primary-200 px-4 py-3 
            text-sm text-slate-700 focus:outline-none focus:border-primary-400 placeholder:text-slate-400"
            placeholder="오늘 있었던 일을 이야기해주세요..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="bg-primary-600 text-white rounded-md px-6 py-2 text-sm font-bold 
            tracking-wider hover:bg-primary-700 disabled:opacity-50 disabled:hover:bg-primary-600 transition shadow-md shadow-primary-300/40"
          >
            SEND
          </button>
        </form>
      </div>

      {/* --- [모달] 일기 생성 결과 --- */}
      {showDiaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-[fade-in_0.3s_ease-out]">

            {/* 모달 헤더 */}
            <div className="bg-primary-600 p-6 text-white text-center relative">
              <h3 className="text-lg font-bold tracking-widest">DIARY PREVIEW</h3>
              <p className="text-primary-100 text-xs mt-1">오늘의 대화가 일기로 변신했어요!</p>
              <button
                onClick={() => setShowDiaryModal(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="p-6">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-4 py-10">
                  <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                  <p className="text-slate-500 text-sm">Buddy가 일기를 작성하고 있어요...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* 감정 태그 */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400">오늘의 기분</span>
                    <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-bold">
                      {generatedDiary?.mood}
                    </span>
                  </div>

                  {/* 일기 편집 영역 */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400">일기 내용 (수정 가능)</label>
                    <textarea
                      className="w-full h-40 p-4 text-sm text-slate-700 bg-slate-50 rounded-lg border border-gray-200 focus:outline-none focus:border-primary-400 resize-none leading-relaxed"
                      value={generatedDiary?.content}
                      onChange={(e) => setGeneratedDiary(prev => prev ? { ...prev, content: e.target.value } : null)}
                    />
                  </div>

                  <button
                    onClick={handleSaveDiary}
                    className="w-full mt-4 bg-primary-600 text-white py-3 rounded-lg font-bold shadow-md shadow-primary-300/30 hover:bg-primary-700 transition"
                  >
                    이대로 저장하기
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default HomePage;
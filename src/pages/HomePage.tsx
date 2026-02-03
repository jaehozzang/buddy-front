import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { chatApi } from "../api/chatApi";
import { IS_TEST_MODE } from "../config";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const HomePage = () => {
  const { user } = useAuthStore();

  // 상태 관리
  const [sessionId, setSessionId] = useState<number>(0);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [myTranscript, setMyTranscript] = useState("마이크 버튼을 눌러 대화를 시작해보세요.");
  const [aiMessage, setAiMessage] = useState(`안녕, ${user?.nickname || "친구"}! 오늘 하루는 어땠어?`);

  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef("");

  const getCharacterType = (seq?: number) => {
    switch (seq) {
      case 1: return "hamster";
      case 2: return "fox";
      case 3: return "panda";
      default: return "rabbit";
    }
  };
  const characterType = getCharacterType(user?.characterSeq);

  const characterImages: Record<string, string> = {
    hamster: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Hamster.png",
    fox: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Fox.png",
    panda: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Panda.png",
    rabbit: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Rabbit%20Face.png",
  };
  const currentProfileImg = characterImages[characterType] || characterImages.rabbit;

  // 🗣️ TTS 기능
  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ko-KR";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // 🚀 메시지 전송 로직
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    setIsLoading(true);

    try {
      let aiReply = "";

      if (IS_TEST_MODE) {
        console.log(`[TEST] 전송: "${text}"`);
        await new Promise(r => setTimeout(r, 1500));
        aiReply = `[테스트] 너는 방금 "${text}"라고 말했어!`;
        if (sessionId === 0) setSessionId(999);
      } else {
        const response = await chatApi.sendMessage({
          sessionId: sessionId,
          content: text
        });
        aiReply = response.result.content;

        if (response.result.sessionId && response.result.sessionId !== sessionId) {
          setSessionId(response.result.sessionId);
        }
      }

      setAiMessage(aiReply);
      speak(aiReply);

    } catch (error) {
      setAiMessage("서버 연결이 불안정해요. 😢");
    } finally {
      setIsLoading(false);
      setMyTranscript("마이크 버튼을 눌러 대답하기");
    }
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMyTranscript("이 브라우저는 음성 인식을 지원하지 않아요.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ko-KR";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      transcriptRef.current = "";
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setMyTranscript(transcript);
      transcriptRef.current = transcript;
    };

    recognition.onend = () => {
      setIsListening(false);
      if (transcriptRef.current.trim().length > 0) {
        handleSendMessage(transcriptRef.current);
      }
    };

    recognitionRef.current = recognition;
  }, [sessionId]);

  const toggleListening = () => {
    if (!recognitionRef.current || isLoading) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setMyTranscript("듣고 있어요... 👂");
      recognitionRef.current.start();
    }
  };

  return (
    <div className="h-full flex flex-col items-center bg-white relative overflow-hidden">

      {/* 1. 상단 텍스트 (이전 디자인 복구: 말풍선 제거, 심플한 텍스트) */}
      <div className="mt-4 px-8 text-center animate-[fade-in-down_0.5s]">
        <h2 className="text-xl font-bold text-slate-800 leading-snug">
          {isLoading ? "생각하는 중... 🤔" : aiMessage}
        </h2>
      </div>

      {/* 2. 캐릭터 이미지 (bounce 효과 등은 로직상 필요해서 최소한만 남김) */}
      <div className="flex-1 flex items-center justify-center w-full relative mt-8 pb-8">
        {isListening && (
          <>
            <div className="absolute w-56 h-56 bg-primary-100 rounded-full animate-ping opacity-20"></div>
            <div className="absolute w-40 h-40 bg-primary-200 rounded-full animate-pulse opacity-30"></div>
          </>
        )}

        <div className={`relative w-48 h-48 transition-transform duration-500 
          ${isListening ? "scale-110" : "scale-100"}
          ${isLoading ? "animate-bounce" : ""}
        `}>
          <img
            src={currentProfileImg}
            alt="character"
            className="w-full h-full object-contain drop-shadow-xl"
          />
        </div>
      </div>

      {/* 3. 하단 컨트롤 영역 (이전 디자인 복구: bg-slate-50, 마이크 크기 원복) */}
      <div className="w-[calc(100%-2rem)] mx-auto mb-4 bg-slate-50 rounded-[2.5rem] shadow-lg p-6 flex flex-col items-center gap-5 pb-8">

        {/* 텍스트 박스 */}
        <div className="w-full min-h-[50px] max-h-[90px] overflow-y-auto bg-white border border-slate-200 rounded-2xl p-4 text-center flex items-center justify-center">
          <p className={`text-sm font-medium leading-relaxed ${isListening ? "text-primary-600" : "text-slate-700"}`}>
            {isListening ? `"${myTranscript}"` : myTranscript}
          </p>
        </div>

        {/* 마이크 버튼 (크기 원복: w-16 h-16) */}
        <button
          onClick={toggleListening}
          disabled={isLoading}
          className={`relative w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg transition-all duration-300 transform active:scale-95
            ${isLoading
              ? "bg-slate-300 cursor-not-allowed text-slate-500"
              : isListening
                ? "bg-red-500 text-white shadow-red-200 ring-4 ring-red-100 rotate-180"
                : "bg-primary-600 text-white shadow-primary-200 hover:bg-primary-700 hover:-translate-y-1"
            }
          `}
        >
          {isLoading ? "⏳" : (isListening ? "⏹" : "🎙️")}
        </button>

        <p className="text-xs text-slate-400 font-medium">
          {isLoading ? "대답을 준비하고 있어요" : (isListening ? "말이 끝나면 전송돼요" : "터치해서 말하기")}
        </p>
      </div>

    </div>
  );
};

export default HomePage;


/**
 * 광고를 보면 사료를 줌 -> 사료를 먹고 포만감이 어느정도 차있을때 대화가능 -> 
 * 대화를 나누며 애정과 관심을 줘서 관심도(?)등을 올림
 */
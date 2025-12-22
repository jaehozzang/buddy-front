import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
// import { useDiaryStore } from "../store/useDiaryStore";

// TypeScript에서 Web Speech API를 인식하게 하기 위한 타입 정의
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const HomePage = () => {
  const { user } = useAuthStore();
  // const { addDiary } = useDiaryStore();

  // 사용자 & 캐릭터 정보
  const myNickname = user?.nickname || "알 수 없음";
  const buddyName = user?.buddyName || "Buddy";
  const characterType = user?.characterType || "rabbit";

  // 상태 관리
  const [isListening, setIsListening] = useState(false); // 듣고 있는지 여부
  const [myTranscript, setMyTranscript] = useState("마이크 버튼을 눌러 대화를 시작해보세요."); // 내가 말한 내용
  const [aiMessage] = useState(`안녕, ${myNickname}! 오늘 하루는 어땠어?`); // 캐릭터의 대사

  // 음성 인식 객체 (Ref로 관리)
  const recognitionRef = useRef<any>(null);

  // 캐릭터 이미지 매핑
  const characterImages: Record<string, string> = {
    hamster: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Hamster.png",
    fox: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Fox.png",
    lion: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Lion.png",
    panda: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Panda.png",
    cat: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Cat%20Face.png",
    dog: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Dog%20Face.png",
    rabbit: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Rabbit%20Face.png",
    
    // 혹시 모를 기본값(fallback)을 위해 'bear'나 예전 값들도 남겨두셔도 됩니다.
    bear: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Bear.png",
  };
  const currentProfileImg = characterImages[characterType] || characterImages.rabbit;

  // --- 🎤 음성 인식 설정 (useEffect) ---
  useEffect(() => {
    // 브라우저 호환성 체크 (Chrome, Edge, Safari 등)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMyTranscript("이 브라우저는 음성 인식을 지원하지 않아요. 😢 (Chrome 권장)");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ko-KR"; // 한국어 설정
    recognition.continuous = false; // 한 문장 끝나면 자동으로 멈춤
    recognition.interimResults = true; // 말하는 도중에도 텍스트 보여줄지 여부 (실시간 확인용)

    // 말이 인식될 때마다 실행
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setMyTranscript(transcript);
    };

    // 인식이 끝났을 때 (말을 멈췄을 때)
    recognition.onend = () => {
      setIsListening(false);
      // 여기서 나중에 AI에게 텍스트를 보내서 답장을 받아오는 로직을 넣으면 됩니다!
      // 예: handleSendMessage(myTranscript);
    };

    recognitionRef.current = recognition;
  }, []);

  // --- 버튼 핸들러 ---
  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setMyTranscript("듣고 있어요... 👂");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
    <div className="h-full flex flex-col items-center bg-white relative overflow-hidden">

      {/* 1. 상단 짧은 텍스트 (캐릭터의 말) */}
      <div className="mt-12 px-8 text-center animate-[fade-in-down_0.5s]">
        <h2 className="text-xl font-bold text-slate-800 leading-snug">
          {aiMessage}
        </h2>
        <p className="text-sm text-primary-500 mt-2 font-medium">
          {buddyName}
        </p>
      </div>

      {/* 2. 캐릭터 이미지 (중앙) */}
      <div className="flex-1 flex items-center justify-center w-full relative">
        {/* 듣고 있을 때 퍼지는 파동 효과 (Visual Effect) */}
        {isListening && (
          <>
            <div className="absolute w-64 h-64 bg-primary-100 rounded-full animate-ping opacity-20"></div>
            <div className="absolute w-48 h-48 bg-primary-200 rounded-full animate-pulse opacity-30"></div>
          </>
        )}

        <div className={`relative w-48 h-48 transition-transform duration-500 ${isListening ? "scale-110" : "scale-100"}`}>
          <img
            src={currentProfileImg}
            alt="character"
            className="w-full h-full object-contain drop-shadow-xl"
          />
        </div>
      </div>

      {/* 3. 하단 컨트롤 영역 (인식된 텍스트 + 마이크 버튼) */}
      <div className="w-full bg-slate-50 rounded-t-[3rem] shadow-[0_-5px_20px_rgba(0,0,0,0.05)] p-8 flex flex-col items-center gap-6 pb-12">

        {/* 내가 말한 내용 표시 (말풍선 느낌) */}
        <div className="w-full min-h-[60px] max-h-[100px] overflow-y-auto bg-white border border-slate-200 rounded-2xl p-4 text-center flex items-center justify-center">
          <p className={`text-sm font-medium leading-relaxed ${isListening ? "text-slate-400" : "text-slate-700"}`}>
            {myTranscript}
          </p>
        </div>

        {/* 마이크 버튼 */}
        <button
          onClick={toggleListening}
          className={`relative w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-lg transition-all duration-300 transform active:scale-95
            ${isListening
              ? "bg-red-500 text-white shadow-red-200 ring-4 ring-red-100 rotate-180"
              : "bg-primary-600 text-white shadow-primary-200 hover:bg-primary-700 hover:-translate-y-1"
            }
          `}
        >
          {isListening ? "⏹" : "🎙️"}
        </button>

        <p className="text-xs text-slate-400 font-medium">
          {isListening ? "터치해서 멈추기" : "터치해서 말하기"}
        </p>
      </div>

    </div>
  );
};

export default HomePage;
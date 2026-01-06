import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
// import { useDiaryStore } from "../store/useDiaryStore";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const HomePage = () => {
  const { user } = useAuthStore();

  const myNickname = user?.nickname || "알 수 없음";
  // const buddyName = user?.buddyName || "Buddy";
  const characterType = user?.characterType || "rabbit";

  const [isListening, setIsListening] = useState(false);
  const [myTranscript, setMyTranscript] = useState("마이크 버튼을 눌러 대화를 시작해보세요.");
  const [aiMessage] = useState(`안녕, ${myNickname}! 오늘 하루는 어땠어?`);

  const recognitionRef = useRef<any>(null);

  const characterImages: Record<string, string> = {
    hamster: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Hamster.png",
    fox: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Fox.png",
    lion: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Lion.png",
    panda: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Panda.png",
    cat: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Cat%20Face.png",
    dog: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Dog%20Face.png",
    rabbit: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Rabbit%20Face.png",
    bear: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Bear.png",
  };
  const currentProfileImg = characterImages[characterType] || characterImages.rabbit;

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMyTranscript("이 브라우저는 음성 인식을 지원하지 않아요. 😢 (Chrome 권장)");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ko-KR";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setMyTranscript(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

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

      {/* 1. 상단 텍스트 (위치를 위로 당김: mt-12 -> mt-4) */}
      <div className="mt-4 px-8 text-center animate-[fade-in-down_0.5s]">
        <h2 className="text-xl font-bold text-slate-800 leading-snug">
          {aiMessage}
        </h2>
        {/* <p className="text-sm text-primary-500 mt-2 font-medium">
          {buddyName}
        </p> */}
      </div>

      {/* 2. 캐릭터 이미지 (✨ 수정됨: pb-16 추가해서 하단 박스와 거리 벌림) */}
      <div className="flex-1 flex items-center justify-center w-full relative mt-8 pb-8">
        {isListening && (
          <>
            <div className="absolute w-56 h-56 bg-primary-100 rounded-full animate-ping opacity-20"></div>
            <div className="absolute w-40 h-40 bg-primary-200 rounded-full animate-pulse opacity-30"></div>
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

      {/* 3. 하단 컨트롤 영역 (플로팅 카드 스타일 + 마이크 작게) */}
      <div className="w-[calc(100%-2rem)] mx-auto mb-4 bg-slate-50 rounded-[2.5rem] shadow-lg p-6 flex flex-col items-center gap-5 pb-8">

        {/* 텍스트 박스 */}
        <div className="w-full min-h-[50px] max-h-[90px] overflow-y-auto bg-white border border-slate-200 rounded-2xl p-4 text-center flex items-center justify-center">
          <p className={`text-sm font-medium leading-relaxed ${isListening ? "text-slate-400" : "text-slate-700"}`}>
            {myTranscript}
          </p>
        </div>

        {/* 마이크 버튼 (크기 축소: w-20 -> w-16) */}
        <button
          onClick={toggleListening}
          className={`relative w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg transition-all duration-300 transform active:scale-95
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
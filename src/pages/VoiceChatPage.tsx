import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore"; // ✨ 추가
import { chatApi } from "../api/chatApi";
import { IS_TEST_MODE } from "../config";
import { useNavigate } from "react-router-dom";

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

const VoiceChatPage = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    // ✨ [변경] 전역 스토어 사용
    const { sessionId, setSessionId } = useChatStore();

    // --- 기존 상태 유지 ---
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
            default: return "cat";
        }
    };
    const characterType = getCharacterType(user?.characterSeq);

    const characterImages: Record<string, string> = {
        hamster: "/characters/Hamster.png",
        fox: "/characters/Fox.png",
        panda: "/characters/Panda.png",
        cat: "/characters/Cat.png",
    };
    const currentProfileImg = characterImages[characterType] || characterImages.cat; // rabbit -> cat (기본값 수정)

    const speak = (text: string) => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "ko-KR";
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
    };

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
                // ✨ 세션 ID 업데이트
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
        recognition.onstart = () => { setIsListening(true); transcriptRef.current = ""; };
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
        // ✨ [수정] 전체 배경: bg-white -> dark:bg-slate-900
        <div className="h-full flex flex-col items-center bg-white dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">

            {/* 뒤로가기 버튼 */}
            <button
                onClick={() => navigate('/app/home')}
                // ✨ [수정] 버튼 스타일: bg-white/80 -> dark:bg-slate-800/80, 텍스트 색상
                className="absolute top-4 left-4 z-20 flex items-center gap-1 text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors bg-white/80 dark:bg-slate-800/80 px-3 py-1 rounded-full shadow-sm backdrop-blur-sm"
            >
                <span>←</span>
                <span className="text-sm font-medium">홈으로</span>
            </button>

            {/* ✨ [추가] 키보드 대화 버튼 (우측 상단) */}
            <button
                onClick={() => navigate('/app/chat')}
                // ✨ [수정] 버튼 스타일: bg-white/80 -> dark:bg-slate-800/80, border
                className="absolute top-4 right-4 z-20 flex items-center gap-1 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors bg-white/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-full shadow-sm border border-primary-100 dark:border-slate-700 backdrop-blur-sm"
            >
                <span className="text-sm font-bold">키보드 대화 ⌨️</span>
            </button>

            {/* 상단 텍스트 (AI 메시지) */}
            <div className="mt-12 px-8 text-center animate-[fade-in-down_0.5s]">
                {/* ✨ [수정] AI 메시지 텍스트: text-slate-800 -> dark:text-white */}
                <h2 className="text-xl font-bold text-slate-800 dark:text-white leading-snug">
                    {isLoading ? "생각하는 중... 🤔" : aiMessage}
                </h2>
            </div>

            {/* 캐릭터 이미지 */}
            <div className="flex-1 flex items-center justify-center w-full relative mt-8 pb-8">
                {isListening && (
                    <>
                        {/* ✨ [수정] 핑 애니메이션 색상: opacity 조절 */}
                        <div className="absolute w-56 h-56 bg-primary-100 dark:bg-primary-900/40 rounded-full animate-ping opacity-20 dark:opacity-30"></div>
                        <div className="absolute w-40 h-40 bg-primary-200 dark:bg-primary-800/40 rounded-full animate-pulse opacity-30 dark:opacity-40"></div>
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

            {/* 하단 컨트롤 영역 */}
            {/* ✨ [수정] 컨트롤 박스: bg-slate-50 -> dark:bg-slate-800 */}
            <div className="w-[calc(100%-2rem)] mx-auto mb-4 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] shadow-lg dark:shadow-black/20 p-6 flex flex-col items-center gap-5 pb-8 transition-colors duration-300">

                {/* 텍스트 표시 영역 */}
                {/* ✨ [수정] 텍스트 박스: bg-white -> dark:bg-slate-700, border */}
                <div className="w-full min-h-[50px] max-h-[90px] overflow-y-auto bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl p-4 text-center flex items-center justify-center transition-colors">
                    {/* ✨ [수정] 내 말 텍스트: text-slate-700 -> dark:text-slate-200 */}
                    <p className={`text-sm font-medium leading-relaxed ${isListening ? "text-primary-600 dark:text-primary-400" : "text-slate-700 dark:text-slate-200"}`}>
                        {isListening ? `"${myTranscript}"` : myTranscript}
                    </p>
                </div>

                {/* 마이크 버튼 */}
                <button
                    onClick={toggleListening}
                    disabled={isLoading}
                    className={`relative w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg transition-all duration-300 transform active:scale-95
                        ${isLoading
                            ? "bg-slate-300 dark:bg-slate-600 cursor-not-allowed text-slate-500 dark:text-slate-400"
                            : isListening
                                ? "bg-red-500 text-white shadow-red-200 dark:shadow-none ring-4 ring-red-100 dark:ring-red-900/50 rotate-180"
                                : "bg-primary-600 text-white shadow-primary-200 dark:shadow-none hover:bg-primary-700 hover:-translate-y-1"
                        }
                    `}
                >
                    {isLoading ? "⏳" : (isListening ? "⏹" : "🎙️")}
                </button>

                {/* 하단 안내 문구 */}
                {/* ✨ [수정] 안내 문구: text-slate-400 -> dark:text-slate-500 */}
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    {isLoading ? "대답을 준비하고 있어요" : (isListening ? "말이 끝나면 전송돼요" : "터치해서 말하기")}
                </p>
            </div>
        </div>
    );
};

export default VoiceChatPage;
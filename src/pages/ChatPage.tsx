import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useDiaryStore } from "../store/useDiaryStore";

// ✨ [추가됨] 애니메이션 정의 스타일
// Tailwind 설정 없이 컴포넌트 내부에서 바로 애니메이션을 사용하기 위한 CSS입니다.
const slideUpAnimation = `
@keyframes slide-up {
    0% {
        opacity: 0;
        transform: translateY(10px);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
}
.animate-slide-up {
    animation: slide-up 0.3s ease-out forwards;
}
`;

interface Message {
    id: number;
    text: string;
    sender: "user" | "character";
    timestamp: Date;
}

interface GeneratedDiary {
    title: string;
    content: string;
    mood: string;
}

interface ChatPageProps {
    isMiniMode?: boolean;
}

const ChatPage = ({ isMiniMode: propIsMiniMode = false }: ChatPageProps) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { user } = useAuthStore();
    const { addDiary } = useDiaryStore();

    const isMiniMode = propIsMiniMode || searchParams.get("mode") === "mini";

    const containerStyleClass = isMiniMode
        ? "h-[80vh] rounded-[40px] shadow-2xl border border-slate-200 overflow-hidden"
        : "h-[80vh] rounded-[40px] shadow-2xl border border-slate-200 overflow-hidden";

    const myNickname = user?.nickname || "친구";
    const myBuddyName = user?.buddyName || "Buddy";
    const myCharType = user?.characterType || "rabbit";

    const characterImages: Record<string, string> = {
        hamster: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Hamster.png",
        fox: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Fox.png",
        lion: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Lion.png",
        panda: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Panda.png",
        cat: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Cat%20Face.png",
        dog: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Dog%20Face.png",
        rabbit: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Rabbit%20Face.png",
        capybara: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Bear.png",
        turtle: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Turtle.png",
    };

    const currentProfileImg = characterImages[myCharType] || characterImages.rabbit;

    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: `안녕, ${myNickname}! 오늘 하루는 어땠어?`,
            sender: "character",
            timestamp: new Date(),
        },
    ]);
    const [inputText, setInputText] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    const [showDiaryModal, setShowDiaryModal] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedDiary, setGeneratedDiary] = useState<GeneratedDiary | null>(null);

    // ✨ [추가됨] 시간 포맷 함수
    const formatTime = (date: Date) => {
        return new Intl.DateTimeFormat('ko-KR', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
        }).format(date);
    };

    useEffect(() => {
        // 메시지가 추가되거나 타이핑 중일 때 스크롤을 아래로 내립니다.
        // 약간의 지연을 주어 애니메이션이 시작된 후 스크롤이 이동하도록 합니다.
        const timer = setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
        return () => clearTimeout(timer);
    }, [messages, isTyping]);

    const handleSendMessage = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputText.trim()) return;

        const newUserMsg: Message = {
            id: Date.now(),
            text: inputText,
            sender: "user",
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, newUserMsg]);
        setInputText("");
        setIsTyping(true);

        setTimeout(() => {
            const botMsg: Message = {
                id: Date.now() + 1,
                text: `"${newUserMsg.text}"라니... 정말 흥미롭네! 더 자세히 이야기해줄래?`,
                sender: "character",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botMsg]);
            setIsTyping(false);
        }, 1200);
    };

    // ... (handleEndConversation, handleSaveDiary는 기존과 동일하므로 생략)
    const handleEndConversation = () => {
        if (messages.length < 3) {
            alert("일기를 쓰기엔 대화가 너무 짧아요! 조금 더 이야기해요 ☺️");
            return;
        }
        setShowDiaryModal(true);
        setIsGenerating(true);

        setTimeout(() => {
            setGeneratedDiary({
                title: "오늘의 기록",
                mood: "평온",
                content: `오늘은 ${myNickname}님이 ${myBuddyName}와 즐거운 대화를 나누었다. \n\n"${messages[messages.length - 2]?.text || '오늘의 대화'}"\n\n이런 이야기를 나누며 하루를 정리했다. 내일도 좋은 일이 가득하길 바란다.`,
            });
            setIsGenerating(false);
        }, 2000);
    };

    const handleSaveDiary = () => {
        if (!generatedDiary || !user?.id) return;
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];

        addDiary({
            id: Date.now().toString(),
            userId: user.id,
            date: dateStr,
            mood: generatedDiary.mood,
            content: generatedDiary.content,
        });

        alert("일기가 저장되었습니다! 📅");
        if (isMiniMode) {
            window.close();
        } else {
            navigate("/app/calendar");
        }
    };


    return (
        <>
            {/* ✨ [추가됨] 애니메이션 스타일 주입 */}
            <style>{slideUpAnimation}</style>

            <div className={`flex flex-col relative bg-slate-50 ${containerStyleClass}`}>

                {/* 헤더 (기존과 동일) */}
                <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 overflow-hidden">
                            <img src={currentProfileImg} alt="char" className="w-full h-full object-contain p-1" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-slate-800">{myBuddyName}</h2>
                            <p className="text-xs text-primary-500 font-medium">대화 중...</p>
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

                {/* 채팅 내용 영역 */}
                <div className={`flex-1 overflow-y-auto p-6 custom-scrollbar ${isMiniMode ? 'pt-4' : ''}`}>
                    <div className="max-w-4xl mx-auto space-y-6">
                        {messages.map((msg) => {
                            const isMe = msg.sender === "user";
                            return (
                                <div
                                    key={msg.id}
                                    // ✨ [수정됨] animate-slide-up 클래스 추가 (등장 애니메이션)
                                    className={`flex ${isMe ? "justify-end" : "justify-start"} items-start gap-3 animate-slide-up`}
                                >
                                    {/* 캐릭터 프사 (왼쪽) - 기존과 동일 */}
                                    {!isMe && (
                                        <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex-shrink-0 overflow-hidden shadow-sm mt-1">
                                            <img src={currentProfileImg} alt="bot" className="w-full h-full object-contain p-1" />
                                        </div>
                                    )}

                                    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                                        {/* 캐릭터 이름 표시 - 기존과 동일 */}
                                        {!isMe && (
                                            <span className="text-[11px] text-slate-500 font-bold mb-1 ml-1">
                                                {myBuddyName}
                                            </span>
                                        )}

                                        {/* ✨ [수정됨] 말풍선과 시간을 감싸는 컨테이너 추가 */}
                                        <div className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                                            {/* 말풍선 - 기존과 동일 */}
                                            <div
                                                className={`px-5 py-3 text-sm leading-relaxed shadow-sm max-w-[80%] ${isMe
                                                    ? "bg-primary-600 text-white rounded-2xl rounded-tr-none"
                                                    : "bg-white text-slate-700 border border-slate-100 rounded-2xl rounded-tl-none"
                                                    }`}
                                            >
                                                {msg.text}
                                            </div>

                                            {/* ✨ [추가됨] 시간 표시 */}
                                            <span className="text-[10px] text-slate-400 mb-1 flex-shrink-0 select-none">
                                                {formatTime(msg.timestamp)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* 입력 중 표시 (기존과 동일) */}
                        {isTyping && (
                            <div className="flex justify-start items-end gap-3 animate-pulse">
                                <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex-shrink-0 overflow-hidden">
                                    <img src={currentProfileImg} alt="bot" className="w-full h-full object-contain p-1" />
                                </div>
                                <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-tl-none text-slate-400 text-xs">
                                    입력 중... 💬
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* 입력창 영역 (기존과 동일) */}
                <div className="flex-shrink-0 p-4 bg-white border-t border-gray-100">
                    <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-2">
                        <input
                            type="text"
                            className="flex-1 rounded-full bg-slate-100 px-5 py-3 text-sm text-slate-800 
                            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all placeholder:text-slate-400"
                            placeholder="메시지를 입력하세요..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                        />

                        {isMiniMode && (
                            <button
                                type="button"
                                onClick={handleEndConversation}
                                className="w-11 h-11 rounded-full bg-white border border-primary-200 text-primary-600 flex items-center justify-center hover:bg-primary-50 transition shadow-sm"
                                title="대화 종료"
                            >
                                ✨
                            </button>
                        )}

                        <button
                            type="submit"
                            disabled={!inputText.trim()}
                            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-md flex-shrink-0 ${!inputText.trim()
                                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                    : "bg-primary-600 text-white hover:bg-primary-700 hover:scale-105"
                                }`}
                        >
                            ➤
                        </button>
                    </form>
                </div>

                {/* 모달 (생략: 기존 코드 유지) */}
                {/* ... 기존 모달 코드 ... */}
                {showDiaryModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-[fade-in_0.3s_ease-out] max-h-[90vh] overflow-y-auto">
                            <div className="bg-primary-600 p-6 text-white text-center relative">
                                <h3 className="text-lg font-bold tracking-widest">DIARY PREVIEW</h3>
                                <p className="text-primary-100 text-xs mt-1">오늘의 대화가 일기로 변신했어요!</p>
                                <button
                                    onClick={() => setShowDiaryModal(false)}
                                    className="absolute top-4 right-4 text-white/70 hover:text-white text-xl"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="p-6">
                                {isGenerating ? (
                                    <div className="flex flex-col items-center gap-4 py-10">
                                        <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
                                        <p className="text-slate-500 text-sm font-medium animate-pulse">Buddy가 열심히 일기를 쓰는 중...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-slate-400">오늘의 기분</span>
                                            <div className="flex gap-2">
                                                {["행복", "평온", "설렘"].map(m => (
                                                    <button
                                                        key={m}
                                                        onClick={() => setGeneratedDiary(prev => prev ? { ...prev, mood: m } : null)}
                                                        className={`px-3 py-1 rounded-full text-xs font-bold border ${generatedDiary?.mood === m ? "bg-primary-100 text-primary-700 border-primary-200" : "bg-white text-slate-400 border-slate-200"}`}
                                                    >
                                                        {m}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-400">일기 내용 (수정 가능)</label>
                                            <textarea
                                                className="w-full h-40 p-4 text-sm text-slate-700 bg-slate-50 rounded-xl border border-gray-200 focus:outline-none focus:border-primary-400 focus:bg-white transition-all resize-none leading-relaxed custom-scrollbar"
                                                value={generatedDiary?.content}
                                                onChange={(e) => setGeneratedDiary(prev => prev ? { ...prev, content: e.target.value } : null)}
                                            />
                                        </div>

                                        <button
                                            onClick={handleSaveDiary}
                                            className="w-full mt-2 bg-primary-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 transition active:scale-[0.98]"
                                        >
                                            📅 일기장에 저장하기
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default ChatPage;
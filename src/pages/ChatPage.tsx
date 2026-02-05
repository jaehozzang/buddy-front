import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore"; // ✨ 추가
import { chatApi } from "../api/chatApi";
import { IS_TEST_MODE } from "../config";

const slideUpAnimation = `
@keyframes slide-up {
    0% { opacity: 0; transform: translateY(10px); }
    100% { opacity: 1; transform: translateY(0); }
}
.animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
`;

interface Message {
    id: number;
    text: string;
    sender: "user" | "character";
    timestamp: Date;
}

interface ChatPageProps {
    isMiniMode?: boolean;
}

const ChatPage = ({ isMiniMode: propIsMiniMode = false }: ChatPageProps) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { user } = useAuthStore();

    // ✨ [변경] 전역 스토어에서 sessionId 관리
    const { sessionId, setSessionId } = useChatStore();

    const isMiniMode = propIsMiniMode || searchParams.get("mode") === "mini";
    const containerStyleClass = isMiniMode
        ? "h-[100vh] sm:h-[80vh] sm:rounded-[40px] shadow-2xl border border-slate-200 overflow-hidden"
        : "h-[80vh] rounded-[40px] shadow-2xl border border-slate-200 overflow-hidden";

    const myNickname = user?.nickname || "친구";
    const myBuddyName = user?.characterNickname || "Buddy";

    // 캐릭터 이미지 로직 (기존 동일)
    const getCharacterType = (seq?: number) => {
        switch (seq) {
            case 1: return "hamster";
            case 2: return "fox";
            case 3: return "panda";
            default: return "rabbit";
        }
    };
    const myCharType = getCharacterType(user?.characterSeq);
    const characterImages: Record<string, string> = {
        hamster: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Hamster.png",
        fox: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Fox.png",
        panda: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Panda.png",
        rabbit: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Rabbit%20Face.png",
    };
    const currentProfileImg = characterImages[myCharType] || characterImages.rabbit;

    // 초기 메시지 (세션이 없을 때만 표시)
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    // ✨ [추가] 이전 대화 내역 불러오기
    useEffect(() => {
        const loadHistory = async () => {
            // 세션이 없으면 기본 인사말 추가
            if (sessionId === 0) {
                setMessages([{
                    id: 1,
                    text: `안녕, ${myNickname}! 오늘 하루는 어땠어?`,
                    sender: "character",
                    timestamp: new Date(),
                }]);
                return;
            }

            try {
                // 이전 대화 로드
                const res = await chatApi.getChatHistory(sessionId);
                if (res && Array.isArray(res.result)) {
                    // 서버 데이터를 UI 포맷으로 변환
                    const formattedMessages: Message[] = res.result.map((item: any) => ({
                        id: item.messageSeq || Math.random(),
                        text: item.content,
                        // role은 대소문자 무관하게 처리
                        sender: (item.role || "").toUpperCase() === "USER" ? "user" : "character",
                        timestamp: new Date(item.createdAt)
                    }));
                    setMessages(formattedMessages);
                }
            } catch (error) {
                console.error("이전 대화 불러오기 실패", error);
            }
        };

        loadHistory();
    }, [sessionId]); // sessionId가 바뀔 때마다 실행

    const formatTime = (date: Date) => {
        return new Intl.DateTimeFormat('ko-KR', {
            hour: 'numeric', minute: 'numeric', hour12: true,
        }).format(date);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
        return () => clearTimeout(timer);
    }, [messages, isTyping]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputText.trim() || isTyping) return;

        const userText = inputText;
        const newUserMsg: Message = {
            id: Date.now(),
            text: userText,
            sender: "user",
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, newUserMsg]);
        setInputText("");
        setIsTyping(true);

        try {
            if (IS_TEST_MODE) {
                // ... 테스트 모드 로직 ...
            } else {
                const requestSessionId = sessionId === 0 ? 0 : sessionId;

                const response = await chatApi.sendMessage({
                    sessionId: requestSessionId,
                    content: userText
                });

                // ✨ 세션 ID 업데이트
                if (response.result.sessionId && response.result.sessionId !== sessionId) {
                    setSessionId(response.result.sessionId);
                }

                const botMsg: Message = {
                    id: Date.now() + 1,
                    text: response.result.content,
                    sender: "character",
                    timestamp: new Date(response.result.createdAt),
                };
                setMessages((prev) => [...prev, botMsg]);
            }
        } catch (error) {
            console.error("채팅 전송 실패:", error);
            setMessages((prev) => [...prev, {
                id: Date.now() + 1,
                text: "서버 오류가 발생했어요.",
                sender: "character",
                timestamp: new Date(),
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleEndConversation = async () => {
        if (messages.length < 2) {
            alert("일기를 쓰기엔 대화가 너무 짧아요!");
            return;
        }
        if (sessionId === 0) {
            alert("저장된 대화 내용이 없습니다.");
            return;
        }

        // 일기 작성 페이지로 이동
        navigate("/app/diary/new", {
            state: {
                sessionId: sessionId,
                date: new Date().toISOString().split("T")[0]
            }
        });
    };

    return (
        <>
            <style>{slideUpAnimation}</style>
            <div className={`flex flex-col relative bg-slate-50 ${containerStyleClass}`}>
                {/* 헤더 */}
                <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        {/* 뒤로가기 버튼 추가 (VoiceChat으로 돌아가기 쉽게) */}
                        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600 sm:hidden">
                            ←
                        </button>
                        <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 overflow-hidden">
                            <img src={currentProfileImg} alt="char" className="w-full h-full object-contain p-1" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-slate-800">{myBuddyName}</h2>
                            <p className="text-xs text-primary-500 font-medium">
                                {sessionId > 0 ? "대화 이어지는 중..." : "대화 중..."}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleEndConversation}
                        className="px-4 py-2 bg-white border border-primary-200 text-primary-600 text-xs font-bold rounded-full 
                        hover:bg-primary-50 transition shadow-sm hover:shadow-md disabled:opacity-50"
                    >
                        오늘 대화 종료하기 ✨
                    </button>
                </div>

                {/* 메시지 영역 (기존 디자인 유지) */}
                <div className={`flex-1 overflow-y-auto p-6 custom-scrollbar ${isMiniMode ? 'pt-4' : ''}`}>
                    <div className="max-w-4xl mx-auto space-y-6">
                        {messages.map((msg) => {
                            const isMe = msg.sender === "user";
                            return (
                                <div
                                    key={msg.id}
                                    className={`flex ${isMe ? "justify-end" : "justify-start"} items-start gap-3 animate-slide-up`}
                                >
                                    {!isMe && (
                                        <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex-shrink-0 overflow-hidden shadow-sm mt-1">
                                            <img src={currentProfileImg} alt="bot" className="w-full h-full object-contain p-1" />
                                        </div>
                                    )}

                                    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                                        {!isMe && (
                                            <span className="text-[11px] text-slate-500 font-bold mb-1 ml-1">
                                                {myBuddyName}
                                            </span>
                                        )}
                                        <div className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                                            <div
                                                className={`px-5 py-3 text-sm leading-relaxed shadow-sm max-w-[80%] ${isMe
                                                    ? "bg-primary-600 text-white rounded-2xl rounded-tr-none"
                                                    : "bg-white text-slate-700 border border-slate-100 rounded-2xl rounded-tl-none"
                                                    }`}
                                            >
                                                {msg.text}
                                            </div>
                                            <span className="text-[10px] text-slate-400 mb-1 flex-shrink-0 select-none">
                                                {formatTime(msg.timestamp)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {isTyping && (
                            <div className="flex justify-start items-end gap-3 animate-pulse">
                                <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex-shrink-0 overflow-hidden">
                                    <img src={currentProfileImg} alt="bot" className="w-full h-full object-contain p-1" />
                                </div>
                                <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-tl-none text-slate-400 text-xs">
                                    {myBuddyName}가 생각하는 중... 🤔
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* 입력폼 (기존 디자인 유지) */}
                <div className="flex-shrink-0 p-4 bg-white border-t border-gray-100">
                    <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-2">
                        <input
                            type="text"
                            className="flex-1 rounded-full bg-slate-100 px-5 py-3 text-sm text-slate-800 
                            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all placeholder:text-slate-400"
                            placeholder="메시지를 입력하세요..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            disabled={isTyping}
                        />
                        <button
                            type="submit"
                            disabled={!inputText.trim() || isTyping}
                            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-md flex-shrink-0 ${!inputText.trim() || isTyping
                                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                : "bg-primary-600 text-white hover:bg-primary-700 hover:scale-105"
                                }`}
                        >
                            ➤
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default ChatPage;
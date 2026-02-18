import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
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
    const { sessionId, setSessionId } = useChatStore();

    const isMiniMode = propIsMiniMode || searchParams.get("mode") === "mini";
    const containerStyleClass = isMiniMode
        ? "h-[100vh] sm:h-[80vh] sm:rounded-[40px] shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
        : "h-[80vh] rounded-[40px] shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden";

    const myNickname = user?.nickname || "친구";
    const myBuddyName = user?.characterNickname || "Buddy";

    const getCharacterType = (seq?: number) => {
        switch (seq) {
            case 1: return "hamster";
            case 2: return "fox";
            case 3: return "panda";
            default: return "cat";
        }
    };
    const myCharType = getCharacterType(user?.characterSeq);
    const characterImages: Record<string, string> = {
        hamster: "/characters/Hamster.png",
        fox: "/characters/Fox.png",
        panda: "/characters/Panda.png",
        cat: "/characters/Cat.png",
    };
    const currentProfileImg = characterImages[myCharType] || characterImages.cat; // rabbit -> cat

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        const loadHistory = async () => {
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
                const res = await chatApi.getChatHistory(sessionId);
                if (res && Array.isArray(res.result)) {
                    const formattedMessages: Message[] = res.result.map((item: any) => ({
                        id: item.messageSeq || Math.random(),
                        text: item.content,
                        sender: (item.role || "").toUpperCase() === "USER" ? "user" : "character",
                        timestamp: new Date(item.createdAt)
                    }));
                    formattedMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
                    setMessages(formattedMessages);
                }
            } catch (error) {
                console.error("이전 대화 불러오기 실패", error);
            }
        };
        loadHistory();
    }, [sessionId]);

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
                // 테스트 로직 생략
            } else {
                const requestSessionId = sessionId === 0 ? 0 : sessionId;
                const response = await chatApi.sendMessage({
                    sessionId: requestSessionId,
                    content: userText
                });

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
            alert("서버와 연결된 대화 내용이 없습니다.");
            return;
        }
        navigate("/app/calendar", {
            state: {
                sessionId: sessionId,
                date: new Date().toISOString().split("T")[0]
            }
        });
        setSessionId(0);
    };

    return (
        <>
            <style>{slideUpAnimation}</style>
            {/* ✨ [수정] 전체 배경: bg-slate-50 -> dark:bg-slate-900 */}
            <div className={`flex flex-col relative bg-slate-50 dark:bg-slate-900 transition-colors duration-300 ${containerStyleClass}`}>

                {/* 헤더 */}
                {/* ✨ [수정] 헤더 스타일: bg-white -> dark:bg-slate-800, border */}
                <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 sticky top-0 z-10 transition-colors">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 sm:hidden">
                            ←
                        </button>
                        {/* ✨ [수정] 프로필 테두리: border-slate-200 -> dark:border-slate-600 */}
                        <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 overflow-hidden">
                            <img src={currentProfileImg} alt="char" className="w-full h-full object-contain p-1" />
                        </div>
                        <div>
                            {/* ✨ [수정] 이름: text-slate-800 -> dark:text-white */}
                            <h2 className="text-sm font-bold text-slate-800 dark:text-white">{myBuddyName}</h2>
                            <p className="text-xs text-primary-500 dark:text-primary-400 font-medium">
                                {sessionId > 0 ? "대화 이어지는 중..." : "대화 중..."}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleEndConversation}
                        // ✨ [수정] 종료 버튼: bg-white -> dark:bg-slate-700, border
                        className="px-4 py-2 bg-white dark:bg-slate-700 border border-primary-200 dark:border-slate-600 text-primary-600 dark:text-primary-300 text-xs font-bold rounded-full 
                        hover:bg-primary-50 dark:hover:bg-slate-600 transition shadow-sm hover:shadow-md disabled:opacity-50"
                    >
                        오늘 대화 종료하기 ✨
                    </button>
                </div>

                {/* 메시지 영역 */}
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
                                        // ✨ [수정] 상대방 프로필 배경: bg-white -> dark:bg-slate-800
                                        <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex-shrink-0 overflow-hidden shadow-sm mt-1">
                                            <img src={currentProfileImg} alt="bot" className="w-full h-full object-contain p-1" />
                                        </div>
                                    )}

                                    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                                        {!isMe && (
                                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold mb-1 ml-1">
                                                {myBuddyName}
                                            </span>
                                        )}
                                        <div className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                                            <div
                                                // ✨ [수정] 말풍선 스타일
                                                // User: bg-primary-600 (유지)
                                                // Buddy: bg-white -> dark:bg-slate-700, text-slate-700 -> dark:text-slate-200, border
                                                className={`px-5 py-3 text-sm leading-relaxed shadow-sm max-w-[80%] ${isMe
                                                    ? "bg-primary-600 text-white rounded-2xl rounded-tr-none dark:bg-primary-700"
                                                    : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-600 rounded-2xl rounded-tl-none"
                                                    }`}
                                            >
                                                {msg.text}
                                            </div>
                                            {/* ✨ [수정] 시간 텍스트: text-slate-400 -> dark:text-slate-500 */}
                                            <span className="text-[10px] text-slate-400 dark:text-slate-500 mb-1 flex-shrink-0 select-none">
                                                {formatTime(msg.timestamp)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {isTyping && (
                            <div className="flex justify-start items-end gap-3 animate-pulse">
                                <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex-shrink-0 overflow-hidden">
                                    <img src={currentProfileImg} alt="bot" className="w-full h-full object-contain p-1" />
                                </div>
                                {/* ✨ [수정] 타이핑 표시 박스: bg-slate-100 -> dark:bg-slate-700 */}
                                <div className="bg-slate-100 dark:bg-slate-700 px-4 py-3 rounded-2xl rounded-tl-none text-slate-400 dark:text-slate-300 text-xs">
                                    {myBuddyName}가 생각하는 중... 🤔
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* 입력폼 */}
                {/* ✨ [수정] 입력 영역 배경: bg-white -> dark:bg-slate-800, border */}
                <div className="flex-shrink-0 p-4 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 transition-colors">
                    <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-2">
                        <input
                            type="text"
                            // ✨ [수정] 입력창 스타일: bg-slate-100 -> dark:bg-slate-700, text-slate-800 -> dark:text-white
                            className="flex-1 rounded-full bg-slate-100 dark:bg-slate-700 px-5 py-3 text-sm text-slate-800 dark:text-white
                            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-600 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            placeholder="메시지를 입력하세요..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            disabled={isTyping}
                        />
                        <button
                            type="submit"
                            disabled={!inputText.trim() || isTyping}
                            // ✨ [수정] 전송 버튼 스타일
                            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-md flex-shrink-0 ${!inputText.trim() || isTyping
                                ? "bg-slate-200 dark:bg-slate-600 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                                : "bg-primary-600 text-white hover:bg-primary-700 dark:hover:bg-primary-500 hover:scale-105"
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
import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { chatApi } from "../api/chatApi";
import { diaryApi } from "../api/diaryApi";
import { IS_TEST_MODE } from "../config";

// 애니메이션 스타일
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

// 태그 정보를 통째로 저장할 타입 정의
interface Tag {
    tagSeq: number;
    name: string;
}

interface GeneratedDiary {
    title: string;
    content: string;
    tags: Tag[]; // 번호(tagSeq)와 이름(name) 다 저장
}

interface ChatPageProps {
    isMiniMode?: boolean;
}

const ChatPage = ({ isMiniMode: propIsMiniMode = false }: ChatPageProps) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { user } = useAuthStore();

    // ✨ [기존 수정 유지] 진짜 세션 ID 저장
    const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);

    const isMiniMode = propIsMiniMode || searchParams.get("mode") === "mini";

    const containerStyleClass = isMiniMode
        ? "h-[100vh] sm:h-[80vh] sm:rounded-[40px] shadow-2xl border border-slate-200 overflow-hidden"
        : "h-[80vh] rounded-[40px] shadow-2xl border border-slate-200 overflow-hidden";

    const myNickname = user?.nickname || "친구";
    const myBuddyName = user?.characterNickname || "Buddy";

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

    // 🚀 [API] 메시지 전송
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
                await new Promise(r => setTimeout(r, 1000));
                const botMsg: Message = {
                    id: Date.now() + 1,
                    text: `[테스트] 너는 "${userText}"라고 말했어!`,
                    sender: "character",
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, botMsg]);
            } else {
                const requestSessionId = currentSessionId === null ? null : currentSessionId;

                // @ts-ignore
                const response = await chatApi.sendMessage({
                    sessionId: requestSessionId as any,
                    content: userText
                });

                if (response.result.sessionId) {
                    console.log("🎟️ 방 번호 발급됨:", response.result.sessionId);
                    setCurrentSessionId(response.result.sessionId);
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
            const errorMsg: Message = {
                id: Date.now() + 1,
                text: "서버 오류가 발생했어요.",
                sender: "character",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    // 🚀 [API] 대화 종료 및 일기 생성
    const handleEndConversation = async () => {
        if (messages.length < 2) {
            alert("일기를 쓰기엔 대화가 너무 짧아요!");
            return;
        }

        if (!currentSessionId) {
            alert("서버와 연결된 대화 내용이 없습니다.");
            return;
        }

        setShowDiaryModal(true);
        setIsGenerating(true);

        try {
            if (IS_TEST_MODE) {
                await new Promise(r => setTimeout(r, 2000));
                setGeneratedDiary({
                    title: "즐거운 하루",
                    content: `오늘은 ${myNickname}님이 ${myBuddyName}와 즐거운 대화를 나누었다.`,
                    tags: [
                        { tagSeq: 1, name: "행복" },
                        { tagSeq: 2, name: "대화" }
                    ]
                });
            } else {
                // ✨ [이전 수정 유지] 객체로 감싸서 요청
                const response = await diaryApi.createDiaryFromChat({ sessionId: currentSessionId } as any);

                if (response.result) {
                    setGeneratedDiary({
                        title: response.result.title,
                        content: response.result.content,
                        tags: response.result.tags
                    });
                }
            }
        } catch (error) {
            console.error("일기 생성 실패:", error);
            alert("일기 생성에 실패했습니다.");
            setShowDiaryModal(false);
        } finally {
            setIsGenerating(false);
        }
    };

    // 🚀 [API] 최종 일기 저장 (여기가 핵심 수정됨!)
    const handleSaveDiary = async () => {
        if (!generatedDiary) return;

        try {
            if (IS_TEST_MODE) {
                // ... 테스트 모드 생략 ...
            } else {
                // ✨ [수정 Point 1] FormData 객체 생성 (Multipart 전송을 위해)
                const formData = new FormData();

                // ✨ [수정 Point 2] JSON 데이터를 만들어서 'request'라는 이름의 Blob으로 포장
                // 명세서에 따르면 request는 object이고, 태그는 tagSeq(번호)를 리스트로 받는 것이 일반적입니다.
                const diaryRequestData = {
                    title: generatedDiary.title,
                    content: generatedDiary.content,
                    tagSeqs: generatedDiary.tags.map(t => t.tagSeq) // 번호만 추출해서 보냄
                };

                // JSON 객체를 문자열로 바꾸고, Blob(타입: application/json)으로 감싸서 'request' 키에 넣음
                formData.append("request", new Blob([JSON.stringify(diaryRequestData)], {
                    type: "application/json"
                }));

                // ✨ [수정 Point 3] 이미지는 없지만 명세에 있으므로, 필요하다면 빈 값을 보내거나 생략
                // (보통 필수는 아니지만, 명세가 strict하다면 빈 파일이라도 보내야 할 수 있음. 여기선 생략)
                // formData.append("image", file); // 파일이 있다면 여기에 추가

                // ✨ [수정 Point 4] FormData를 그대로 API에 전달
                // (diaryApi.createDiary 함수의 인자 타입을 무시하기 위해 as any 사용)
                await diaryApi.createDiary(formData as any);
            }

            alert("일기가 캘린더에 저장되었습니다! 📅");

            if (isMiniMode) {
                window.close();
            } else {
                navigate("/app/calendar");
            }

        } catch (error) {
            console.error("일기 저장 실패:", error);
            alert("일기 저장 중 오류가 발생했습니다.");
        }
    };

    return (
        <>
            <style>{slideUpAnimation}</style>
            <div className={`flex flex-col relative bg-slate-50 ${containerStyleClass}`}>
                {/* ... 헤더 및 채팅 영역 (기존 코드와 동일) ... */}
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
                        disabled={isGenerating}
                        className="px-4 py-2 bg-white border border-primary-200 text-primary-600 text-xs font-bold rounded-full 
                        hover:bg-primary-50 transition shadow-sm hover:shadow-md disabled:opacity-50"
                    >
                        오늘 대화 종료하기 ✨
                    </button>
                </div>

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
                        {/* 입력 중 표시 */}
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

                {/* 모달 */}
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
                                        <p className="text-slate-500 text-sm font-medium animate-pulse">
                                            {myBuddyName}가 열심히 일기를 쓰는 중... 🖊️
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="text-center pb-2 border-b border-slate-100">
                                            <h2 className="text-lg font-bold text-slate-800">{generatedDiary?.title}</h2>
                                        </div>
                                        <div className="flex flex-wrap gap-2 justify-center">
                                            {generatedDiary?.tags.map((tag, idx) => (
                                                <span key={idx} className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-md">
                                                    #{tag.name}
                                                </span>
                                            ))}
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
                                            📅 저장하고 캘린더 가기
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
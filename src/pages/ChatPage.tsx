import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
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

const ChatPage = () => {
    const navigate = useNavigate();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { user } = useAuthStore();
    const { addDiary } = useDiaryStore();

    // 1. 내 정보 가져오기
    const myNickname = user?.nickname || "친구";
    const myBuddyName = user?.buddyName || "Buddy";
    const myCharType = user?.characterType || "rabbit";

    // ✨ 2. [복구] 3D 애니메이션 이미지 매핑 (마이크로소프트 Fluent Emojis)
    const characterImages: Record<string, string> = {
        hamster: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Hamster.png",
        fox: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Fox.png",
        lion: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Lion.png",
        panda: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Panda.png",
        cat: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Cat%20Face.png",
        dog: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Dog%20Face.png",
        rabbit: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Rabbit%20Face.png",
        // 예외 처리를 위한 기본값
        capybara: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Bear.png", 
        turtle: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Turtle.png",
    };

    // 현재 선택된 캐릭터의 이미지 주소 (없으면 토끼)
    const currentProfileImg = characterImages[myCharType] || characterImages.rabbit;

    // 3. 상태 관리
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: `안녕, ${myNickname}! 오늘 하루는 어땠어?`, 
            sender: "character",
            timestamp: new Date(),
        },
    ]);
    const [inputText, setInputText] = useState("");
    const [isTyping, setIsTyping] = useState(false); // AI가 입력 중인지

    // 일기 생성 모달 상태
    const [showDiaryModal, setShowDiaryModal] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedDiary, setGeneratedDiary] = useState<GeneratedDiary | null>(null);

    // 스크롤 자동 이동
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    // 4. 메시지 전송 핸들러
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
                text: `"${newUserMsg.text}"라니... 정말 흥미롭네! 더 자세히 이야기해줄래?`,
                sender: "character",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botMsg]);
            setIsTyping(false);
        }, 1200);
    };

    // 5. 대화 종료 및 일기 생성 핸들러
    const handleEndConversation = () => {
        // 대화가 너무 짧으면 경고
        if (messages.length < 3) {
            alert("일기를 쓰기엔 대화가 너무 짧아요! 조금 더 이야기해요 ☺️");
            return;
        }

        setShowDiaryModal(true);
        setIsGenerating(true);

        // (임시) AI가 일기를 요약하는 척 시뮬레이션
        setTimeout(() => {
            setGeneratedDiary({
                title: "오늘의 기록",
                mood: "평온", // 임시 기분
                content: `오늘은 ${myNickname}님이 ${myBuddyName}와 즐거운 대화를 나누었다. \n\n"${messages[messages.length - 2]?.text || '오늘의 대화'}"\n\n이런 이야기를 나누며 하루를 정리했다. 내일도 좋은 일이 가득하길 바란다.`,
            });
            setIsGenerating(false);
        }, 2000);
    };

    // 6. 일기 저장 후 이동
    const handleSaveDiary = () => {
        if (!generatedDiary || !user?.id) return;

        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];

        // 스토어에 저장 (userId 포함)
        addDiary({
            id: Date.now().toString(),
            userId: user.id, // ✨ 내 아이디표 붙이기
            date: dateStr,
            mood: generatedDiary.mood,
            content: generatedDiary.content,
        });

        alert("일기가 저장되었습니다! 📅");
        navigate("/app/calendar");
    };

    return (
        <div className="h-full flex flex-col relative bg-slate-50">

            {/* --- 상단 헤더 --- */}
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 sticky top-0 z-10 flex-shrink-0">
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

            {/* --- 채팅 영역 --- */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg) => {
                    const isMe = msg.sender === "user";
                    return (
                        <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-2`}>
                            
                            {/* 캐릭터 프사 (왼쪽에만) */}
                            {!isMe && (
                                <div className="w-9 h-9 rounded-full bg-white border border-gray-200 flex-shrink-0 overflow-hidden shadow-sm">
                                    <img src={currentProfileImg} alt="bot" className="w-full h-full object-contain p-0.5" />
                                </div>
                            )}

                            {/* 말풍선 */}
                            <div
                                className={`max-w-[75%] px-5 py-3 text-sm leading-relaxed shadow-sm ${isMe
                                    ? "bg-primary-600 text-white rounded-2xl rounded-tr-none"
                                    : "bg-white text-slate-700 border border-slate-100 rounded-2xl rounded-tl-none"
                                }`}
                            >
                                {msg.text}
                            </div>
                        </div>
                    );
                })}

                {/* 입력 중 표시 */}
                {isTyping && (
                    <div className="flex justify-start items-end gap-2 animate-pulse">
                        <div className="w-9 h-9 rounded-full bg-white border border-gray-200 flex-shrink-0 overflow-hidden">
                            <img src={currentProfileImg} alt="bot" className="w-full h-full object-contain p-0.5" />
                        </div>
                        <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-tl-none text-slate-400 text-xs">
                            입력 중... 💬
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* --- 입력창 영역 --- */}
            <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0">
                <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-2">
                    <input
                        type="text"
                        className="flex-1 rounded-full bg-slate-100 px-5 py-3 text-sm text-slate-800 
                        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all placeholder:text-slate-400"
                        placeholder="메시지를 입력하세요..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={!inputText.trim()}
                        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-md ${
                            !inputText.trim() 
                            ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                            : "bg-primary-600 text-white hover:bg-primary-700 hover:scale-105"
                        }`}
                    >
                        ➤
                    </button>
                </form>
            </div>

            {/* --- [모달] 일기 생성 결과 --- */}
            {showDiaryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-[fade-in_0.3s_ease-out]">

                        {/* 모달 헤더 */}
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

                        {/* 모달 내용 */}
                        <div className="p-6">
                            {isGenerating ? (
                                <div className="flex flex-col items-center gap-4 py-10">
                                    <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
                                    <p className="text-slate-500 text-sm font-medium animate-pulse">Buddy가 열심히 일기를 쓰는 중...</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* 감정 태그 */}
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-400">오늘의 기분</span>
                                        <div className="flex gap-2">
                                            {["행복", "평온", "설렘"].map(m => (
                                                <button 
                                                    key={m} 
                                                    onClick={() => setGeneratedDiary(prev => prev ? {...prev, mood: m} : null)}
                                                    className={`px-3 py-1 rounded-full text-xs font-bold border ${generatedDiary?.mood === m ? "bg-primary-100 text-primary-700 border-primary-200" : "bg-white text-slate-400 border-slate-200"}`}
                                                >
                                                    {m}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 일기 편집 영역 */}
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
    );
};

export default ChatPage;
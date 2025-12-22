import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import HeaderButton from "./HeaderButton";
import { useAuthStore } from "../store/useAuthStore";

export default function Header() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    const isAppRoute = location.pathname.startsWith("/app");
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const characterImages: Record<string, string> = {
        hamster: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Hamster.png",
        fox: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Fox.png",
        lion: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Lion.png",
        panda: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Panda.png",
        cat: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Cat%20Face.png",
        dog: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Dog%20Face.png",
        rabbit: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Rabbit%20Face.png",
    };

    // --- 1) 로그인 전 / 인트로 헤더 ---
    if (!isAppRoute) {
        return (
            // ✨ [수정] h-[72px]로 높이 고정 (패딩 제거)
            <header className="h-[72px] bg-white border-b border-slate-200 sticky top-0 z-50 bg-white/80 backdrop-blur-md">
                {/* h-full로 부모 높이 꽉 채우고 flex items-center로 수직 중앙 정렬 */}
                <div className="mx-auto max-w-6xl px-6 h-full flex items-center justify-between">

                    <Link to="/" className="flex items-center gap-2 group">
                        <span className="text-2xl transition-transform group-hover:scale-110">🍀</span>
                        <h1 className="text-lg font-extrabold text-slate-800 tracking-tight">
                            My <span className="text-primary-600">Buddy</span>
                        </h1>
                    </Link>

                    <div className="flex items-center gap-3 text-sm">
                        <HeaderButton to="/auth/login" variant="outline">
                            SIGN IN
                        </HeaderButton>
                        <HeaderButton to="/auth/register" variant="solid">
                            GET STARTED
                        </HeaderButton>
                    </div>
                </div>
            </header>
        );
    }

    // --- 2) 로그인 후 헤더 (/app 내부) ---

    const myCharType = user?.characterType || "rabbit";
    const currentProfileImg = characterImages[myCharType] || characterImages.rabbit;

    const handleLogout = () => {
        if (window.confirm("정말 로그아웃 하시겠어요?")) {
            logout();
            navigate("/");
        }
    };

    return (
        // ✨ [수정] 여기도 똑같이 h-[72px]
        <header className="h-[72px] bg-white border-b border-slate-200 sticky top-0 z-50 bg-white/80 backdrop-blur-md">
            <div className="mx-auto max-w-6xl px-6 h-full flex items-center justify-between">

                <Link to="/app/home" className="flex items-center gap-2 group">
                    <span className="text-2xl transition-transform group-hover:scale-110">🍀</span>
                    <h1 className="text-lg font-extrabold text-slate-800 tracking-tight">
                        My <span className="text-primary-600">Buddy</span>
                    </h1>
                </Link>

                <nav className="hidden md:flex items-center gap-8 text-sm text-slate-700 font-medium">
                    <Link to="/app/home" className="hover:text-primary-600 transition-colors">
                        Home
                    </Link>
                    <Link to="/app/calendar" className="hover:text-primary-600 transition-colors">
                        Calendar
                    </Link>
                    <Link to="/app/report" className="hover:text-primary-600 transition-colors">
                        Report
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    <div className="relative cursor-pointer hover:opacity-80 transition hidden sm:block">
                        <span className="text-xl">🔔</span>
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                    </div>

                    <HeaderButton to="/app/chat" variant="solid">
                        Let's chat!
                    </HeaderButton>

                    {/* 프로필 호버 메뉴 */}
                    <div
                        className="relative py-2 h-full flex items-center"
                        onMouseEnter={() => setIsMenuOpen(true)}
                        onMouseLeave={() => setIsMenuOpen(false)}
                    >
                        <div className="w-9 h-9 bg-slate-50 rounded-full border border-slate-200 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary-200 transition-all overflow-hidden">
                            <img src={currentProfileImg} alt="profile" className="w-full h-full object-cover" />
                        </div>

                        {/* 드롭다운 메뉴 */}
                        {isMenuOpen && (
                            <div className="absolute right-0 top-[50px] pt-2 w-48 animate-[fade-in-up_0.2s]">
                                <div className="bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
                                        <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                                        <p className="text-sm font-bold text-slate-800 truncate">{user?.nickname}</p>
                                    </div>
                                    <div className="py-1">
                                        <Link
                                            to="/app/settings"
                                            className="block px-4 py-2 text-sm text-slate-600 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                                        >
                                            ⚙️ Settings
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                        >
                                            🚪 Logout
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
import { useState } from "react"; // ✨ useState 추가
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import HeaderButton from "./HeaderButton";
import { useAuthStore } from "../store/useAuthStore";

export default function Header() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    // ✨ 모바일 메뉴 상태 관리
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isAppRoute = location.pathname.startsWith("/app");
    const [searchParams] = useSearchParams();

    // 미니 모드일 때 헤더 숨김
    if (searchParams.get("mode") === "mini") {
        return null;
    }

    const characterImages: Record<string, string> = {
        hamster: "/characters/Hamster.png",
        fox: "/characters/Fox.png",
        panda: "/characters/Panda.png",
        cat: "/characters/Cat.png",
    };

    const getCharacterType = (seq?: number) => {
        switch (seq) {
            case 1: return "hamster";
            case 2: return "fox";
            case 3: return "panda";
            default: return "cat";
        }
    };

    // --- 1) 로그인 전 헤더 ---
    if (!isAppRoute) {
        return (
            <header className="h-[72px] bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors duration-200">
                <div className="mx-auto max-w-6xl px-6 h-full flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <h1 className="text-lg font-extrabold text-slate-800 dark:text-white tracking-tight">
                            My <span className="text-primary-600 dark:text-primary-400">Buddy</span>
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

    // --- 2) 로그인 후 헤더 ---

    const myCharType = getCharacterType(user?.characterSeq);
    const currentProfileImg = characterImages[myCharType] || characterImages.cat;

    const handleLogout = () => {
        if (window.confirm("정말 로그아웃 하시겠어요?")) {
            logout();
            navigate("/");
        }
    };

    // ✨ 모바일 메뉴 링크 클릭 시 메뉴 닫기
    const handleMobileLinkClick = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <header className="h-[72px] bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors duration-200">
            <div className="mx-auto max-w-6xl px-6 h-full flex items-center justify-between relative"> {/* relative 추가 */}

                {/* 로고 */}
                <Link to="/app/home" className="flex items-center gap-2 group">
                    <h1 className="text-lg font-extrabold text-slate-800 dark:text-white tracking-tight">
                        My <span className="text-primary-600 dark:text-primary-400">Buddy</span>
                    </h1>
                </Link>

                {/* ✨ [데스크탑] 네비게이션 (md 이상에서만 보임) */}
                <nav className="hidden md:flex items-center gap-8 text-sm text-slate-700 dark:text-slate-300 font-medium">
                    <Link to="/app/home" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                        Home
                    </Link>
                    <Link to="/app/calendar" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                        Calendar
                    </Link>
                    <Link to="/app/report" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                        Report
                    </Link>
                </nav>

                {/* 우측 버튼 영역 */}
                <div className="flex items-center gap-3">
                    {/* 대화하기 버튼 (모바일에서는 아이콘만 보이게 하거나 유지) */}
                    <div className="hidden sm:block">
                        <HeaderButton to="/app/chat" variant="solid">
                            대화하기
                        </HeaderButton>
                    </div>

                    {/* ✨ [모바일] 햄버거 버튼 (md 미만에서만 보임) */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        {isMobileMenuOpen ? (
                            // X 아이콘
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            // 햄버거 아이콘
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        )}
                    </button>

                    {/* 프로필 이미지 (항상 보임) */}
                    <div className="group relative py-2 h-full flex items-center">
                        <div className="w-9 h-9 bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary-200 dark:hover:ring-primary-900 transition-all overflow-hidden">
                            <img src={currentProfileImg} alt="profile" className="w-full h-full object-cover" />
                        </div>

                        {/* 데스크탑용 드롭다운 (모바일에서는 햄버거 메뉴가 있으므로 숨길 수도 있지만, 설정 접근을 위해 유지하거나 햄버거에 통합 가능. 여기서는 유지) */}
                        <div className="absolute right-0 top-[50px] pt-2 w-48 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 ease-out z-50">
                            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                                <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                                    <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user?.nickname}</p>
                                </div>
                                <div className="py-1">
                                    <Link to="/app/settings" className="block px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-slate-700 hover:text-primary-700 dark:hover:text-white transition-colors">
                                        ⚙️ Settings
                                    </Link>
                                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                        🚪 Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ✨ [모바일] 드롭다운 메뉴 (햄버거 클릭 시 표시) */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-[72px] left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-lg animate-slide-down">
                    <nav className="flex flex-col p-4 space-y-2">
                        <Link
                            to="/app/home"
                            onClick={handleMobileLinkClick}
                            className="px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors"
                        >
                            Home
                        </Link>
                        <Link
                            to="/app/calendar"
                            onClick={handleMobileLinkClick}
                            className="px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors"
                        >
                            Calendar
                        </Link>
                        <Link
                            to="/app/report"
                            onClick={handleMobileLinkClick}
                            className="px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors"
                        >
                            Report
                        </Link>
                        {/* 모바일 메뉴에 대화하기 버튼 추가 (화면이 작아 숨겨졌을 경우 대비) */}
                        <Link
                            to="/app/chat"
                            onClick={handleMobileLinkClick}
                            className="px-4 py-3 rounded-xl text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-slate-800 font-bold transition-colors sm:hidden"
                        >
                            💬 대화하기
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
}
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import HeaderButton from "./HeaderButton";
import { useAuthStore } from "../store/useAuthStore";

export default function Header() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

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
            // ✨ [수정] 배경색, 테두리, 텍스트 색상에 dark: 클래스 추가
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

    return (
        // ✨ [수정] 배경색, 테두리 색상 다크모드 적용
        <header className="h-[72px] bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors duration-200">
            <div className="mx-auto max-w-6xl px-6 h-full flex items-center justify-between">

                <Link to="/app/home" className="flex items-center gap-2 group">
                    <h1 className="text-lg font-extrabold text-slate-800 dark:text-white tracking-tight">
                        My <span className="text-primary-600 dark:text-primary-400">Buddy</span>
                    </h1>
                </Link>

                {/* ✨ [수정] 네비게이션 링크 텍스트 색상 (기본: slate-700 -> 다크: slate-300) */}
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

                <div className="flex items-center gap-4">
                    <HeaderButton to="/app/chat" variant="solid">
                        대화하기
                    </HeaderButton>

                    {/* 프로필 호버 메뉴 */}
                    <div className="group relative py-2 h-full flex items-center">
                        {/* ✨ [수정] 프로필 원형 배경 (bg-slate-50 -> dark:bg-slate-800) */}
                        <div className="w-9 h-9 bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary-200 dark:hover:ring-primary-900 transition-all overflow-hidden">
                            <img src={currentProfileImg} alt="profile" className="w-full h-full object-cover" />
                        </div>

                        {/* 드롭다운 메뉴 */}
                        <div className="absolute right-0 top-[50px] pt-2 w-48 
                            opacity-0 invisible translate-y-2
                            group-hover:opacity-100 group-hover:visible group-hover:translate-y-0
                            transition-all duration-200 ease-out z-50">

                            {/* ✨ [수정] 드롭다운 박스 배경 (bg-white -> dark:bg-slate-800) */}
                            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">

                                {/* 상단 유저 정보 영역 */}
                                <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                                    <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user?.nickname}</p>
                                </div>

                                <div className="py-1">
                                    <Link
                                        to="/app/settings"
                                        // ✨ [수정] 메뉴 아이템 호버 효과 (다크모드 시 배경색 변경)
                                        className="block px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-slate-700 hover:text-primary-700 dark:hover:text-white transition-colors"
                                    >
                                        ⚙️ Settings
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        🚪 Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
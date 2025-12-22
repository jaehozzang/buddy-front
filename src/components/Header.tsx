import { Link, useLocation } from "react-router-dom";
import HeaderButton from "./HeaderButton";

export default function Header() {
    const location = useLocation();
    const isAppRoute = location.pathname.startsWith("/app");

    // 1) 로그인 전/인트로 헤더 (변경 없음)
    if (!isAppRoute) {
        return (
            <header className="bg-white border-b border-slate-200">
                <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="h-7 w-7 border border-slate-400 rounded-sm flex items-center justify-center text-[10px] font-semibold text-slate-500">
                            Bd
                        </div>
                        <div className="flex flex-col leading-tight">
                            <span className="text-sm font-semibold">Buddy</span>
                            <span className="text-[11px] text-slate-400">Chat&Diary</span>
                        </div>
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

    // 2) /app 안에서 쓸 상단 네비 (로그인 후)
    return (
        <header className="bg-white border-b border-slate-200">
            <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
                {/* 로고 (누르면 홈으로) */}
                <Link to="/app/home" className="flex items-center gap-2">
                    <div className="h-7 w-7 border border-slate-400 rounded-sm flex items-center justify-center text-[10px] font-semibold text-slate-500">
                        Bd
                    </div>
                    <div className="flex flex-col leading-tight">
                        <span className="text-sm font-semibold">Buddy</span>
                        <span className="text-[11px] text-slate-400">Chat&Diary</span>
                    </div>
                </Link>

                {/* 가운데 메뉴 */}
                <nav className="flex items-center gap-8 text-sm text-slate-700 font-medium">
                    <Link to="/app/home" className="hover:text-primary-600 transition-colors">
                        Home
                    </Link>
                    <Link to="/app/calendar" className="hover:text-primary-600 transition-colors">
                        Calendar
                    </Link>
                    <Link to="/app/report" className="hover:text-primary-600 transition-colors">
                        Report
                    </Link>

                    {/* ✨ [수정] Market -> Settings 로 변경 */}
                    <Link to="/app/settings" className="hover:text-primary-600 transition-colors">
                        Settings
                    </Link>
                </nav>

                {/* 오른쪽 아이콘/버튼 */}
                <div className="flex items-center gap-4">
                    {/* 알림 아이콘 (임시 기능) */}
                    <div className="relative cursor-pointer hover:opacity-80 transition">
                        <span className="text-xl">🔔</span>
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                    </div>

                    {/* 채팅하러 가기 버튼 */}
                    <HeaderButton to="/app/home" variant="solid">
                        Let's chat!
                    </HeaderButton>

                    {/* ✨ [수정] 프로필 아이콘을 누르면 '설정 페이지'로 이동하게 Link로 감쌌습니다 */}
                    <Link
                        to="/app/settings"
                        className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition"
                    >
                        👤
                    </Link>
                </div>
            </div>
        </header>
    );
}
import { useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";

import Header from "./components/Header";

import IntroPage from "./pages/IntroPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RegisterNicknamePage from "./pages/RegisterNicknamePage";
import CharacterSelectPage from "./pages/CharacterSelectPage";
import OAuthCallback from "./pages/OAuthCallback";

import HomePage from "./pages/HomePage";
import ChatPage from "./pages/ChatPage";
import VoiceChatPage from "./pages/VoiceChatPage";
import CalendarPage from "./pages/CalendarPage";
import SettingsPage from "./pages/SettingsPage";
import MainLayout from "./MainLayout";
import ReportPage from "./pages/ReportPage";

function App() {
  const location = useLocation();
  const isAppRoute = location.pathname.startsWith("/app");

  // ✨ [핵심 수정] getState() 대신 훅을 사용해 상태 변경을 실시간 구독(Subscribe)합니다.
  const { isLoggedIn, user } = useAuthStore((state) => ({
    isLoggedIn: state.isLoggedIn,
    user: state.user,
  }));

  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    const root = window.document.documentElement;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      root.classList.remove("dark");
      if (theme === "dark") {
        root.classList.add("dark");
      } else if (theme === "system" && systemPrefersDark.matches) {
        root.classList.add("dark");
      }
    };

    applyTheme();

    if (theme === "system") {
      systemPrefersDark.addEventListener("change", applyTheme);
      return () => systemPrefersDark.removeEventListener("change", applyTheme);
    }
  }, [theme]);

  // 캐릭터 유효성 검사 (1, 2, 3 중 하나인지)
  const hasValidCharacter = user?.characterSeq && [1, 2, 3].includes(user.characterSeq);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Header />

      <main className={`flex-1 ${isAppRoute ? "" : "px-6 py-10"}`}>
        <Routes>
          {/* 로그인 전 페이지들 */}
          <Route
            path="/"
            element={isLoggedIn ? <Navigate to="/app" replace /> : <IntroPage />}
          />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route
            path="/auth/register/nickname"
            element={<RegisterNicknamePage />}
          />
          <Route
            path="/auth/register/character"
            element={<CharacterSelectPage />}
          />

          {/* 소셜 로그인 콜백 처리 경로 */}
          <Route path="/auth/callback" element={<OAuthCallback />} />

          {/* 로그인 후 영역 (Buddy 서비스 메인 영역) */}
          <Route
            path="/app"
            element={
              isLoggedIn ? (
                // ✨ 수정됨: user 상태가 바뀌면 즉시 화면이 갱신되어 올바른 곳으로 보냅니다.
                hasValidCharacter ? (
                  <MainLayout />
                ) : (
                  // 캐릭터가 없으면 캐릭터 선택 페이지로 이동 (닉네임 페이지 아님!)
                  <Navigate to="/auth/register/character" replace />
                )
              ) : (
                <Navigate to="/auth/login" replace />
              )
            }
          >
            <Route index element={<HomePage />} />
            <Route path="home" element={<HomePage />} />

            <Route path="chat" element={<ChatPage />} />
            <Route path="voice-chat" element={<VoiceChatPage />} />

            <Route path="calendar" element={<CalendarPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="report" element={<ReportPage />} />
          </Route>

          {/* 그 외 모든 경로는 메인으로 리다이렉트 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
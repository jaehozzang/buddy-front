// src/App.tsx
import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { useAuthStore } from "./store/useAuthStore";

import Header from "./components/Header";

import IntroPage from "./pages/IntroPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RegisterNicknamePage from "./pages/RegisterNicknamePage";
import CharacterSelectPage from "./pages/CharacterSelectPage";

import HomePage from "./pages/HomePage";
import ChatPage from "./pages/ChatPage";
import CalendarPage from "./pages/CalendarPage";
import DiaryPage from "./pages/DiaryPage";
import SettingsPage from "./pages/SettingsPage";
import MainLayout from "./MainLayout";
import ReportPage from "./pages/ReportPage";
import DiaryViewPage from "./pages/DiaryViewPage";

function App() {
  const location = useLocation();
  const isAppRoute = location.pathname.startsWith("/app");
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      {/* 상단 공통 헤더 */}
      <Header />

      {/* 아래 내용 부분 */}
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

          {/* 로그인 후 영역 */}
          <Route
            path="/app"
            element={
              isLoggedIn ? (
                <MainLayout />
              ) : (
                <Navigate to="/auth/login" replace />
              )
            }
          >
            <Route index element={<HomePage />} />
            <Route path="home" element={<HomePage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            {/* 👇 [수정 2] 일기 관련 라우팅 변경 👇 */}
            {/* 1. 일기 쓰기 (새 글) */}
            <Route path="diary/new" element={<DiaryPage mode="create" />} />
            {/* 2. 일기 읽기 (뷰어 페이지) -> 여기로 먼저 연결됨! */}
            <Route path="diary/:id" element={<DiaryViewPage />} />
            {/* 3. 일기 수정 (수정 페이지) -> /edit을 붙여서 구분 */}
            <Route path="diary/:id/edit" element={<DiaryPage mode="edit" />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="report" element={<ReportPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
// src/App.tsx
import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Header from "./components/Header";

import IntroPage from "./pages/IntroPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RegisterNicknamePage from "./pages/RegisterNicknamePage";
import CharacterSelectPage from "./pages/CharacterSelectPage";

import HomePage from "./pages/HomePage";
import CalendarPage from "./pages/CalendarPage";
import DiaryPage from "./pages/DiaryPage";
import SettingsPage from "./pages/SettingsPage";
import MainLayout from "./MainLayout";
import ReportPage from "./pages/ReportPage";

function App() {
  const location = useLocation();
  const isAppRoute = location.pathname.startsWith("/app");
  const isLoggedIn = true; // TODO: 진짜 로그인 상태로 교체

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      {/* 상단 공통 헤더 */}
      <Header />

      {/* 아래 내용 부분 */}
      <main className={`flex-1 ${isAppRoute ? "" : "px-6 py-10"}`}>
        <Routes>
          {/* 로그인 전 페이지들 */}
          <Route path="/" element={<IntroPage />} />
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
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="diary/new" element={<DiaryPage mode="create" />} />
            <Route path="diary/:id" element={<DiaryPage mode="edit" />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="report" element={<ReportPage />} />
          </Route>

          {/* 나머지 다 인트로로 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

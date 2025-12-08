import { Routes, Route, Link } from "react-router-dom";
import IntroPage from "./pages/IntroPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import RegisterNicknamePage from "./pages/RegisterNicknamePage";
import CharacterSelectPage from "./pages/CharacterSelectPage";

function App() {
  return (
    <div className="min-h-screen text-slate-900">
      {/* 상단 헤더 */}
      <header className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          {/* 왼쪽 로고 영역 */}
          <Link to="/" className="flex items-center gap-2">
            {/* 로고 아이콘 박스 (간단한 사각형) */}
            <div className="h-7 w-7 border border-slate-400 rounded-sm flex items-center justify-center text-[10px] font-semibold text-slate-500">
              UX
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">Buddy</span>
              <span className="text-[11px] text-slate-400">
                Chat&Diary
              </span>
            </div>
          </Link>

          {/* 오른쪽 버튼들 */}
          <div className="flex items-center gap-3 text-sm">
            {/* SIGN IN — 아웃라인 버튼 (primary 테두리) */}
            <Link
              to="/auth/login"
              className="px-4 py-2 border border-primary-400 text-primary-600 
             rounded-md hover:bg-primary-50 transition"
            >
              SIGN IN
            </Link>

            {/* GET STARTED — 채워진 primary 버튼 */}
            <Link
              to="/auth/register"
              className="px-4 py-2 bg-primary-600 text-white rounded-md 
             hover:bg-primary-700 transition"
            >
              GET STARTED
            </Link>

          </div>
        </div>
      </header>

      {/* 페이지 내용 영역 */}
      <main className="px-6 py-10 ">
        <Routes>
          <Route path="/" element={<IntroPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/auth/register/nickname" element={<RegisterNicknamePage />} />
          <Route path="/auth/register/character" element={<CharacterSelectPage />} />


        </Routes>
      </main>
    </div>
  );
}

export default App;

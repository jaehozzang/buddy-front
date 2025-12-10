import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-150px)] flex justify-center items-center bg-white">

      {/* 로그인 카드 */}
      <div className="rounded-2xl border border-primary-200 shadow-md bg-white px-10 py-10 w-[380px]">

        {/* 로그인 폼 */}
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            // TODO: 여기서 실제 로그인 검증(API) 한 다음 성공하면 아래로 이동
            navigate("/app"); // 또는 "/app/home"
          }}
        >

          {/* ID 입력 */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500 text-sm">👤</span>
            <input
              type="text"
              placeholder="ID"
              className="w-full rounded-md bg-white border border-primary-200 px-10 py-3 
              text-sm text-slate-700 focus:outline-none focus:border-primary-400"
            />
          </div>

          {/* PASSWORD 입력 */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500 text-sm">🔒</span>

            <input
              type={showPassword ? "text" : "password"}
              placeholder="PASSWORD"
              className="w-full rounded-md bg-white border border-primary-200 px-10 py-3
              text-sm text-slate-700 focus:outline-none focus:border-primary-400"
            />

            {/* 눈 아이콘 버튼 */}
            <button
              type="button"
              onClick={() => setShowPassword(prev => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 cursor-pointer"
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>

          {/* LOGIN 버튼 */}
          <button
            type="submit"
            className="mt-2 w-full rounded-md bg-primary-600 py-3 text-sm font-medium text-white
            tracking-[0.08em] shadow-md shadow-primary-300/40 hover:bg-primary-700 transition"
          >
            LOGIN
          </button>
        </form>

        {/* 구분선 */}
        <div className="mt-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-primary-100" />
          <div className="h-px flex-1 bg-primary-100" />
        </div>

        {/* OAuth 버튼 (아이콘 버전) */}
        <div className="mt-6 flex justify-center gap-4">

          {/* Google */}
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-primary-50 transition shadow-sm">
            <img src="/oauth/google_circle.svg" alt="google" className="w-8 h-8" />
          </button>

          {/* Kakao */}
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-primary-50 transition shadow-sm">
            <img src="/oauth/kakao.svg" alt="kakao" className="w-8 h-8" />
          </button>

          {/* Naver */}
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-primary-50 transition shadow-sm">
            <img src="/oauth/naver.svg" alt="naver" className="w-8 h-8" />
          </button>

        </div>



      </div>
    </div>
  );
}

export default LoginPage;

import { useState } from "react";
import { useNavigate } from "react-router-dom";


function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-150px)] flex justify-center items-center bg-white">
      {/* 회원가입 카드 - 로그인과 동일 스타일 */}
      <div className="rounded-2xl border border-primary-200 shadow-md bg-white px-10 py-10 w-[380px]">

        {/* 회원가입 폼 */}
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            navigate("/auth/register/nickname");
          }}

        >
          {/* ID 입력 (로그인과 동일 스타일) */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500 text-sm">
              👤
            </span>
            <input
              type="text"
              placeholder="ID"
              className="w-full rounded-md bg-white border border-primary-200 px-10 py-3 
              text-sm text-slate-700 focus:outline-none focus:border-primary-400"
            />
          </div>

          {/* PASSWORD 입력 */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500 text-sm">
              🔒
            </span>

            <input
              type={showPassword ? "text" : "password"}
              placeholder="PASSWORD"
              className="w-full rounded-md bg-white border border-primary-200 px-10 py-3
              text-sm text-slate-700 focus:outline-none focus:border-primary-400"
            />

            {/* 눈 아이콘 버튼 */}
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 cursor-pointer"
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>

          {/* PASSWORD CONFIRM 입력 */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500 text-sm">
              🔒
            </span>

            <input
              type={showPasswordConfirm ? "text" : "password"}
              placeholder="PASSWORD CONFIRM"
              className="w-full rounded-md bg-white border border-primary-200 px-10 py-3
              text-sm text-slate-700 focus:outline-none focus:border-primary-400"
            />

            {/* 눈 아이콘 버튼 */}
            <button
              type="button"
              onClick={() => setShowPasswordConfirm((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 cursor-pointer"
            >
              {showPasswordConfirm ? "🙈" : "👁"}
            </button>
          </div>

          {/* NEXT 버튼 (와이어프레임 기준) */}
          <button
            type="submit"
            className="mt-2 w-full rounded-md bg-primary-600 py-3 text-sm font-medium text-white
            tracking-[0.08em] shadow-md shadow-primary-300/40 hover:bg-primary-700 transition"
          >
            NEXT
          </button>
        </form>

        {/* 구분선 */}
        <div className="mt-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-primary-100" />
          <div className="h-px flex-1 bg-primary-100" />
        </div>

        {/* OAuth 버튼 (로그인과 동일 스타일) */}
        <div className="mt-4 flex flex-col gap-2 text-sm tracking-[0.08em]">
          <button className="w-full rounded-md border border-primary-200 bg-white py-2 px-4 text-left hover:bg-primary-50 transition">
            OAUTH(GOOGLE)
          </button>
          <button className="w-full rounded-md border border-primary-200 bg-white py-2 px-4 text-left hover:bg-primary-50 transition">
            OAUTH(KAKAO)
          </button>
          <button className="w-full rounded-md border border-primary-200 bg-white py-2 px-4 text-left hover:bg-primary-50 transition">
            OAUTH(NAVER)
          </button>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Link 추가
import SocialLoginSection from "../components/SocialLoginSection";

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const navigate = useNavigate();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    if (!email.includes("@")) {
      alert("올바른 이메일 형식이 아닙니다.");
      return;
    }

    if (password !== passwordConfirm) {
      alert("비밀번호가 일치하지 않습니다!");
      return;
    }

    navigate("/auth/register/nickname", {
      state: { email, password }
    });
  };

  return (
    <div className="min-h-[calc(100vh-150px)] flex justify-center items-center bg-white">
      <div className="rounded-2xl border border-primary-200 shadow-md bg-white px-10 py-10 w-[380px]">

        <form className="flex flex-col gap-4" onSubmit={handleNext}>
          {/* EMAIL */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500 text-sm">👤</span>
            <input
              type="text"
              placeholder="EMAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md bg-white border border-primary-200 px-10 py-3 
              text-sm text-slate-700 focus:outline-none focus:border-primary-400"
            />
          </div>

          {/* PASSWORD */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500 text-sm">🔒</span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md bg-white border border-primary-200 px-10 py-3
              text-sm text-slate-700 focus:outline-none focus:border-primary-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 cursor-pointer"
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>

          {/* PASSWORD CONFIRM */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500 text-sm">🔒</span>
            <input
              type={showPasswordConfirm ? "text" : "password"}
              placeholder="PASSWORD CONFIRM"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="w-full rounded-md bg-white border border-primary-200 px-10 py-3
              text-sm text-slate-700 focus:outline-none focus:border-primary-400"
            />
            <button
              type="button"
              onClick={() => setShowPasswordConfirm((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 cursor-pointer"
            >
              {showPasswordConfirm ? "🙈" : "👁"}
            </button>
          </div>

          <button
            type="submit"
            className="mt-2 w-full rounded-md bg-primary-600 py-3 text-sm font-medium text-white
            tracking-[0.08em] shadow-md shadow-primary-300/40 hover:bg-primary-700 transition"
          >
            NEXT
          </button>
        </form>

        {/* 👇 구분선 코드를 지우고 컴포넌트만 남김 (컴포넌트 안에 구분선이 있다고 가정) */}
        <SocialLoginSection />

        {/* 👇 [추가 팁] 로그인 페이지로 돌아가는 링크 */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400">
            이미 계정이 있으신가요?{" "}
            <Link to="/auth/login" className="text-primary-600 font-medium hover:underline">
              로그인하기
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default RegisterPage;
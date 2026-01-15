import { useState } from "react";
import { useNavigate } from "react-router-dom";

function RegisterPage() {
  const [email, setEmail] = useState(""); // userId -> email
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
    
    // 간단한 이메일 형식 체크 (선택사항)
    if (!email.includes("@")) {
      alert("올바른 이메일 형식이 아닙니다.");
      return;
    }

    if (password !== passwordConfirm) {
      alert("비밀번호가 일치하지 않습니다!");
      return;
    }

    // ★ 중요: 다음 페이지(닉네임/캐릭터 선택)로 입력한 이메일/비번을 전달합니다.
    navigate("/auth/register/nickname", {
      state: {
        email: email,     // 다음 페이지에서 useLocation().state.email 로 받음
        password: password
      }
    });
  };

  return (
    <div className="min-h-[calc(100vh-150px)] flex justify-center items-center bg-white">
      <div className="rounded-2xl border border-primary-200 shadow-md bg-white px-10 py-10 w-[380px]">
        
        <form className="flex flex-col gap-4" onSubmit={handleNext}>
          {/* EMAIL 입력 (ID -> EMAIL) */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500 text-sm">👤</span>
            <input
              type="text" // or email
              placeholder="EMAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md bg-white border border-primary-200 px-10 py-3 
              text-sm text-slate-700 focus:outline-none focus:border-primary-400"
            />
          </div>

          {/* PASSWORD 입력 (동일) */}
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

           {/* PASSWORD CONFIRM (동일) */}
          <div className="relative">
             {/* ... (생략: 기존 코드와 동일) ... */}
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500 text-sm">🔒</span>
            <input
              type={showPasswordConfirm ? "text" : "password"}
              placeholder="PASSWORD CONFIRM"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="w-full rounded-md bg-white border border-primary-200 px-10 py-3
              text-sm text-slate-700 focus:outline-none focus:border-primary-400"
            />
             {/* ... 버튼 ... */}
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

        <div className="mt-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-primary-100" />
          <div className="h-px flex-1 bg-primary-100" />
        </div>

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
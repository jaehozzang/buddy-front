import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import SocialLoginSection from "../components/SocialLoginSection";

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const navigate = useNavigate();

  // ✨ 유효성 상태 확인
  // 비밀번호 입력 중인데 8~20자가 아닐 때 (안내 문구만 띄움)
  const isPasswordInvalid = password.length > 0 && (password.length < 8 || password.length > 20);
  // 비밀번호 확인이 다를 때 (이건 기존처럼 빨갛게 에러 표시)
  const isPasswordMismatch = passwordConfirm.length > 0 && password !== passwordConfirm;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) { alert("이메일과 비밀번호를 입력해주세요."); return; }
    if (!email.includes("@")) { alert("올바른 이메일 형식이 아닙니다."); return; }
    if (password.length < 8 || password.length > 20) { alert("비밀번호는 8자 이상 20자 이하로 설정해주세요."); return; }
    if (password !== passwordConfirm) { alert("비밀번호가 일치하지 않습니다!"); return; }
    navigate("/auth/register/nickname", { state: { email, password } });
  };

  return (
    <div className="min-h-[calc(100vh-150px)] flex justify-center items-center bg-white">
      <div className="rounded-2xl border border-primary-200 shadow-md bg-white px-10 py-10 w-[380px]">

        <form className="flex flex-col gap-4" onSubmit={handleNext}>

          {/* 1. EMAIL */}
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 z-10">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </span>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="peer w-full rounded-md bg-white border border-primary-200 px-8 py-3 
              text-sm text-slate-700 focus:outline-none focus:border-primary-400 placeholder-transparent"
              placeholder=" "
            />
            <label
              htmlFor="email"
              className="absolute left-8 top-3 text-sm text-slate-400 transition-all cursor-text bg-white px-1
              peer-focus:-top-2 peer-focus:left-5 peer-focus:text-xs peer-focus:text-primary-600 peer-focus:font-bold
              peer-placeholder-shown:top-3 peer-placeholder-shown:left-8 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400
              peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-primary-600 peer-[:not(:placeholder-shown)]:font-bold"
            >
              이메일
            </label>
          </div>

          {/* ✨ 2. PASSWORD (입력창 색상은 정상 유지, 아래 안내문구만 회색으로 추가) */}
          <div className="flex flex-col gap-1">
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                maxLength={20}
                onChange={(e) => setPassword(e.target.value)}
                className="peer w-full rounded-md bg-white border border-primary-200 px-8 py-3 text-sm text-slate-700 focus:outline-none focus:border-primary-400 placeholder-transparent"
                placeholder=" "
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer z-10 text-slate-400 hover:text-primary-600 transition-colors"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                )}
              </button>

              <label
                htmlFor="password"
                className="absolute left-8 top-3 text-sm text-slate-400 transition-all cursor-text bg-white px-1
                  peer-focus:-top-2 peer-focus:left-5 peer-focus:text-xs peer-focus:text-primary-600 peer-focus:font-bold
                  peer-placeholder-shown:top-3 peer-placeholder-shown:left-8 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400
                  peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-primary-600 peer-[:not(:placeholder-shown)]:font-bold"
              >
                비밀번호
              </label>
            </div>
            {/* ✨ 안내 메시지 (자연스러운 회색 적용) */}
            {isPasswordInvalid && (
              <p className="text-xs text-slate-500 ml-2 font-medium">
                비밀번호는 8자 이상, 20자 이하로 설정해주세요.
              </p>
            )}
          </div>

          {/* 3. PASSWORD CONFIRM (여기는 다르면 확실하게 빨간색으로 경고!) */}
          <div className="flex flex-col gap-1">
            <div className="relative">
              <span className={`absolute left-2.5 top-1/2 -translate-y-1/2 z-10 ${isPasswordMismatch ? "text-red-500" : "text-slate-400"}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </span>
              <input
                type={showPasswordConfirm ? "text" : "password"}
                id="passwordConfirm"
                value={passwordConfirm}
                maxLength={20}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className={`peer w-full rounded-md bg-white px-8 py-3 text-sm text-slate-700 focus:outline-none placeholder-transparent border
                  ${isPasswordMismatch
                    ? "border-red-500 focus:border-red-500"
                    : "border-primary-200 focus:border-primary-400"
                  }`}
                placeholder=" "
              />

              <button
                type="button"
                onClick={() => setShowPasswordConfirm((prev) => !prev)}
                className={`absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer z-10 transition-colors ${isPasswordMismatch ? "text-red-500" : "text-slate-400 hover:text-primary-600"}`}
              >
                {showPasswordConfirm ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                )}
              </button>

              <label
                htmlFor="passwordConfirm"
                className={`absolute left-8 top-3 text-sm transition-all cursor-text bg-white px-1
                  peer-focus:-top-2 peer-focus:left-5 peer-focus:text-xs peer-focus:font-bold
                  peer-placeholder-shown:top-3 peer-placeholder-shown:left-8 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400
                  peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-bold
                  ${isPasswordMismatch
                    ? "text-red-500 peer-focus:text-red-500 peer-[:not(:placeholder-shown)]:text-red-500"
                    : "text-slate-400 peer-focus:text-primary-600 peer-[:not(:placeholder-shown)]:text-primary-600"
                  }`}
              >
                비밀번호 확인
              </label>
            </div>

            {isPasswordMismatch && (
              <p className="text-xs text-red-500 ml-2 font-medium">
                비밀번호가 일치하지 않습니다.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="mt-2 w-full rounded-md bg-primary-600 py-3 text-sm font-medium text-white
            tracking-[0.08em] shadow-md shadow-primary-300/40 hover:bg-primary-700 transition"
          >
            NEXT
          </button>
        </form>

        <SocialLoginSection />

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
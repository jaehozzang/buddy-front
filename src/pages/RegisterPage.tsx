import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import SocialLoginSection from "../components/SocialLoginSection";
import { authService } from "../api/authApi"; // ✨ API 불러오기

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // ✨ 이메일 인증 관련 상태
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3분
  const [emailMessage, setEmailMessage] = useState({ text: "", isError: false });

  const navigate = useNavigate();

  // 유효성 상태 확인
  const isPasswordInvalid = password.length > 0 && (password.length < 8 || password.length > 20);
  const isPasswordMismatch = passwordConfirm.length > 0 && password !== passwordConfirm;

  // ⏳ 타이머 로직
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isCodeSent && !isEmailVerified && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setEmailMessage({ text: "인증 시간이 만료되었습니다.", isError: true });
      setIsCodeSent(false);
    }
    return () => clearInterval(timer);
  }, [isCodeSent, isEmailVerified, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // 🚀 1. 인증번호 전송
  const handleSendCode = async () => {
    if (!email.trim() || !email.includes("@")) {
      setEmailMessage({ text: "올바른 이메일 형식을 입력해주세요.", isError: true });
      return;
    }
    try {
      setEmailMessage({ text: "인증번호를 전송 중입니다...", isError: false });
      await authService.sendSignupEmail({ email });
      setIsCodeSent(true);
      setTimeLeft(180);
      setEmailMessage({ text: "이메일로 인증번호가 전송되었습니다.", isError: false });
    } catch (error: any) {
      setEmailMessage({ text: error.response?.data?.message || "전송에 실패했습니다.", isError: true });
    }
  };

  // 🚀 2. 인증번호 확인
  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setEmailMessage({ text: "인증번호를 입력해주세요.", isError: true });
      return;
    }
    try {
      const response = await authService.verifySignupEmail({ email, code: verificationCode });
      if (response.result === true) {
        setIsEmailVerified(true);
        setEmailMessage({ text: "이메일 인증이 완료되었습니다! ✅", isError: false });
      } else {
        setEmailMessage({ text: "인증번호가 일치하지 않습니다.", isError: true });
      }
    } catch (error: any) {
      setEmailMessage({ text: error.response?.data?.message || "잘못된 인증번호입니다.", isError: true });
    }
  };

  // 🚀 3. 다음 단계 이동
  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailVerified) {
      alert("먼저 이메일 인증을 완료해주세요.");
      return;
    }
    if (password.length < 8 || password.length > 20) {
      alert("비밀번호는 8자 이상 20자 이하로 설정해주세요.");
      return;
    }
    if (password !== passwordConfirm) {
      alert("비밀번호가 일치하지 않습니다!");
      return;
    }
    navigate("/auth/register/nickname", { state: { email, password } });
  };

  return (
    <div className="min-h-[calc(100vh-150px)] flex justify-center items-center bg-white">
      <div className="rounded-2xl border border-primary-200 shadow-md bg-white px-10 py-10 w-[380px]">

        <form className="flex flex-col gap-4" onSubmit={handleNext}>

          {/* 1. EMAIL & 인증받기 버튼 */}
          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </span>
                <input
                  type="text"
                  id="email"
                  disabled={isEmailVerified}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="peer w-full rounded-md bg-white border border-primary-200 px-8 py-3 
                  text-sm text-slate-700 focus:outline-none focus:border-primary-400 placeholder-transparent disabled:bg-slate-50 disabled:text-slate-400"
                  placeholder=" "
                />
                <label
                  htmlFor="email"
                  className="absolute left-8 top-3 text-sm text-slate-400 transition-all cursor-text bg-transparent px-1
                  peer-focus:-top-2 peer-focus:left-5 peer-focus:text-xs peer-focus:text-primary-600 peer-focus:font-bold peer-focus:bg-white
                  peer-placeholder-shown:top-3 peer-placeholder-shown:left-8 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400
                  peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-primary-600 peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:bg-white"
                >
                  이메일
                </label>
              </div>
              <button
                type="button"
                onClick={handleSendCode}
                disabled={isEmailVerified || !email}
                className="whitespace-nowrap px-3 py-3 rounded-md border border-primary-600 bg-primary-50 text-primary-600 text-xs font-bold hover:bg-primary-100 transition-colors disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
              >
                {isCodeSent ? "재전송" : "인증받기"}
              </button>
            </div>
            {/* 이메일 관련 메시지 출력 */}
            {emailMessage.text && (
              <p className={`text-xs font-medium ml-1 ${emailMessage.isError ? "text-red-500" : "text-primary-600"}`}>
                {emailMessage.text}
              </p>
            )}
          </div>

          {/* ✨ 1-5. 인증번호 입력창 (발송 후에만 나타남) */}
          {isCodeSent && !isEmailVerified && (
            <div className="flex gap-2 animate-[fade-in-down_0.3s]">
              <div className="relative flex-1">
                <input
                  type="text"
                  id="verificationCode"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="peer w-full rounded-md bg-white border border-primary-200 pl-4 pr-12 py-3 
                  text-sm text-slate-700 focus:outline-none focus:border-primary-400 placeholder-transparent"
                  placeholder=" "
                />
                <label
                  htmlFor="verificationCode"
                  className="absolute left-4 top-3 text-sm text-slate-400 transition-all cursor-text bg-transparent px-1
                  peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:text-primary-600 peer-focus:font-bold peer-focus:bg-white
                  peer-placeholder-shown:top-3 peer-placeholder-shown:left-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400
                  peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-primary-600 peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:bg-white"
                >
                  인증번호
                </label>
                {/* 타이머 표시 */}
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-red-500">
                  {formatTime(timeLeft)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleVerifyCode}
                className="whitespace-nowrap px-4 py-3 rounded-md border border-primary-600 bg-primary-50 text-primary-600 text-xs font-bold hover:bg-primary-100 transition-colors"
              >
                확인
              </button>
            </div>
          )}

          {/* 2. PASSWORD */}
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
                className="absolute left-8 top-3 text-sm text-slate-400 transition-all cursor-text bg-transparent px-1
                  peer-focus:-top-2 peer-focus:left-5 peer-focus:text-xs peer-focus:text-primary-600 peer-focus:font-bold peer-focus:bg-white
                  peer-placeholder-shown:top-3 peer-placeholder-shown:left-8 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400
                  peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-primary-600 peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:bg-white"
              >
                비밀번호
              </label>
            </div>
            {isPasswordInvalid && (
              <p className="text-xs text-slate-500 ml-2 font-medium">
                비밀번호는 8자 이상, 20자 이하로 설정해주세요.
              </p>
            )}
          </div>

          {/* 3. PASSWORD CONFIRM */}
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
                  ${isPasswordMismatch ? "border-red-500 focus:border-red-500" : "border-primary-200 focus:border-primary-400"}`}
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
                className={`absolute left-8 top-3 text-sm transition-all cursor-text bg-transparent px-1
                  peer-focus:-top-2 peer-focus:left-5 peer-focus:text-xs peer-focus:font-bold peer-focus:bg-white
                  peer-placeholder-shown:top-3 peer-placeholder-shown:left-8 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400
                  peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:bg-white
                  ${isPasswordMismatch ? "text-red-500 peer-focus:text-red-500 peer-[:not(:placeholder-shown)]:text-red-500" : "text-slate-400 peer-focus:text-primary-600 peer-[:not(:placeholder-shown)]:text-primary-600"}`}
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
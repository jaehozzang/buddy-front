import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

function LoginPage() {
  const navigate = useNavigate();

  // 1. registeredUser(DB)와 login 함수 가져오기
  const { registeredUser, login } = useAuthStore();

  const [inputId, setInputId] = useState("");
  const [inputPw, setInputPw] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // 2. 회원가입된 정보가 없는 경우
    if (!registeredUser) {
      alert("일치하는 회원 정보가 없습니다. 회원가입을 먼저 해주세요!");
      return;
    }

    // 3. 아이디 & 비밀번호 일치 여부 확인
    if (registeredUser.id === inputId && registeredUser.password === inputPw) {
      // 성공: DB에 있는 정보를 복사해서 현재 유저(user)로 설정
      login(registeredUser);
      alert(`${registeredUser.nickname}님 환영합니다!`);
      navigate("/app/home");
    } else {
      // 실패
      alert("아이디 또는 비밀번호가 일치하지 않습니다.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-150px)] flex justify-center items-center bg-white">
      <div className="rounded-2xl border border-primary-200 shadow-md bg-white px-10 py-10 w-[380px]">

        <form className="flex flex-col gap-4" onSubmit={handleLogin}>
          {/* ID 입력 */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500 text-sm">👤</span>
            <input
              type="text"
              placeholder="ID"
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
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
              value={inputPw}
              onChange={(e) => setInputPw(e.target.value)}
              className="w-full rounded-md bg-white border border-primary-200 px-10 py-3
              text-sm text-slate-700 focus:outline-none focus:border-primary-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(prev => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 cursor-pointer"
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>

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

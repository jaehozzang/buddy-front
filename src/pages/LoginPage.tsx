import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { authService } from "../api/authApi";
import { AxiosError } from "axios";
import { IS_TEST_MODE } from "../config";
import SocialLoginSection from "../components/SocialLoginSection";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      alert("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    try {
      if (IS_TEST_MODE) {
        console.log("🛠️ [TEST MODE] 로그인 시도...", email);
        await new Promise(resolve => setTimeout(resolve, 1000));

        const fakeResponse = {
          accessToken: "fake-jwt-token",
          refreshToken: "fake-refresh-token",
          member: {
            memberSeq: 1,
            email: email,
            nickname: "테스트유저",
            characterSeq: 1,
            characterNickname: "Hamster",
            avatarUrl: ""
          }
        };

        login(fakeResponse);
        alert(`[TEST] ${fakeResponse.member.nickname}님 환영합니다!`);
        navigate("/app/home");

      } else {
        const response = await authService.login({ email, password });

        if (response.code === "S000") {
          login(response.result);
          alert(`${response.result.member.nickname}님 환영합니다!`);
          navigate("/app/home");
        } else {
          alert(`로그인 실패: ${response.message}`);
        }
      }

    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const errorMsg = err.response?.data?.message || "로그인에 실패했습니다.";
      alert(errorMsg);
    }
  };

  return (
    <div className="min-h-[calc(100vh-150px)] flex justify-center items-center bg-white">
      <div className="rounded-2xl border border-primary-200 shadow-md bg-white px-10 py-10 w-[380px]">

        <form className="flex flex-col gap-4" onSubmit={handleLogin}>

          {/* 1. 이메일 입력 */}
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 z-10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
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

          {/* 2. 비밀번호 입력 */}
          <div className="relative">
            {/* ✨ [수정] 자물쇠 아이콘 SVG 교체 */}
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 z-10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </span>

            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="peer w-full rounded-md bg-white border border-primary-200 px-8 py-3
              text-sm text-slate-700 focus:outline-none focus:border-primary-400 placeholder-transparent"
              placeholder=" "
            />

            {/* ✨ [수정] 눈(Show/Hide) 아이콘 SVG 교체 */}
            <button
              type="button"
              onClick={() => setShowPassword(prev => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer z-10 hover:text-primary-600 transition-colors"
            >
              {showPassword ? (
                // 👁️ 보이는 상태 (Open Eye)
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              ) : (
                // 🙈 안 보이는 상태 (Slash Eye)
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
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

          <button
            type="submit"
            className="mt-2 w-full rounded-md bg-primary-600 py-3 text-sm font-medium text-white
            tracking-[0.08em] shadow-md shadow-primary-300/40 hover:bg-primary-700 transition"
          >
            LOGIN
          </button>
        </form>

        <SocialLoginSection />

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400">
            아직 계정이 없으신가요?{" "}
            <Link to="/auth/register" className="text-primary-600 font-medium hover:underline">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
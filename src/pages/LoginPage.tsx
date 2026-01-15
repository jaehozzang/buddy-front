import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
// ✨ [수정 1] authApi -> authService로 이름 변경해서 가져오기
import { authService } from "../api/authApi";
import { AxiosError } from "axios";
import { IS_TEST_MODE } from "../config";

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
        // ... (테스트 모드 코드는 그대로)
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
        // 🚀 [REAL SERVER]
        // ✨ [수정 2] authApi.login -> authService.login 으로 변경
        // 이제 publicApi를 통해 토큰 없이 깨끗하게 요청이 날아갑니다.
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
    // ... JSX 부분은 동일합니다 ...
    <div className="min-h-[calc(100vh-150px)] flex justify-center items-center bg-white">
      <div className="rounded-2xl border border-primary-200 shadow-md bg-white px-10 py-10 w-[380px]">
        <form className="flex flex-col gap-4" onSubmit={handleLogin}>
          {/* ... input 필드들 ... */}
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

        {/* ... 하단 버튼들 ... */}
        <div className="mt-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-primary-100" />
          <div className="h-px flex-1 bg-primary-100" />
        </div>

        <div className="mt-6 flex justify-center gap-4">
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-primary-50 transition shadow-sm">
            <img src="/oauth/google_circle.svg" alt="google" className="w-8 h-8" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-primary-50 transition shadow-sm">
            <img src="/oauth/kakao.svg" alt="kakao" className="w-8 h-8" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-primary-50 transition shadow-sm">
            <img src="/oauth/naver.svg" alt="naver" className="w-8 h-8" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
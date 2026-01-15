import { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Link 추가
import { useAuthStore } from "../store/useAuthStore";
import { authService } from "../api/authApi";
import { AxiosError } from "axios";
import { IS_TEST_MODE } from "../config";
import SocialLoginSection from "../components/SocialLoginSection"; // 컴포넌트 import

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
        // ... (테스트 모드 로직 유지)
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

          {/* 이메일 입력 */}
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

          {/* 비밀번호 입력 */}
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

        {/* 👇 [수정] 구분선 및 소셜 버튼 코드를 컴포넌트로 교체 */}
        <SocialLoginSection />

        {/* 👇 [추가] 회원가입 페이지 이동 링크 (UX 개선) */}
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
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { memberApi } from "../api/memberApi";
import { authService } from "../api/authApi";

export default function OAuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setTokens, setUser } = useAuthStore();

    // React StrictMode에서 두 번 실행 방지
    const processedRef = useRef(false);

    const [statusText, setStatusText] = useState("Buddy가 친구 정보를 확인 중... 🐹");

    useEffect(() => {
        if (processedRef.current) return;
        processedRef.current = true;

        const processCallback = async () => {
            const mode = searchParams.get("mode");

            // ---------------------------------------------------------
            // 1. 일반 로그인 성공 & 신규 회원 판별 로직
            // ---------------------------------------------------------
            const accessToken = searchParams.get("accessToken");
            const refreshToken = searchParams.get("refreshToken");
            const isNewMemberStr = searchParams.get("isNewMember"); // "true" or "false"

            if (accessToken && refreshToken) {
                // (1) 토큰 저장
                setTokens(accessToken, refreshToken);

                try {
                    // (2) 내 정보 스토어에 저장 (필수)
                    // 그래야 다음 페이지에서 user.nickname 등을 쓸 수 있음
                    const response = await memberApi.getMe();
                    if (response.result) {
                        setUser(response.result);
                    }

                    // (3) 백엔드가 알려준 값으로 갈림길 선택! 🚦
                    if (isNewMemberStr === "true") {
                        console.log("🆕 신규 회원입니다! 캐릭터 선택 페이지로 이동합니다.");
                        navigate("/auth/register/character", { replace: true });
                    } else {
                        console.log("✅ 기존 회원입니다! 홈으로 이동합니다.");
                        navigate("/app/home", { replace: true });
                    }

                } catch (error) {
                    console.error("정보 로드 실패:", error);
                    // 에러 나도 토큰은 있으니 일단 홈으로 (혹은 로그인으로)
                    navigate("/app/home", { replace: true });
                }
                return; // 여기서 종료
            }

            // ---------------------------------------------------------
            // 2. 계정 연동 필요 (mode=link) - 기존 코드 유지 + 다크모드 대응
            // ---------------------------------------------------------
            if (mode === "link") {
                const email = searchParams.get("email");
                const provider = searchParams.get("provider");
                const oauthId = searchParams.get("oauthId");

                if (email && provider && oauthId) {
                    // confirm 창은 브라우저 기본이라 다크모드 제어 불가 (괜찮음)
                    const isAgreed = window.confirm(`이미 ${email}로 가입된 계정이 있습니다.\n${provider} 계정과 연동하시겠습니까?`);

                    if (isAgreed) {
                        try {
                            setStatusText("계정을 연동하고 있어요! 🔄");
                            const linkResponse = await authService.linkOAuth({ email, provider, oauthId });

                            const { accessToken: newAccess, refreshToken: newRefresh } = linkResponse.result;
                            if (newAccess && newRefresh) {
                                // 연동 성공 시 홈으로
                                setTokens(newAccess, newRefresh);
                                const meRes = await memberApi.getMe();
                                setUser(meRes.result);
                                navigate("/app/home", { replace: true });
                            }
                        } catch (error) {
                            alert("계정 연동에 실패했습니다.");
                            navigate("/auth/login", { replace: true });
                        }
                    } else {
                        alert("연동을 취소했습니다. 다시 로그인해 주세요.");
                        navigate("/auth/login", { replace: true });
                    }
                }
                return;
            }

            // 3. 아무것도 해당 안 되면 로그인으로 튕겨내기
            if (!accessToken && mode !== "link") {
                // navigate("/auth/login", { replace: true });
            }
        };

        processCallback();
    }, []);

    return (
        // ✨ [수정] 배경: bg-white -> dark:bg-slate-900
        <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-900 transition-colors duration-300">
            <div className="flex flex-col items-center gap-6 animate-[fade-in_0.5s]">

                {/* 로딩 스피너 */}
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-slate-100 dark:border-slate-800 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-2xl animate-bounce">
                        🐹
                    </div>
                </div>

                <div className="text-center">
                    {/* ✨ [수정] 텍스트: text-slate-800 -> dark:text-white */}
                    <p className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                        {statusText}
                    </p>
                    {/* ✨ [수정] 서브 텍스트: text-slate-400 -> dark:text-slate-500 */}
                    <p className="text-sm text-slate-400 dark:text-slate-500">
                        잠시만 기다려주세요!
                    </p>
                </div>
            </div>
        </div>
    );
}
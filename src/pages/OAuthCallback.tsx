import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { memberApi } from "../api/memberApi";
import { authService } from "../api/authApi";

export default function OAuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setTokens, setUser } = useAuthStore();

    const processedRef = useRef(false);
    const [statusText, setStatusText] = useState("Buddy가 친구 정보를 확인 중... 🐹");

    useEffect(() => {
        if (processedRef.current) return;
        processedRef.current = true;

        const processCallback = async () => {
            const mode = searchParams.get("mode");

            // ---------------------------------------------------------
            // 1. 로그인 성공 처리
            // ---------------------------------------------------------
            const accessToken = searchParams.get("accessToken");
            const refreshToken = searchParams.get("refreshToken");
            const isNewMemberStr = searchParams.get("isNewMember"); // "true" or "false"

            if (accessToken && refreshToken) {
                setTokens(accessToken, refreshToken);

                try {
                    // (1) 내 최신 정보 가져오기
                    const response = await memberApi.getMe();
                    const userData = response.result;

                    if (userData) {
                        setUser(userData);

                        // ✨ [완벽한 로직]
                        // 1. 신규 회원이면? -> 무조건 캐릭터 선택 (기본값이 1이어도 선택하게 해줘야 함)
                        if (isNewMemberStr === "true") {
                            console.log("🆕 신규 회원입니다! 캐릭터 선택 페이지로 이동합니다.");
                            navigate("/auth/register/character", { replace: true });
                            return;
                        }

                        // 2. 신규 회원은 아닌데(기존 회원), 캐릭터 정보가 깨져있다? -> 캐릭터 선택으로 구출
                        const hasValidCharacter = [1, 2, 3].includes(userData.characterSeq);
                        if (!hasValidCharacter) {
                            console.log("⚠️ 기존 회원이지만 캐릭터 정보가 없습니다. 설정 페이지로 이동합니다.");
                            navigate("/auth/register/character", { replace: true });
                            return;
                        }

                        // 3. 다 통과했으면 -> 홈으로
                        console.log("✅ 로그인 성공! 홈으로 이동합니다.");
                        navigate("/app/home", { replace: true });

                    } else {
                        // 유저 정보 로드 실패 시 홈으로 (App.tsx가 처리하도록)
                        navigate("/app/home", { replace: true });
                    }

                } catch (error) {
                    console.error("정보 로드 실패:", error);
                    navigate("/auth/login", { replace: true });
                }
                return;
            }

            // ---------------------------------------------------------
            // 2. 계정 연동 (기존 코드 유지)
            // ---------------------------------------------------------
            if (mode === "link") {
                const email = searchParams.get("email");
                const provider = searchParams.get("provider");
                const oauthId = searchParams.get("oauthId");

                if (email && provider && oauthId) {
                    const isAgreed = window.confirm(`이미 ${email}로 가입된 계정이 있습니다.\n${provider} 계정과 연동하시겠습니까?`);

                    if (isAgreed) {
                        try {
                            setStatusText("계정을 연동하고 있어요! 🔄");
                            const linkResponse = await authService.linkOAuth({ email, provider, oauthId });
                            const { accessToken: newAccess, refreshToken: newRefresh } = linkResponse.result;

                            if (newAccess && newRefresh) {
                                setTokens(newAccess, newRefresh);
                                const meRes = await memberApi.getMe();
                                setUser(meRes.result);

                                // 연동 유저도 캐릭터 체크
                                const hasChar = [1, 2, 3].includes(meRes.result.characterSeq);
                                navigate(hasChar ? "/app/home" : "/auth/register/character", { replace: true });
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
        };

        processCallback();
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-900 transition-colors duration-300">
            <div className="flex flex-col items-center gap-6 animate-[fade-in_0.5s]">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-slate-100 dark:border-slate-800 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-2xl animate-bounce">
                        🐹
                    </div>
                </div>
                <div className="text-center">
                    <p className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                        {statusText}
                    </p>
                    <p className="text-sm text-slate-400 dark:text-slate-500">
                        잠시만 기다려주세요!
                    </p>
                </div>
            </div>
        </div>
    );
}
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { memberApi } from "../api/memberApi";
import { authService } from "../api/authApi"; // 연동 API 호출용

export default function OAuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setTokens, setUser } = useAuthStore();

    // 화면에 보여줄 로딩 텍스트
    const [statusText, setStatusText] = useState("Buddy가 친구 정보를 확인 중...");

    useEffect(() => {
        const mode = searchParams.get("mode");

        const handleSuccess = async (accessToken: string, refreshToken: string) => {
            // 토큰 저장
            setTokens(accessToken, refreshToken);

            try {
                // 내 정보 가져오기
                const response = await memberApi.getMe();
                const memberData = response.result;
                setUser(memberData);

                // ✨ 캐릭터 유효성 검사 (1:햄스터, 2:여우, 3:판다)
                const seq = memberData.characterSeq;
                const hasValidCharacter = seq === 1 || seq === 2 || seq === 3;

                // ✨ [핵심 수정] 닉네임 여부와 상관없이, 캐릭터가 없으면 '캐릭터 선택' 페이지로 직행!
                if (!hasValidCharacter) {
                    console.log("🚨 캐릭터가 아직 없네요! 캐릭터 선택 페이지로 이동합니다.");
                    navigate("/auth/register/character", { replace: true });
                } else {
                    console.log("✅ 완벽한 유저군요! 홈으로 이동합니다.");
                    navigate("/app/home", { replace: true });
                }
            } catch (error) {
                console.error("유저 정보 로드 실패:", error);
                navigate("/auth/login", { replace: true });
            }
        };

        const processCallback = async () => {
            // 1. 로그인 성공 (mode=success)
            if (mode === "success") {
                const accessToken = searchParams.get("accessToken");
                const refreshToken = searchParams.get("refreshToken");

                if (accessToken && refreshToken) {
                    handleSuccess(accessToken, refreshToken);
                } else {
                    navigate("/auth/login", { replace: true });
                }
            }
            // 2. 계정 연동 필요 (mode=link)
            else if (mode === "link") {
                const email = searchParams.get("email");
                const provider = searchParams.get("provider");
                const oauthId = searchParams.get("oauthId");

                if (email && provider && oauthId) {
                    const isAgreed = window.confirm(`이미 ${email}로 가입된 계정이 있습니다.\n${provider} 계정과 연동하시겠습니까?`);

                    if (isAgreed) {
                        try {
                            setStatusText("계정을 연동하고 있어요! 🔄");
                            const linkResponse = await authService.linkOAuth({ email, provider, oauthId });

                            const { accessToken, refreshToken } = linkResponse.result;
                            if (accessToken && refreshToken) {
                                handleSuccess(accessToken, refreshToken);
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
            } else {
                // mode가 없거나 이상한 경우
                navigate("/auth/login", { replace: true });
            }
        };

        processCallback();
    }, [searchParams, navigate, setTokens, setUser]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
            <div className="animate-bounce text-5xl mb-6">🐹</div>
            <p className="text-slate-600 font-bold text-lg">{statusText}</p>
            <p className="text-slate-400 text-sm mt-2">잠시만 기다려주세요!</p>
        </div>
    );
}
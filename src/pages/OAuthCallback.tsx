import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { memberApi } from "../api/memberApi"; // ✨ 내 정보 확인용 추가

export default function OAuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setTokens, setUser } = useAuthStore();

    useEffect(() => {
        const accessToken = searchParams.get("accessToken");
        const refreshToken = searchParams.get("refreshToken");

        // 🔍 백엔드에서 "true"라고 주는지 "1"이라고 주는지 불확실할 때를 대비
        const isNewUserRaw = searchParams.get("isNewUser");
        const isNewUser = isNewUserRaw === "true" || isNewUserRaw === "1";

        const processLogin = async () => {
            if (accessToken && refreshToken) {
                // 1. 일단 토큰을 스토어에 저장 (로그인 상태가 됨)
                setTokens(accessToken, refreshToken);

                try {
                    // 2. ✨ 핵심: 실제로 내 정보를 서버에서 가져와 봅니다.
                    const response = await memberApi.getMe();
                    const memberData = response.result;

                    // 3. 내 정보를 Zustand에 저장
                    setUser(memberData);

                    // ✨ 4. 판단 로직 수정: 캐릭터가 정확히 1(햄스터), 2(여우), 3(판다) 중 하나인지 깐깐하게 검사!
                    const seq = memberData.characterSeq;
                    const hasValidCharacter = seq === 1 || seq === 2 || seq === 3;

                    if (isNewUser || !memberData.nickname || !hasValidCharacter) {
                        console.log("🚨 닉네임이나 유효한 캐릭터가 없습니다! 설정 페이지로 이동합니다.");
                        navigate("/auth/register/nickname", { replace: true });
                    } else {
                        console.log("✅ 모든 프로필이 설정된 유저입니다. 홈으로 이동합니다.");
                        navigate("/app/home", { replace: true });
                    }
                } catch (error) {
                    console.error("유저 정보 로드 실패:", error);
                    // 정보 로드 실패 시 안전하게 로그인 페이지로 보냄
                    navigate("/auth/login", { replace: true });
                }
            } else {
                console.error("토큰이 주소창에 없어요!");
                navigate("/auth/login", { replace: true });
            }
        };

        processLogin();
    }, [searchParams, navigate, setTokens, setUser]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
            <div className="animate-bounce text-5xl mb-6">🐹</div>
            <p className="text-slate-600 font-bold text-lg">Buddy가 친구 정보를 확인 중...</p>
            <p className="text-slate-400 text-sm mt-2">잠시만 기다려주세요!</p>
        </div>
    );
}
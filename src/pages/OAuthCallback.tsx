import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore"; //

export default function OAuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Zustand 스토어에서 로그인 처리 함수를 가져옵니다.
    const { setTokens } = useAuthStore();

    useEffect(() => {
        // 1. 쿼리스트링에서 데이터 추출 (백엔드와 키 이름을 맞춰야 합니다)
        const accessToken = searchParams.get("accessToken");
        const refreshToken = searchParams.get("refreshToken");
        const isNewUser = searchParams.get("isNewUser") === "true"; // 신규 가입 여부

        if (accessToken && refreshToken) {
            // 2. 토큰 저장 (Zustand 스토어 및 LocalStorage 등)
            setTokens(accessToken, refreshToken);

            if (isNewUser) {
                // ✨ [요청사항] 신규 유저라면 닉네임/캐릭터 설정 페이지로!
                //Buddy 프로젝트의 핵심인 닉네임과 캐릭터(햄스터, 판다, 여우) 설정을 위해 이동합니다.
                navigate("/auth/register/nickname");
            } else {
                // 기존 유저라면 바로 홈 화면으로!
                navigate("/app/home");
            }
        } else {
            // 토큰이 없다면 에러 발생한 것이니 로그인 페이지로 빽
            console.error("OAuth 토큰을 찾을 수 없습니다.");
            alert("소셜 로그인 중 오류가 발생했습니다.");
            navigate("/auth/login");
        }
    }, [searchParams, navigate, setTokens]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
            {/* 귀여운 로딩 스피너나 캐릭터 이미지를 넣으면 더 좋습니다. */}
            <div className="animate-bounce text-4xl mb-4">🐼</div>
            <p className="text-slate-500 font-medium">소셜 로그인 처리 중입니다...</p>
        </div>
    );
}
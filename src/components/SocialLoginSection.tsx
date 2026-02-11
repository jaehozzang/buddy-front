const SocialLoginSection = () => {
    const handleSocialLogin = (provider: string) => {
        // ✨ [핵심 전략] 소셜 로그인만 HTTP로 보냅니다.
        // 페이지 전체 이동(href)은 Mixed Content 에러가 나지 않습니다.
        const SOCIAL_SERVER_URL = "http://buddy-api.kro.kr";

        window.location.href = `${SOCIAL_SERVER_URL}/oauth2/authorization/${provider}`;
    };

    return (
        <>
            <div className="mt-8 flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-medium text-slate-400">간편 로그인</span>
                <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="mt-6 flex justify-center gap-5">
                {/* 1. 구글 */}
                <button
                    onClick={() => handleSocialLogin('google')}
                    className="w-10 h-10 flex items-center justify-center rounded-full active:scale-95 transition shadow-sm overflow-hidden bg-transparent"
                    aria-label="Google 로그인"
                >
                    <img src="/oauth/google.png" alt="google" className="w-full h-full object-cover" />
                </button>

                {/* 2. 카카오 */}
                <button
                    onClick={() => handleSocialLogin('kakao')}
                    className="w-10 h-10 flex items-center justify-center rounded-full active:scale-95 transition shadow-sm overflow-hidden bg-transparent"
                    aria-label="Kakao 로그인"
                >
                    <img src="/oauth/kakao.png" alt="kakao" className="w-full h-full object-cover" />
                </button>

                {/* 3. 네이버 */}
                <button
                    onClick={() => handleSocialLogin('naver')}
                    className="w-10 h-10 flex items-center justify-center rounded-full active:scale-95 transition shadow-sm overflow-hidden bg-transparent"
                    aria-label="Naver 로그인"
                >
                    <img src="/oauth/naver.png" alt="naver" className="w-full h-full object-cover" />
                </button>
            </div>
        </>
    );
};

export default SocialLoginSection;
const SocialLoginSection = () => {
    const handleSocialLogin = (provider: string) => {
        // ✨ 여기도 HTTPS로 통일!
        const SERVER_URL = "https://buddy-api.kro.kr";
        window.location.href = `${SERVER_URL}/oauth2/authorization/${provider}`;
    };

    return (
        <>
            <div className="mt-8 flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-medium text-slate-400">간편 로그인</span>
                <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="mt-6 flex justify-center gap-5">
                {/* 구글 */}
                <button onClick={() => handleSocialLogin('google')} className="w-10 h-10 flex items-center justify-center rounded-full active:scale-95 transition shadow-sm overflow-hidden bg-transparent">
                    <img src="/oauth/google.png" alt="google" className="w-full h-full object-cover" />
                </button>
                {/* 카카오 */}
                <button onClick={() => handleSocialLogin('kakao')} className="w-10 h-10 flex items-center justify-center rounded-full active:scale-95 transition shadow-sm overflow-hidden bg-transparent">
                    <img src="/oauth/kakao.png" alt="kakao" className="w-full h-full object-cover" />
                </button>
                {/* 네이버 */}
                <button onClick={() => handleSocialLogin('naver')} className="w-10 h-10 flex items-center justify-center rounded-full active:scale-95 transition shadow-sm overflow-hidden bg-transparent">
                    <img src="/oauth/naver.png" alt="naver" className="w-full h-full object-cover" />
                </button>
            </div>
        </>
    );
};

export default SocialLoginSection;
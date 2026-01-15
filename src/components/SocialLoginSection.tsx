
const SocialLoginSection = () => {
    const handleSocialLogin = (provider: string) => {
        // 나중에 실제 소셜 로그인 로직 연동
        console.log(`${provider} 로그인 시도`);
        // window.location.href = `SERVER_URL/oauth2/authorization/${provider}`;
    };

    return (
        <>
            <div className="mt-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-primary-100" />
                <span className="text-xs text-primary-300">OR</span> {/* OR 텍스트 추가하면 더 자연스러움 */}
                <div className="h-px flex-1 bg-primary-100" />
            </div>

            <div className="mt-6 flex justify-center gap-4">
                <button
                    onClick={() => handleSocialLogin('google')}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-primary-50 transition shadow-sm border border-slate-100"
                >
                    <img src="/oauth/google_circle.svg" alt="google" className="w-8 h-8" />
                </button>
                <button
                    onClick={() => handleSocialLogin('kakao')}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-primary-50 transition shadow-sm border border-slate-100"
                >
                    <img src="/oauth/kakao.svg" alt="kakao" className="w-8 h-8" />
                </button>
                <button
                    onClick={() => handleSocialLogin('naver')}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-primary-50 transition shadow-sm border border-slate-100"
                >
                    <img src="/oauth/naver.svg" alt="naver" className="w-8 h-8" />
                </button>
            </div>
        </>
    );
};

export default SocialLoginSection;
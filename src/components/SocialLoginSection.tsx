const SocialLoginSection = () => {
    const handleSocialLogin = (provider: string) => {
        // ✨ 배포된 서버 주소를 상수로 관리하면 편합니다.
        const SERVER_URL = "http://buddy-api.kro.kr";

        // 해당 소셜 로그인 시작 주소로 페이지 전체 이동
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
                {/* 1. 구글 로그인 (공식 이미지 적용) */}
                <button
                    onClick={() => handleSocialLogin('google')}
                    className="w-10 h-10 flex items-center justify-center rounded-full active:scale-95 transition shadow-sm overflow-hidden bg-transparent"
                    aria-label="Google 로그인"
                >
                    <img
                        src="/oauth/google.png" // 👈 파일 이름 맞춰주세요!
                        alt="google"
                        className="w-full h-full object-cover"
                    />
                </button>

                {/* 2. 카카오 로그인 (공식 이미지 적용) */}
                <button
                    onClick={() => handleSocialLogin('kakao')}
                    className="w-10 h-10 flex items-center justify-center rounded-full active:scale-95 transition shadow-sm overflow-hidden bg-transparent"
                    aria-label="Kakao 로그인"
                >
                    <img
                        src="/oauth/kakao.png" // 👈 파일 이름 맞춰주세요!
                        alt="kakao"
                        className="w-full h-full object-cover"
                    />
                </button>

                {/* 3. 네이버 로그인 (공식 이미지 적용) */}
                <button
                    onClick={() => handleSocialLogin('naver')}
                    className="w-10 h-10 flex items-center justify-center rounded-full active:scale-95 transition shadow-sm overflow-hidden bg-transparent"
                    aria-label="Naver 로그인"
                >
                    <img
                        src="/oauth/naver.png" // 👈 파일 이름 맞춰주세요!
                        alt="naver"
                        className="w-full h-full object-cover"
                    />
                </button>
            </div>
        </>
    );
};

export default SocialLoginSection;
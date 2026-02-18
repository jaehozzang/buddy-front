function IntroPage() {
  return (
    <div className="flex flex-col gap-8 animate-[fade-in_0.5s]">
      {/* 1. 메인 큰 박스 (이미지 영역) */}
      <section className="w-full max-h-[380px] aspect-[5/2] flex items-center justify-center relative overflow-hidden rounded-lg shadow-sm
        bg-white border border-slate-300 
        dark:bg-slate-800 dark:border-slate-700 transition-colors duration-300">

        {/* 배경 패턴 (투명도 조절로 다크모드 대응) */}
        <div className="absolute inset-0 pointer-events-none opacity-50 dark:opacity-20">
          <div className="absolute inset-0 border-[1px] border-transparent">
            <div className="absolute left-0 top-0 w-full h-full border-[1px] border-slate-200 dark:border-slate-600 -skew-y-3" />
          </div>
        </div>

        {/* 중앙 요소: 말풍선 */}
        <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-4">
          <div className="px-6 py-3 rounded-full shadow-md animate-[bounce_2s_infinite]
            bg-white border border-slate-200 
            dark:bg-slate-700 dark:border-slate-600 transition-colors">
            <span className="font-bold text-sm text-slate-700 dark:text-slate-200">
              👋 "안녕! 나랑 이야기할래?"
            </span>
          </div>
          {/* 캐릭터 이미지가 들어갈 자리 */}
          <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900/50 rounded-full flex items-center justify-center text-4xl">
            🐹
          </div>
        </div>
      </section>

      {/* 2. 설명 텍스트 영역 */}
      <section className="space-y-4 max-w-3xl">
        <h2 className="text-2xl font-bold leading-tight text-slate-800 dark:text-slate-100">
          안녕! 난 네 하루를 기록해 줄<br />
          단짝 친구 <span className="text-primary-600 dark:text-primary-400">Buddy</span>야!
        </h2>

        <div className="space-y-2">
          <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
            햄스터, 여우, 판다... 나만의 귀여운 AI 친구를 골라보세요. <br className="hidden sm:block" />
            오늘 점심은 뭘 먹었는지, 친구랑 무슨 일이 있었는지 저한테만 살짝 말해줄래요? 🤫
          </p>

          <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
            우리가 나눈 대화는 잊지 않고 캘린더에 예쁘게 적어둘게요. <br className="hidden sm:block" />
            당신의 소중한 하루, 저와 함께 차곡차곡 모아봐요! ✨
          </p>
        </div>
      </section>
    </div>
  );
}

export default IntroPage;
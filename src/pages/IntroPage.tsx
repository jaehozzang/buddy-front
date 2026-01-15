function IntroPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* 메인 큰 박스 영역 (이미지/일러스트/캐릭터 자리) */}
      <section className="w-full max-h-[380px] border border-slate-300 rounded-lg aspect-[5/2] flex items-center justify-center relative overflow-hidden bg-white shadow-sm">
        {/* 배경 패턴 */}
        <div className="absolute inset-0 pointer-events-none opacity-50">
          <div className="absolute left-0 top-0 right-0 bottom-0 border-[1px] border-transparent">
            <div className="absolute left-0 top-0 right-0 bottom-0">
              <div className="absolute left-0 top-0 w-full h-full border-[1px] border-transparent">
                <div className="absolute left-0 top-0 w-full h-full">
                  <div className="absolute left-0 top-0 w-full h-full border-[1px] border-slate-200 -skew-y-3" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 중앙 요소: 3번 컨셉에 맞춰서 '인사하는 말풍선' 느낌으로 변경 */}
        <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-4">
          <div className="bg-white px-6 py-3 rounded-full border border-slate-200 shadow-md animate-[bounce_2s_infinite]">
            <span className="text-slate-700 font-bold text-sm">👋 "안녕! 나랑 이야기할래?"</span>
          </div>
          {/* 나중에 여기에 캐릭터 이미지를 넣으시면 딱입니다! */}
        </div>
      </section>

      {/* 아래 설명 텍스트 영역 (3번 컨셉 적용) */}
      <section className="space-y-4 max-w-3xl">
        <h2 className="text-2xl font-bold text-slate-800 leading-tight">
          안녕! 난 네 하루를 기록해 줄<br />
          단짝 친구 <span className="text-primary-600">Buddy</span>야!
        </h2>

        <div className="space-y-2">
          <p className="text-base text-slate-600 leading-relaxed">
            햄스터, 여우, 판다... 나만의 귀여운 AI 친구를 골라보세요. <br className="hidden sm:block" />
            오늘 점심은 뭘 먹었는지, 친구랑 무슨 일이 있었는지 저한테만 살짝 말해줄래요? 🤫
          </p>

          <p className="text-base text-slate-600 leading-relaxed">
            우리가 나눈 대화는 잊지 않고 캘린더에 예쁘게 적어둘게요. <br className="hidden sm:block" />
            당신의 소중한 하루, 저와 함께 차곡차곡 모아봐요! ✨
          </p>
        </div>
      </section>
    </div>
  );
}

export default IntroPage;
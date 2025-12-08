function IntroPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* 메인 큰 박스 영역 (이미지/일러스트/캐릭터 자리) */}
      <section className="w-full max-h-[380px] border border-slate-300 rounded-lg aspect-[5/2] flex items-center justify-center relative overflow-hidden bg-white">
        {/* 대각선 라인 (와이어프레임 느낌만) */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-0 top-0 right-0 bottom-0 border-[1px] border-transparent">
            <div className="absolute left-0 top-0 right-0 bottom-0">
              <div className="absolute left-0 top-0 w-full h-full border-[1px] border-transparent">
                <div className="absolute left-0 top-0 w-full h-full">
                  <div className="absolute left-0 top-0 w-full h-full border-[1px] border-slate-300 -skew-y-3" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 중앙 검색바 느낌 UI (나중에 실제 기능 바꿔도 됨) */}
        <div className="relative z-10 w-full max-w-md">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-full shadow-sm">
            <span className="text-slate-400 text-sm">ㅎㅇ연</span>
          </div>
        </div>
      </section>

      {/* 아래 설명 텍스트 영역 */}
      <section className="space-y-2 max-w-3xl">
        <h2 className="text-xl font-semibold">
          속닥과 함께하는 감정 기록 & 대화 기반 일기 서비스
        </h2>
        <p className="text-sm text-slate-600">
          오늘 있었던 일들을 속닥에게 말해보세요. 대화 내용을 바탕으로 감정을
          정리하고, 일기를 자동으로 만들어 드릴게요. 직접 일기를 작성할 수도
          있고, 지난 기록을 한 번에 돌아볼 수도 있어요.
        </p>
        <p className="text-sm text-slate-600">
          로그인 없이 둘러볼 수도 있지만, 계정을 만들면 감정 리포트, 캐릭터
          설정, 미션 추천 등 더 많은 기능을 사용할 수 있어요.
        </p>
      </section>
    </div>
  );
}

export default IntroPage;

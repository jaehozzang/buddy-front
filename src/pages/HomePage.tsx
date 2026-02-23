import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, getYear, getMonth, subMonths } from "date-fns";
import { useAuthStore } from "../store/useAuthStore";
import { diaryApi, type DailyDiaryCount } from "../api/diaryApi";
import type { DiarySummary } from "../types/diary";

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [recentDiaries, setRecentDiaries] = useState<DiarySummary[]>([]);
  const [loading, setLoading] = useState(true);

  // 캐릭터 이미지
  const getCharacterType = (seq?: number) => {
    switch (seq) {
      case 1: return "hamster";
      case 2: return "fox";
      case 3: return "panda";
      default: return "cat";
    }
  };
  const characterType = getCharacterType(user?.characterSeq);

  const characterImages: Record<string, string> = {
    hamster: "/characters/Hamster.png",
    fox: "/characters/Fox.png",
    panda: "/characters/Panda.png",
    cat: "/characters/Cat.png",
  };
  const currentProfileImg = characterImages[characterType] || characterImages.cat; // rabbit -> cat으로 수정 (기본값)

  // 최근 일기 로직
  useEffect(() => {
    const fetchRecentDiaries = async () => {
      try {
        let targetDate = new Date();
        let collectedDiaries: DiarySummary[] = [];

        for (let i = 0; i < 3; i++) {
          if (collectedDiaries.length >= 3) break;

          const year = getYear(targetDate);
          const month = getMonth(targetDate) + 1;

          const countRes = await diaryApi.getMonthlyDiaryCounts(year, month);

          if (countRes?.result && Array.isArray(countRes.result)) {
            const activeDays = countRes.result
              .filter((item: DailyDiaryCount) => item.count > 0)
              .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

            const daysToFetch = activeDays.slice(0, 3);

            const promises = daysToFetch.map((dayItem: DailyDiaryCount) =>
              diaryApi.getDiariesByDate(dayItem.diaryDate)
            );

            const results = await Promise.all(promises);

            for (const res of results) {
              if (res?.result) {
                collectedDiaries = [...collectedDiaries, ...res.result];
              }
            }
          }
          targetDate = subMonths(targetDate, 1);
        }

        if (collectedDiaries.length > 0) {
          const sorted = collectedDiaries.sort((a: any, b: any) => {
            const dateA = new Date(a.date || a.diaryDate || a.createdAt || a.createAt).getTime();
            const dateB = new Date(b.date || b.diaryDate || b.createdAt || b.createAt).getTime();
            return dateB - dateA;
          });
          setRecentDiaries(sorted.slice(0, 3));
        }

      } catch (error) {
        console.error("최근 일기 로드 실패", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentDiaries();
  }, []);

  return (
    // ✨ [수정] 전체 배경: bg-white -> dark:bg-slate-900
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 overflow-y-auto transition-colors duration-300">

      {/* 메인 상단 영역 */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-5 mt-6 relative z-10">

        {/* 캐릭터 섹션 */}
        <div className="flex flex-col items-center relative">

          {/* ✨ [수정] 배경 글로우 효과: dark 모드에서 투명도 조절 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-100/60 dark:bg-primary-900/30 rounded-full blur-3xl -z-10 pointer-events-none animate-pulse-slow"></div>

          <div className="w-48 h-48 transition-transform hover:scale-105 duration-300">
            <img
              src={currentProfileImg}
              alt="Buddy"
              className="w-full h-full object-contain drop-shadow-xl"
            />
          </div>

          <div className="text-center mt-5 space-y-1 animate-fade-in-up">
            {/* ✨ [수정] 메인 텍스트: text-slate-800 -> dark:text-white */}
            <h1 className="text-xl font-bold text-slate-800 dark:text-white leading-snug">
              <span className="text-primary-600 dark:text-primary-400">{user?.nickname || "친구"}</span>, 안녕!<br />
              오늘 하루는 어땠어?
            </h1>
            {/* ✨ [수정] 서브 텍스트: dark:text-slate-400 */}
            <p className="text-slate-400 dark:text-slate-400 text-sm mt-2">
              너의 이야기를 들려줘, 내가 들어줄게!
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/app/voice-chat')}
          // ✨ [수정] 버튼 스타일: 그림자 제거(다크모드)
          className="w-full max-w-[280px] bg-primary-600 hover:bg-primary-700 text-white text-base font-bold py-3.5 rounded-2xl shadow-lg shadow-primary-200 dark:shadow-none transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 mt-3"
        >
          <span>Buddy와 대화 시작하기</span>
          <span className="text-lg">🎙️</span>
        </button>
      </main>

      {/* 하단 위젯 섹션 */}
      {/* ✨ [수정] 섹션 배경: bg-primary-50/50 -> dark:bg-slate-800, 테두리 추가 */}
      <section className="bg-primary-50/50 dark:bg-slate-800 rounded-[2.5rem] mb-6 mx-2 shadow-lg dark:shadow-black/20 p-6 pb-10 space-y-8 animate-slide-in-bottom relative z-20 border border-primary-100/50 dark:border-slate-700 transition-colors duration-300">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* 1. 최근 일기 위젯 */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              {/* ✨ [수정] 위젯 제목: dark:text-white */}
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-1">
                📒 최근 기록
              </h3>
              <button
                onClick={() => navigate('/app/calendar')}
                // ✨ [수정] 버튼 스타일: bg-white -> dark:bg-slate-700, text-primary-500 -> dark:text-primary-400, border
                className="text-xs text-primary-500 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium bg-white dark:bg-slate-700 px-2 py-1 rounded-lg shadow-sm border border-primary-100 dark:border-slate-600 transition-colors"
              >
                전체 보기
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 h-28">
              {loading ? (
                // ✨ [수정] 로딩 박스: bg-white -> dark:bg-slate-700, border
                <div className="col-span-3 flex items-center justify-center text-slate-400 text-sm bg-white dark:bg-slate-700 rounded-2xl border border-dashed border-primary-200 dark:border-slate-600">
                  로딩 중...
                </div>
              ) : recentDiaries.length > 0 ? (
                recentDiaries.map((diary) => {
                  const d = diary as any;
                  const imgList = d.images || [];
                  const singleImg = d.imageUrl || d.thumbnail;
                  let previewUrl = null;
                  if (Array.isArray(imgList) && imgList.length > 0) {
                    const firstItem = imgList[0];
                    previewUrl = typeof firstItem === 'string' ? firstItem : firstItem.url;
                  } else if (singleImg) {
                    previewUrl = singleImg;
                  }

                  const dateStr = d.date || d.diaryDate || d.createdAt || d.createAt;
                  const displayDate = dateStr ? new Date(dateStr) : new Date();

                  return (
                    <div
                      key={diary.diarySeq}
                      onClick={() => {
                        const dateStr = d.date || d.diaryDate || d.createdAt || d.createAt;
                        navigate('/app/calendar', {
                          state: {
                            openDiaryId: diary.diarySeq,
                            targetDate: dateStr
                          }
                        });
                      }}
                      // ✨ [수정] 일기 카드: bg-white -> dark:bg-slate-700, border-primary-100 -> dark:border-slate-600
                      className="group bg-white dark:bg-slate-700 rounded-2xl border border-primary-100 dark:border-slate-600 shadow-sm hover:shadow-md hover:border-primary-300 dark:hover:border-slate-500 hover:-translate-y-0.5 transition-all cursor-pointer relative overflow-hidden flex flex-col p-3 items-start justify-start text-left"
                    >
                      {/* ✨ [수정] 날짜 배지: bg-primary-50 -> dark:bg-slate-600, text-primary-400 -> dark:text-primary-300 */}
                      <span className="text-[10px] font-bold text-primary-400 dark:text-primary-300 mb-1.5 z-10 bg-primary-50 dark:bg-slate-600 px-1.5 py-0.5 rounded-md">
                        {format(displayDate, "MM.dd")}
                      </span>

                      {previewUrl ? (
                        <>
                          {/* ✨ [수정] 이미지 배경: bg-slate-50 -> dark:bg-slate-600 */}
                          <div className="w-full flex-1 rounded-lg overflow-hidden mb-1.5 bg-slate-50 dark:bg-slate-600 border border-slate-100 dark:border-slate-500">
                            <img src={previewUrl} alt="thumb" className="w-full h-full object-cover" />
                          </div>
                          {/* ✨ [수정] 제목: text-slate-700 -> dark:text-slate-200 */}
                          <h4 className="font-bold text-slate-700 dark:text-slate-200 text-xs w-full truncate">
                            {d.title}
                          </h4>
                        </>
                      ) : (
                        <>
                          <h4 className="font-bold text-slate-700 dark:text-slate-200 text-xs w-full truncate mb-1">
                            {d.title}
                          </h4>
                          {/* ✨ [수정] 내용: text-slate-400 -> dark:text-slate-400 */}
                          <p className="text-[10px] text-slate-400 w-full line-clamp-3 leading-relaxed opacity-90 break-all">
                            {d.summary || d.content}
                          </p>
                        </>
                      )}
                    </div>
                  );
                })
              ) : (
                // ✨ [수정] 빈 상태 박스: bg-white -> dark:bg-slate-700
                <div className="col-span-3 flex flex-col items-center justify-center bg-white dark:bg-slate-700 rounded-2xl border border-dashed border-primary-200 dark:border-slate-600 text-center">
                  <p className="text-xs text-primary-400 dark:text-primary-300 font-medium">아직 작성된 일기가 없어요 🌱</p>
                </div>
              )}
            </div>
          </div>

          {/* 2. 마음 리포트 위젯 */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-base font-bold text-slate-800 dark:text-white">📊 이번 주 마음 리포트</h3>
              <button
                onClick={() => navigate('/app/report')}
                className="text-xs text-primary-500 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium bg-white dark:bg-slate-700 px-2 py-1 rounded-lg shadow-sm border border-primary-100 dark:border-slate-600 transition-colors"
              >
                분석 보기
              </button>
            </div>

            {/* ✨ [수정] 리포트 카드: bg-white -> dark:bg-slate-700, border-primary-100 -> dark:border-slate-600 */}
            <div className="bg-white dark:bg-slate-700 border border-primary-100 dark:border-slate-600 rounded-2xl p-5 flex justify-around items-center h-28 shadow-sm transition-colors">
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl drop-shadow-sm filter grayscale-[0.2]">🔥</span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">열정적</span>
              </div>
              {/* ✨ [수정] 구분선: bg-primary-100 -> dark:bg-slate-600 */}
              <div className="w-[1px] h-10 bg-primary-100 dark:bg-slate-600"></div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl drop-shadow-sm filter grayscale-[0.2]">😢</span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">슬픔</span>
              </div>
              <div className="w-[1px] h-10 bg-primary-100 dark:bg-slate-600"></div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl drop-shadow-sm filter grayscale-[0.2]">✨</span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">평온</span>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default HomePage;
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
      default: return "rabbit";
    }
  };
  const characterType = getCharacterType(user?.characterSeq);

  const characterImages: Record<string, string> = {
    hamster: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Hamster.png",
    fox: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Fox.png",
    panda: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Panda.png",
    rabbit: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Rabbit%20Face.png",
  };
  const currentProfileImg = characterImages[characterType] || characterImages.rabbit;

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
              diaryApi.getDiariesByDate(dayItem.date)
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
    <div className="h-full flex flex-col bg-white overflow-y-auto">

      {/* 메인 상단 영역 */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-5 mt-6 relative z-10">

        {/* 캐릭터 섹션 */}
        <div className="flex flex-col items-center relative">

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-100/60 rounded-full blur-3xl -z-10 pointer-events-none animate-pulse-slow"></div>

          <div className="w-48 h-48 transition-transform hover:scale-105 duration-300">
            <img
              src={currentProfileImg}
              alt="Buddy"
              className="w-full h-full object-contain drop-shadow-xl"
            />
          </div>

          <div className="text-center mt-5 space-y-1 animate-fade-in-up">
            <h1 className="text-xl font-bold text-slate-800 leading-snug">
              <span className="text-primary-600">{user?.nickname || "친구"}</span>, 안녕!<br />
              오늘 하루는 어땠어?
            </h1>
            <p className="text-slate-400 text-sm mt-2">
              너의 이야기를 들려줘, 내가 들어줄게!
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/app/voice-chat')}
          className="w-full max-w-[280px] bg-primary-600 hover:bg-primary-700 text-white text-base font-bold py-3.5 rounded-2xl shadow-lg shadow-primary-200 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 mt-3"
        >
          <span>Buddy와 대화 시작하기</span>
          <span className="text-lg">🎙️</span>
        </button>
      </main>

      {/* 하단 위젯 섹션 */}
      <section className="bg-primary-50/50 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.03)] p-6 pb-10 space-y-8 animate-slide-in-bottom relative z-20 border-t border-primary-100/50">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* 1. 최근 일기 위젯 */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-1">
                📒 최근 기록
              </h3>
              <button onClick={() => navigate('/app/calendar')} className="text-xs text-primary-500 hover:text-primary-700 font-medium bg-white px-2 py-1 rounded-lg shadow-sm border border-primary-100">전체보기</button>
            </div>

            <div className="grid grid-cols-3 gap-3 h-28">
              {loading ? (
                <div className="col-span-3 flex items-center justify-center text-slate-400 text-sm bg-white rounded-2xl border border-dashed border-primary-200">
                  로딩 중...
                </div>
              ) : recentDiaries.length > 0 ? (
                recentDiaries.map((diary) => {
                  const d = diary as any; // ✨ 여기서 d를 any로 선언
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
                      onClick={() => navigate(`/app/diary/${diary.diarySeq}`)}
                      className="group bg-white rounded-2xl border border-primary-100 shadow-sm hover:shadow-md hover:border-primary-300 hover:-translate-y-0.5 transition-all cursor-pointer relative overflow-hidden flex flex-col p-3 items-start justify-start text-left"
                    >
                      <span className="text-[10px] font-bold text-primary-400 mb-1.5 z-10 bg-primary-50 px-1.5 py-0.5 rounded-md">
                        {format(displayDate, "MM.dd")}
                      </span>

                      {previewUrl ? (
                        <>
                          <div className="w-full flex-1 rounded-lg overflow-hidden mb-1.5 bg-slate-50 border border-slate-100">
                            <img src={previewUrl} alt="thumb" className="w-full h-full object-cover" />
                          </div>
                          <h4 className="font-bold text-slate-700 text-xs w-full truncate">
                            {d.title} {/* diary.title -> d.title로 변경 */}
                          </h4>
                        </>
                      ) : (
                        <>
                          <h4 className="font-bold text-slate-700 text-xs w-full truncate mb-1">
                            {d.title} {/* diary.title -> d.title로 변경 */}
                          </h4>
                          <p className="text-[10px] text-slate-400 w-full line-clamp-3 leading-relaxed opacity-90 break-all">
                            {/* 🔥 [수정됨] diary.content 대신 d.content 사용 (TypeScript 에러 해결) */}
                            {d.summary || d.content}
                          </p>
                        </>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="col-span-3 flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-primary-200 text-center">
                  <p className="text-xs text-primary-400 font-medium">아직 작성된 일기가 없어요 🌱</p>
                </div>
              )}
            </div>
          </div>

          {/* 2. 마음 리포트 위젯 */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-base font-bold text-slate-800">📊 이번 주 마음 리포트</h3>
              <button onClick={() => navigate('/app/report')} className="text-xs text-primary-500 hover:text-primary-700 font-medium bg-white px-2 py-1 rounded-lg shadow-sm border border-primary-100">분석 보기</button>
            </div>
            <div className="bg-white border border-primary-100 rounded-2xl p-5 flex justify-around items-center h-28 shadow-sm">
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl drop-shadow-sm filter grayscale-[0.2]">🔥</span>
                <span className="text-xs font-bold text-slate-600">열정적</span>
              </div>
              <div className="w-[1px] h-10 bg-primary-100"></div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl drop-shadow-sm filter grayscale-[0.2]">😢</span>
                <span className="text-xs font-bold text-slate-600">슬픔</span>
              </div>
              <div className="w-[1px] h-10 bg-primary-100"></div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl drop-shadow-sm filter grayscale-[0.2]">✨</span>
                <span className="text-xs font-bold text-slate-600">평온</span>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default HomePage;
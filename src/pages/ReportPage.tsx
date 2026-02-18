import { useState } from "react";
import { format, subMonths, addMonths } from "date-fns";

export default function ReportPage() {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // --- 핸들러 ---
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    return (
        // ✨ [수정] 전체 배경: bg-white -> dark:bg-slate-900, border
        <div className="h-full flex flex-col bg-white dark:bg-slate-900 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 transition-colors duration-300">

            {/* 1. 상단 헤더 */}
            {/* ✨ [수정] 헤더 테두리: border-slate-100 -> dark:border-slate-700 */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex-shrink-0">
                {/* ✨ [수정] 제목: text-slate-800 -> dark:text-white */}
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                    {format(currentMonth, "MMMM yyyy")} Report
                </h2>
                <div className="flex gap-2">
                    {/* ✨ [수정] 버튼 스타일: border, hover, text */}
                    <button onClick={prevMonth} className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-600 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors">‹</button>
                    <button onClick={nextMonth} className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-600 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors">›</button>
                </div>
            </div>

            {/* 2. 메인 콘텐츠 영역 */}
            {/* ✨ [수정] 배경: bg-slate-50/30 -> dark:bg-slate-800/30 */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 dark:bg-slate-800/30 flex flex-col items-center justify-center transition-colors">

                <div className="flex flex-col items-center justify-center text-center animate-[fade-in_0.5s]">
                    {/* 공사 중 아이콘 애니메이션 */}
                    <div className="relative w-24 h-24 mb-6">
                        {/* ✨ [수정] 핑 애니메이션: bg-primary-100 -> dark:bg-primary-900/50 */}
                        <div className="absolute inset-0 bg-primary-100 dark:bg-primary-900/50 rounded-full animate-ping opacity-75"></div>
                        {/* ✨ [수정] 아이콘 원: bg-white -> dark:bg-slate-800, border */}
                        <div className="relative w-full h-full bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-md border border-primary-200 dark:border-primary-800 text-5xl z-10 transition-colors">
                            🚧
                        </div>
                    </div>

                    {/* ✨ [수정] 제목: text-slate-800 -> dark:text-white */}
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">
                        리포트 기능을 준비 중이에요!
                    </h3>

                    {/* ✨ [수정] 설명: text-slate-500 -> dark:text-slate-400 */}
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
                        작성해주신 일기들을 모아서<br />
                        {/* ✨ [수정] 강조 텍스트: text-primary-600 -> dark:text-primary-400 */}
                        <strong className="text-primary-600 dark:text-primary-400">나만의 감정 통계와 키워드 분석</strong>을 한눈에 볼 수 있도록<br />
                        열심히 뚝딱뚝딱 만들고 있습니다. 🛠️
                    </p>

                    {/* ✨ [수정] 커밍순 배지: bg-white -> dark:bg-slate-800, border */}
                    <div className="mt-8 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-sm transition-colors">
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            Coming Soon ✨
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
}
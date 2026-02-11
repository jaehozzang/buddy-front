import { useState } from "react";
import { format, subMonths, addMonths } from "date-fns";

export default function ReportPage() {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // --- 핸들러 ---
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    return (
        <div className="h-full flex flex-col bg-white overflow-hidden rounded-2xl border border-slate-200">

            {/* 1. 상단 헤더 (헤더는 그대로 유지해서 통일감 주기) */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-800">
                    {format(currentMonth, "MMMM yyyy")} Report
                </h2>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-500">‹</button>
                    <button onClick={nextMonth} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-500">›</button>
                </div>
            </div>

            {/* 2. 메인 콘텐츠 영역 (준비 중 화면) */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 flex flex-col items-center justify-center">

                <div className="flex flex-col items-center justify-center text-center animate-[fade-in_0.5s]">
                    {/* 공사 중 아이콘 애니메이션 */}
                    <div className="relative w-24 h-24 mb-6">
                        <div className="absolute inset-0 bg-primary-100 rounded-full animate-ping opacity-75"></div>
                        <div className="relative w-full h-full bg-white rounded-full flex items-center justify-center shadow-md border border-primary-200 text-5xl z-10">
                            🚧
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold text-slate-800 mb-3">
                        리포트 기능을 준비 중이에요!
                    </h3>

                    <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
                        작성해주신 일기들을 모아서<br />
                        <strong className="text-primary-600">나만의 감정 통계와 키워드 분석</strong>을 한눈에 볼 수 있도록<br />
                        열심히 뚝딱뚝딱 만들고 있습니다. 🛠️
                    </p>

                    <div className="mt-8 px-6 py-3 bg-white border border-slate-200 rounded-full shadow-sm">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Coming Soon ✨
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
}
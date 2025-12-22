import { useState, useMemo } from "react";
import { useDiaryStore } from "../store/useDiaryStore";
import { format, startOfMonth, endOfMonth, subMonths, addMonths, getDaysInMonth } from "date-fns";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export default function ReportPage() {
    const { diaries } = useDiaryStore();
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // --- 1. 데이터 계산 로직 ---

    // 현재 보고 있는 달의 시작과 끝
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const totalDaysInMonth = getDaysInMonth(currentMonth);

    // 이번 달 일기만 필터링
    const monthlyDiaries = useMemo(() => {
        return diaries.filter((diary) => {
            const diaryDate = new Date(diary.date);
            return diaryDate >= monthStart && diaryDate <= monthEnd;
        });
    }, [diaries, currentMonth]);

    // 감정별 개수 세기 (예: { 행복: 5, 우울: 2 })
    const moodStats = useMemo(() => {
        const stats: Record<string, number> = {};
        monthlyDiaries.forEach((diary) => {
            stats[diary.mood] = (stats[diary.mood] || 0) + 1;
        });
        return stats;
    }, [monthlyDiaries]);

    // 차트용 데이터 변환 (배열 형태)
    const chartData = Object.keys(moodStats).map((mood) => ({
        name: mood,
        value: moodStats[mood],
    }));

    // 가장 많이 느낀 감정 찾기
    const topMood = useMemo(() => {
        if (chartData.length === 0) return "-";
        // value가 가장 큰 항목을 찾음
        const max = chartData.reduce((prev, current) => (prev.value > current.value ? prev : current));
        return max.name;
    }, [chartData]);

    // 차트 색상 팔레트 (Buddy 앱 테마와 어울리는 파스텔톤)
    const COLORS = ["#FFBB28", "#FF8042", "#00C49F", "#0088FE", "#8884d8", "#FF6B6B"];

    // --- 핸들러 ---
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    return (
        <div className="h-full flex flex-col bg-white overflow-hidden rounded-2xl border border-slate-200">

            {/* 1. 상단 헤더 (달력 페이지와 통일감) */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-800">
                    {format(currentMonth, "MMMM yyyy")} Report
                </h2>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-500">‹</button>
                    <button onClick={nextMonth} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-500">›</button>
                </div>
            </div>

            {/* 2. 메인 콘텐츠 영역 (스크롤 가능) */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">

                {monthlyDiaries.length > 0 ? (
                    <div className="max-w-4xl mx-auto space-y-6">

                        {/* 요약 카드 그리드 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* 카드 1: 작성 수 */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-2">
                                <span className="text-4xl">📝</span>
                                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Logs</span>
                                <span className="text-3xl font-bold text-slate-800">
                                    {monthlyDiaries.length} <span className="text-sm text-slate-400 font-normal">/ {totalDaysInMonth}</span>
                                </span>
                            </div>

                            {/* 카드 2: 최다 감정 */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-2">
                                <span className="text-4xl">👑</span>
                                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Top Mood</span>
                                <span className="text-3xl font-bold text-primary-600">{topMood}</span>
                            </div>

                            {/* 카드 3: 달성률 */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-2">
                                <span className="text-4xl">🔥</span>
                                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Achievement</span>
                                <span className="text-3xl font-bold text-slate-800">
                                    {Math.round((monthlyDiaries.length / totalDaysInMonth) * 100)}%
                                </span>
                            </div>
                        </div>

                        {/* 차트 영역 */}
                        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8">

                            {/* 왼쪽: 차트 */}
                            <div className="w-full h-64 md:w-1/2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {chartData.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* 오른쪽: 분석 텍스트 */}
                            <div className="w-full md:w-1/2 space-y-4">
                                <h3 className="text-lg font-bold text-slate-800">
                                    이번 달의 감정 분석
                                </h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    이번 달에는 <span className="text-primary-600 font-bold">{topMood}</span>을(를) 가장 많이 느끼셨네요!
                                    총 <strong>{monthlyDiaries.length}</strong>개의 기록을 남겨주셨어요.
                                    <br /><br />
                                    {topMood === "행복" || topMood === "설렘" || topMood === "평온"
                                        ? "긍정적인 에너지가 가득한 한 달이었군요! 이 기운을 다음 달까지 쭉 이어가봐요. 🥰"
                                        : "조금은 힘든 날들도 있었지만, 감정을 솔직하게 기록한 것만으로도 큰 의미가 있어요. 다음 달엔 더 웃을 일이 많을 거예요! 💪"
                                    }
                                </p>
                            </div>
                        </div>

                    </div>
                ) : (
                    // 데이터가 없을 때 (빈 화면)
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 text-4xl">
                            📊
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold text-slate-600">데이터가 부족해요</p>
                            <p className="text-sm text-slate-400 mt-2">
                                이번 달 일기를 작성하면<br />멋진 리포트를 만들어 드릴게요!
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
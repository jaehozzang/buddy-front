import { useState, useEffect, useMemo } from "react";
import { format, subMonths, addMonths, getDaysInMonth } from "date-fns";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { diaryApi } from "../api/diaryApi"; // ✨ API import
import { IS_TEST_MODE } from "../config"; // ✨ 설정 import
import type { DiarySummary } from "../types/diary";

export default function ReportPage() {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // ✨ 서버에서 받아온 데이터를 저장할 상태
    const [monthlyDiaries, setMonthlyDiaries] = useState<DiarySummary[]>([]);
    const [loading, setLoading] = useState(false);

    // --- 1. 데이터 가져오기 ---
    useEffect(() => {
        const fetchMonthlyData = async () => {
            setLoading(true);
            const year = currentMonth.getFullYear();
            const month = currentMonth.getMonth() + 1;

            try {
                if (IS_TEST_MODE) {
                    // 🧪 [TEST] 가짜 데이터 생성 (태그 기반)
                    console.log(`[TEST] ${year}-${month} 리포트 데이터 조회`);
                    await new Promise(r => setTimeout(r, 800)); // 로딩 연출

                    setMonthlyDiaries([
                        { diarySeq: 1, title: "aaa", summary: "s", createAt: "2024-01-01", tags: ["행복", "뿌듯"] },
                        { diarySeq: 2, title: "bbb", summary: "s", createAt: "2024-01-02", tags: ["행복", "맛집"] },
                        { diarySeq: 3, title: "ccc", summary: "s", createAt: "2024-01-03", tags: ["피곤", "야근"] },
                        { diarySeq: 4, title: "ddd", summary: "s", createAt: "2024-01-05", tags: ["행복", "데이트"] },
                        { diarySeq: 5, title: "eee", summary: "s", createAt: "2024-01-10", tags: ["우울", "비"] },
                    ]);
                } else {
                    // 🚀 [REAL] 서버 요청
                    const response = await diaryApi.getMonthlyDiaries(year, month);
                    if (response.result && Array.isArray(response.result)) {
                        setMonthlyDiaries(response.result);
                    } else {
                        setMonthlyDiaries([]);
                    }
                }
            } catch (error) {
                console.error("리포트 로딩 실패:", error);
                setMonthlyDiaries([]);
            } finally {
                setLoading(false);
            }
        };

        fetchMonthlyData();
    }, [currentMonth]);


    // --- 2. 통계 계산 로직 (태그 기준) ---

    const totalDaysInMonth = getDaysInMonth(currentMonth);

    // 태그별 개수 세기 (예: { 행복: 3, 피곤: 1 ... })
    const tagStats = useMemo(() => {
        const stats: Record<string, number> = {};

        monthlyDiaries.forEach((diary) => {
            // 각 일기의 태그 배열을 순회
            diary.tags.forEach((tag) => {
                stats[tag] = (stats[tag] || 0) + 1;
            });
        });
        return stats;
    }, [monthlyDiaries]);

    // 차트용 데이터 변환
    const chartData = Object.keys(tagStats).map((tag) => ({
        name: tag,
        value: tagStats[tag],
    }));

    // 가장 많이 나온 태그 찾기
    const topTag = useMemo(() => {
        if (chartData.length === 0) return "-";
        // value가 가장 큰 항목을 찾음
        const max = chartData.reduce((prev, current) => (prev.value > current.value ? prev : current));
        return max.name;
    }, [chartData]);

    // 차트 색상 팔레트
    const COLORS = ["#FFBB28", "#FF8042", "#00C49F", "#0088FE", "#8884d8", "#FF6B6B"];

    // --- 핸들러 ---
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    return (
        <div className="h-full flex flex-col bg-white overflow-hidden rounded-2xl border border-slate-200">

            {/* 1. 상단 헤더 */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-800">
                    {format(currentMonth, "MMMM yyyy")} Report
                </h2>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-500">‹</button>
                    <button onClick={nextMonth} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-500">›</button>
                </div>
            </div>

            {/* 2. 메인 콘텐츠 영역 */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">

                {loading ? (
                    <div className="h-full flex items-center justify-center text-slate-400">
                        데이터 분석 중... 📊
                    </div>
                ) : monthlyDiaries.length > 0 ? (
                    <div className="max-w-4xl mx-auto space-y-6 animate-[fade-in_0.5s]">

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

                            {/* 카드 2: 최다 태그 (변경됨: Mood -> Keyword) */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-2">
                                <span className="text-4xl">🏷️</span>
                                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Top Keyword</span>
                                <span className="text-3xl font-bold text-primary-600">#{topTag}</span>
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
                                    이번 달의 키워드 분석
                                </h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    이번 달에는 <span className="text-primary-600 font-bold">#{topTag}</span> 키워드가 가장 많이 등장했네요!
                                    총 <strong>{monthlyDiaries.length}</strong>개의 기록을 남겨주셨어요.
                                    <br /><br />
                                    {["행복", "기쁨", "설렘", "감사", "평온"].includes(topTag)
                                        ? "긍정적인 에너지가 가득한 한 달이었군요! 이 좋은 흐름을 다음 달까지 쭉 이어가봐요. 🥰"
                                        : `"${topTag}"(이)라는 감정을 자주 느끼셨군요. 자신의 감정을 솔직하게 기록하는 것은 마음을 돌보는 첫걸음이에요. 다음 달엔 더 즐거운 일이 많을 거예요! 💪`
                                    }
                                </p>
                            </div>
                        </div>

                    </div>
                ) : (
                    // 데이터가 없을 때
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
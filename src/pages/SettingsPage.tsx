//import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useDiaryStore } from "../store/useDiaryStore";

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore(); // logout은 헤더에 있으니 여기서 안 써도 됨
  const { diaries } = useDiaryStore();

  // 캐릭터 목록
  const characters = [
    { type: "hamster", img: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Hamster.png" },
    { type: "fox", img: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Fox.png" },
    { type: "panda", img: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Panda.png" },
  ];

  const handleCharacterChange = (type: string) => {
    updateUser({ characterType: type });
    // alert은 너무 올드하니 제거하거나 토스트 메시지로 대체 가능 (지금은 생략)
  };

  const handleResetData = () => {
    if (confirm("⚠️ 정말 모든 데이터를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.")) {
      localStorage.clear();
      window.location.href = "/";
    }
  };

  return (
    // 배경을 흰색(bg-white)으로 통일
    <div className="h-full overflow-y-auto bg-white px-6 py-8 md:px-12">
      <div className="max-w-2xl mx-auto">

        {/* 1. 헤더 */}
        <div className="mb-10">
          <h2 className="text-3xl font-extrabold text-slate-800">Settings</h2>
          <p className="text-slate-500 text-sm mt-2">계정 및 앱 설정</p>
        </div>

        {/* 2. 내 프로필 (박스 없이 깔끔하게) */}
        <div className="flex items-center gap-5 mb-10 pb-10 border-b border-slate-100">
          <div className="w-20 h-20 rounded-full bg-slate-50 p-2">
            <img
              src={characters.find(c => c.type === user?.characterType)?.img || characters[6].img}
              alt="profile"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">{user?.nickname}</h3>
            <p className="text-sm text-primary-600 font-medium mb-1">My Buddy: {user?.buddyName}</p>
            <p className="text-xs text-slate-400">ID: {user?.id}</p>
          </div>
        </div>

        {/* 3. 캐릭터 변경 */}
        <div className="mb-10 pb-10 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">내 버디 변경</h3>
          <div className="flex flex-wrap gap-4">
            {characters.map((char) => (
              <button
                key={char.type}
                onClick={() => handleCharacterChange(char.type)}
                className={`w-16 h-16 p-2 rounded-2xl transition-all duration-200 ${user?.characterType === char.type
                    ? "bg-primary-50 ring-2 ring-primary-500 ring-offset-2 scale-110"
                    : "bg-slate-50 hover:bg-slate-100 grayscale hover:grayscale-0 opacity-70 hover:opacity-100"
                  }`}
              >
                <img src={char.img} alt={char.type} className="w-full h-full object-contain" />
              </button>
            ))}
          </div>
        </div>

        {/* 4. 데이터 관리 (리스트 형태) */}
        <div className="mb-10">
          <h3 className="text-lg font-bold text-slate-800 mb-6">데이터 관리</h3>

          <div className="space-y-6">
            {/* 항목 1 */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">총 기록된 일기</p>
                <p className="text-xs text-slate-400 mt-0.5">로컬 저장소 데이터</p>
              </div>
              <span className="text-base font-bold text-slate-800">{diaries.length}개</span>
            </div>

            {/* 항목 2 */}
            <div className="flex items-center justify-between pt-4">
              <div>
                <p className="text-sm font-medium text-red-500">데이터 초기화</p>
                <p className="text-xs text-slate-400 mt-0.5">모든 기록이 영구 삭제됩니다.</p>
              </div>
              <button
                onClick={handleResetData}
                className="text-xs font-bold text-red-500 underline decoration-red-200 hover:decoration-red-500 hover:text-red-600 transition-all underline-offset-4"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>

        {/* 5. 저작권 (아주 흐리게) */}
        <div className="text-center pt-10">
          <p className="text-[10px] text-slate-300">
            Designed by You · Fluent Emojis designed by Microsoft (CC BY 4.0)
          </p>
        </div>

      </div>
    </div>
  );
}
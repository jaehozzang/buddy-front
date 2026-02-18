import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { memberApi } from "../api/memberApi";
import { IS_TEST_MODE } from "../config";
import { useThemeStore } from "../store/useThemeStore";

export default function SettingsPage() {
  const { user, logout, updateUserInfo } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  const [editingField, setEditingField] = useState<"nickname" | "buddyName" | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [selectedCharSeq, setSelectedCharSeq] = useState<number>(user?.characterSeq || 1);

  useEffect(() => {
    if (user?.characterSeq) {
      setSelectedCharSeq(user.characterSeq);
    }
  }, [user?.characterSeq]);

  const characters = [
    {
      seq: 1,
      name: "햄스터",
      desc: "작은 일도 놓치지 않고 꼼꼼하게 기록해주는 성실한 햄스터예요!",
      img: "/characters/Hamster.png"
    },
    {
      seq: 2,
      name: "여우",
      desc: "당신의 하루를 지혜롭고 센스 있게 정리해주는 똑똑한 여우예요.",
      img: "/characters/Fox.png"
    },
    {
      seq: 3,
      name: "판다",
      desc: "느긋한 마음으로 당신의 고민을 들어주는 다정한 판다예요.",
      img: "/characters/Panda.png"
    },
  ];
  const myCharacter = characters.find(c => c.seq === user?.characterSeq) || characters[0];
  const selectedCharacterInfo = characters.find(c => c.seq === selectedCharSeq) || characters[0];


  const handleEditStart = (field: "nickname" | "buddyName", currentVal: string) => {
    setEditingField(field);
    setInputValue(currentVal);
  };

  const handleEditSave = async () => {
    if (!inputValue.trim()) return setEditingField(null);
    try {
      if (editingField === "nickname") {
        if (!IS_TEST_MODE) await memberApi.updateNickname(inputValue);
        updateUserInfo({ nickname: inputValue });
      } else if (editingField === "buddyName") {
        if (!IS_TEST_MODE) await memberApi.updateCharacterName({ characterName: inputValue });
        updateUserInfo({ characterNickname: inputValue });
      }
      setEditingField(null);
    } catch (error) {
      console.error("수정 실패", error);
      alert("정보 수정에 실패했습니다.");
    }
  };

  const handleCharacterSave = async () => {
    if (user?.characterSeq === selectedCharSeq) return;
    try {
      if (!IS_TEST_MODE) await memberApi.updateCharacter({ characterSeq: selectedCharSeq });
      updateUserInfo({ characterSeq: selectedCharSeq });
      alert("캐릭터가 변경되었습니다! 🎉");
    } catch (error) {
      console.error("캐릭터 변경 실패", error);
      alert("캐릭터 변경에 실패했습니다.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("정말 탈퇴하시겠습니까?\n모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.")) return;
    try {
      await memberApi.deleteAccount();
      alert("탈퇴가 완료되었습니다. 그동안 이용해 주셔서 감사합니다. 🙇‍♂️");
      logout();
      window.location.href = "/";
    } catch (error) {
      console.error("탈퇴 실패", error);
      alert("회원 탈퇴 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    }
  };

  const handleLogout = () => {
    if (confirm("로그아웃 하시겠습니까?")) {
      logout();
      window.location.href = "/auth/login";
    }
  };

  return (
    // ✨ [수정] 배경색 통일: dark:bg-slate-950 -> dark:bg-slate-900 (다른 페이지와 동일하게)
    <div className="h-full overflow-y-auto bg-white dark:bg-slate-900 px-6 py-8 md:px-12 transition-colors duration-300">
      <div className="max-w-2xl mx-auto animate-[fade-in_0.5s]">

        <div className="mb-10">
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white">Settings</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">나와 버디의 정보를 설정해보세요.</p>
        </div>

        {/* 1. 프로필 정보 */}
        {/* ✨ [수정] 구분선 색상: dark:border-slate-800 -> dark:border-slate-700 */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12 pb-12 border-b border-slate-100 dark:border-slate-700">

          <div className="relative group">
            {/* ✨ [수정] 프로필 원 배경: dark:bg-slate-800 (유지) */}
            <div className="w-32 h-32 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 shadow-sm flex items-center justify-center transition-colors">
              <img src={myCharacter.img} alt="profile" className="w-full h-full object-contain" />
            </div>
            <div className="absolute -bottom-2 w-full text-center">
              <span className="bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-[10px] px-2 py-1 rounded-full font-bold shadow-sm border border-primary-200 dark:border-primary-800">
                Lv. 1
              </span>
            </div>
          </div>

          <div className="flex-1 w-full space-y-6">
            {/* 닉네임 */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">My Nickname</label>
              {editingField === "nickname" ? (
                <div className="flex gap-2">
                  <input
                    autoFocus
                    type="text"
                    className="flex-1 border-b-2 border-primary-500 text-xl font-bold text-slate-800 dark:text-white bg-transparent focus:outline-none py-1 placeholder-slate-300"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleEditSave()}
                  />
                  <button onClick={handleEditSave} className="text-sm bg-primary-600 text-white px-3 rounded-lg hover:bg-primary-700 transition-colors">저장</button>
                  <button onClick={() => setEditingField(null)} className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">취소</button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group cursor-pointer w-fit" onClick={() => handleEditStart("nickname", user?.nickname || "")}>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{user?.nickname}</h3>
                  <span className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm font-bold transition-all transform group-hover:translate-x-1">
                    ✎ 수정
                  </span>
                </div>
              )}
            </div>

            {/* 버디 이름 */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Buddy's Name</label>
              {editingField === "buddyName" ? (
                <div className="flex gap-2">
                  <input
                    autoFocus
                    type="text"
                    className="flex-1 border-b-2 border-primary-500 text-lg font-bold text-slate-800 dark:text-white bg-transparent focus:outline-none py-1 placeholder-slate-300"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleEditSave()}
                  />
                  <button onClick={handleEditSave} className="text-sm bg-primary-600 text-white px-3 rounded-lg hover:bg-primary-700 transition-colors">저장</button>
                  <button onClick={() => setEditingField(null)} className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">취소</button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group cursor-pointer w-fit" onClick={() => handleEditStart("buddyName", user?.characterNickname || "")}>
                  <p className="text-lg font-medium text-primary-600 dark:text-primary-400">{user?.characterNickname}</p>
                  <span className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm font-bold transition-all transform group-hover:translate-x-1">
                    ✎ 수정
                  </span>
                </div>
              )}
            </div>

            {/* 이메일 */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Account Email</label>
              {/* ✨ [수정] 이메일 박스: bg-slate-800, border-slate-700 (다른 박스들과 통일) */}
              <p className="text-sm text-slate-500 dark:text-slate-400 font-mono bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 inline-block px-3 py-1.5 rounded-lg w-fit transition-colors">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* 2. 캐릭터 변경 */}
        {/* ✨ [수정] 구분선: border-slate-700 */}
        <div className="mb-12 pb-12 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <span>🎭</span> 캐릭터 변경
          </h3>

          <div className="flex flex-col items-center">
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              {characters.map((char) => (
                <button
                  key={char.seq}
                  onClick={() => setSelectedCharSeq(char.seq)}
                  // ✨ [수정] 비활성 카드: dark:bg-slate-800 (너무 진하지 않게, 일반 박스 색상 사용)
                  className={`w-24 h-24 p-3 rounded-2xl transition-all duration-200 border relative flex flex-col items-center justify-center
                    ${selectedCharSeq === char.seq
                      ? "bg-primary-50 dark:bg-primary-900/30 border-primary-500 ring-4 ring-primary-100 dark:ring-primary-900 scale-105 z-10"
                      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-500 hover:shadow-md opacity-70 hover:opacity-100"
                    }`}
                >
                  <img src={char.img} alt={char.name} className="w-14 h-14 object-contain mb-1" />
                  <span className={`text-xs font-bold ${selectedCharSeq === char.seq ? "text-primary-700 dark:text-primary-300" : "text-slate-500 dark:text-slate-400"}`}>
                    {char.name}
                  </span>

                  {user?.characterSeq === char.seq && (
                    // ✨ [수정] '사용중' 배지: 색상 조화롭게 수정
                    <div className="absolute -top-2 -right-2 bg-slate-800 dark:bg-primary-600 text-white rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm border border-white dark:border-slate-800">
                      사용중
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* ✨ [수정] 설명 박스: dark:bg-slate-800, border-slate-700 */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 w-full text-center border border-slate-100 dark:border-slate-700 mb-4 animate-[fade-in_0.3s] transition-colors">
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                "<span className="text-primary-600 dark:text-primary-400 font-bold">{selectedCharacterInfo.name}</span>"는 {selectedCharacterInfo.desc}
              </p>
            </div>

            <button
              onClick={handleCharacterSave}
              disabled={user?.characterSeq === selectedCharSeq}
              // ✨ [수정] 
              // 1. 공통 클래스에 'border' 추가 (항상 테두리 공간 확보)
              // 2. 활성 상태일 때는 'border-transparent' (투명 테두리) 적용
              // 3. 비활성 상태일 때는 'border-slate-200' (회색 테두리) 적용
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all border
                ${user?.characterSeq === selectedCharSeq
                  ? "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                  : "bg-primary-600 border-transparent text-white hover:bg-primary-700 shadow-md shadow-primary-200 dark:shadow-none hover:shadow-lg active:scale-[0.98]"
                }`}
            >
              {user?.characterSeq === selectedCharSeq ? "현재 적용된 캐릭터입니다" : "이 캐릭터로 변경하기"}
            </button>
          </div>
        </div>

        {/* 3. 화면 설정 */}
        <div className="mb-12 pb-12 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <span>🎨</span> 화면 테마
          </h3>

          {/* ✨ [수정] 박스 배경: dark:bg-slate-800 */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 transition-colors">
            <div className="flex gap-3">
              <button
                onClick={() => setTheme('system')}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border flex flex-col items-center gap-1 ${theme === 'system'
                  ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-500 text-primary-700 dark:text-primary-300 ring-2 ring-primary-100 dark:ring-primary-900'
                  // ✨ [수정] 비활성 버튼: dark:bg-slate-700 (박스 안이라서 800보다 조금 더 밝거나 어둡게 구분)
                  : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-primary-300 dark:hover:border-primary-500 hover:shadow-sm'
                  }`}
              >
                <span className="text-lg">⚙️</span>
                시스템
              </button>

              <button
                onClick={() => setTheme('light')}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border flex flex-col items-center gap-1 ${theme === 'light'
                  ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-500 text-primary-700 dark:text-primary-300 ring-2 ring-primary-100 dark:ring-primary-900'
                  : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-primary-300 dark:hover:border-primary-500 hover:shadow-sm'
                  }`}
              >
                <span className="text-lg">☀️</span>
                라이트
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border flex flex-col items-center gap-1 ${theme === 'dark'
                  ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-500 text-primary-700 dark:text-primary-300 ring-2 ring-primary-100 dark:ring-primary-900'
                  : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-primary-300 dark:hover:border-primary-500 hover:shadow-sm'
                  }`}
              >
                <span className="text-lg">🌙</span>
                다크
              </button>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-4 text-center">
              시스템 테마를 선택하면 기기의 설정(라이트/다크)을 자동으로 따라갑니다.
            </p>
          </div>
        </div>

        {/* 4. 계정 관리 */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <span>🔐</span> 계정 관리
          </h3>

          {/* ✨ [수정] 박스 배경: dark:bg-slate-800 */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 space-y-6 border border-slate-100 dark:border-slate-700 transition-colors">
            {/* 로그아웃 버튼 */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">로그아웃</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">기기에서 접속을 종료합니다.</p>
              </div>
              <button
                onClick={handleLogout}
                // ✨ [수정] 버튼: dark:bg-slate-700
                className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition"
              >
                로그아웃
              </button>
            </div>

            <div className="h-px bg-slate-200 dark:bg-slate-700" />

            {/* 회원 탈퇴 버튼 */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-red-500 dark:text-red-400">회원 탈퇴</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">모든 데이터가 영구적으로 삭제됩니다.</p>
              </div>
              <button
                onClick={handleDeleteAccount}
                className="text-xs font-bold text-red-500 dark:text-red-400 bg-white dark:bg-slate-700 border border-red-200 dark:border-red-900 px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition"
              >
                탈퇴하기
              </button>
            </div>
          </div>
        </div>

        <div className="text-center pt-12 pb-6">
          <p className="text-[10px] text-slate-300 dark:text-slate-600">
            My Buddy v1.0.0
          </p>
        </div>

      </div>
    </div>
  );
}
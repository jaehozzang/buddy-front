import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { memberApi } from "../api/memberApi";
import { IS_TEST_MODE } from "../config";
import { useThemeStore } from "../store/useThemeStore"; // ✨ 테마 스토어 추가

export default function SettingsPage() {
  const { user, logout, updateUserInfo } = useAuthStore();
  const { theme, setTheme } = useThemeStore(); // ✨ 테마 상태 가져오기

  // 입력 모드 상태
  const [editingField, setEditingField] = useState<"nickname" | "buddyName" | null>(null);
  const [inputValue, setInputValue] = useState("");

  // 캐릭터 변경을 위한 '임시 선택' 상태
  const [selectedCharSeq, setSelectedCharSeq] = useState<number>(user?.characterSeq || 1);

  // 유저 정보가 로드되면 선택 상태 동기화
  useEffect(() => {
    if (user?.characterSeq) {
      setSelectedCharSeq(user.characterSeq);
    }
  }, [user]);

  // 캐릭터 데이터
  const characters = [
    {
      seq: 1,
      name: "햄스터",
      desc: "작은 일도 놓치지 않고 꼼꼼하게 기록해주는 성실한 햄스터예요!",
      img: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Hamster.png"
    },
    {
      seq: 2,
      name: "여우",
      desc: "당신의 하루를 지혜롭고 센스 있게 정리해주는 똑똑한 여우예요.",
      img: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Fox.png"
    },
    {
      seq: 3,
      name: "판다",
      desc: "느긋한 마음으로 당신의 고민을 들어주는 다정한 판다예요.",
      img: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Panda.png"
    },
  ];

  const myCharacter = characters.find(c => c.seq === user?.characterSeq) || characters[0];
  const selectedCharacterInfo = characters.find(c => c.seq === selectedCharSeq) || characters[0];


  // 1. 닉네임 / 버디 이름 수정 핸들러
  const handleEditStart = (field: "nickname" | "buddyName", currentVal: string) => {
    setEditingField(field);
    setInputValue(currentVal);
  };

  const handleEditSave = async () => {
    if (!inputValue.trim()) return setEditingField(null);

    try {
      if (editingField === "nickname") {
        if (IS_TEST_MODE) {
          updateUserInfo({ nickname: inputValue });
        } else {
          await memberApi.updateNickname(inputValue);
          updateUserInfo({ nickname: inputValue });
        }
      }
      else if (editingField === "buddyName") {
        if (IS_TEST_MODE) {
          updateUserInfo({ characterNickname: inputValue });
        } else {
          await memberApi.updateBuddyName(inputValue);
          updateUserInfo({ characterNickname: inputValue });
        }
      }
      setEditingField(null);
    } catch (error) {
      console.error("수정 실패", error);
      alert("정보 수정에 실패했습니다.");
    }
  };

  // 2. 캐릭터 저장 핸들러
  const handleCharacterSave = async () => {
    if (user?.characterSeq === selectedCharSeq) return;

    try {
      if (IS_TEST_MODE) {
        updateUserInfo({ characterSeq: selectedCharSeq });
      } else {
        await memberApi.updateCharacterType(selectedCharSeq);
        updateUserInfo({ characterSeq: selectedCharSeq });
      }
      alert("캐릭터가 변경되었습니다! 🎉");
    } catch (error) {
      console.error("캐릭터 변경 실패", error);
      alert("캐릭터 변경에 실패했습니다.");
    }
  };

  const handleLogout = () => {
    if (confirm("로그아웃 하시겠습니까?")) {
      logout();
      window.location.href = "/auth/login";
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-white px-6 py-8 md:px-12 transition-colors duration-200">
      <div className="max-w-2xl mx-auto animate-[fade-in_0.5s]">

        <div className="mb-10">
          <h2 className="text-3xl font-extrabold text-slate-800">Settings</h2>
          <p className="text-slate-500 text-sm mt-2">나와 버디의 정보를 설정해보세요.</p>
        </div>

        {/* 1. 프로필 정보 */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12 pb-12 border-b border-slate-100">

          <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-slate-50 border border-slate-100 p-4 shadow-sm flex items-center justify-center">
              <img
                src={myCharacter.img}
                alt="profile"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="absolute -bottom-2 w-full text-center">
              <span className="bg-primary-100 text-primary-700 text-[10px] px-2 py-1 rounded-full font-bold">
                Lv. 1
              </span>
            </div>
          </div>

          <div className="flex-1 w-full space-y-6">
            {/* 닉네임 */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-400 uppercase">My Nickname</label>
              {editingField === "nickname" ? (
                <div className="flex gap-2">
                  <input
                    autoFocus
                    type="text"
                    className="flex-1 border-b-2 border-primary-500 text-xl font-bold text-slate-800 bg-transparent focus:outline-none py-1"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleEditSave()}
                  />
                  <button onClick={handleEditSave} className="text-sm bg-primary-600 text-white px-3 rounded-lg hover:bg-primary-700">저장</button>
                  <button onClick={() => setEditingField(null)} className="text-sm text-slate-400 hover:text-slate-600">취소</button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group cursor-pointer w-fit" onClick={() => handleEditStart("nickname", user?.nickname || "")}>
                  <h3 className="text-2xl font-bold text-slate-800">{user?.nickname}</h3>
                  <span className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-primary-600 text-sm font-bold transition-all transform group-hover:translate-x-1">
                    ✎ 수정
                  </span>
                </div>
              )}
            </div>

            {/* 버디 이름 */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-400 uppercase">Buddy's Name</label>
              {editingField === "buddyName" ? (
                <div className="flex gap-2">
                  <input
                    autoFocus
                    type="text"
                    className="flex-1 border-b-2 border-primary-500 text-lg font-bold text-slate-800 bg-transparent focus:outline-none py-1"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleEditSave()}
                  />
                  <button onClick={handleEditSave} className="text-sm bg-primary-600 text-white px-3 rounded-lg hover:bg-primary-700">저장</button>
                  <button onClick={() => setEditingField(null)} className="text-sm text-slate-400 hover:text-slate-600">취소</button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group cursor-pointer w-fit" onClick={() => handleEditStart("buddyName", user?.characterNickname || "")}>
                  <p className="text-lg font-medium text-primary-600">{user?.characterNickname}</p>
                  <span className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-primary-600 text-sm font-bold transition-all transform group-hover:translate-x-1">
                    ✎ 수정
                  </span>
                </div>
              )}
            </div>

            {/* 이메일 */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-400 uppercase">Account Email</label>
              <p className="text-sm text-slate-500 font-mono bg-slate-50 inline-block px-3 py-1.5 rounded-lg w-fit">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* 2. 캐릭터 변경 */}
        <div className="mb-12 pb-12 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span>🎭</span> 캐릭터 변경
          </h3>

          <div className="flex flex-col items-center">
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              {characters.map((char) => (
                <button
                  key={char.seq}
                  onClick={() => setSelectedCharSeq(char.seq)}
                  className={`w-24 h-24 p-3 rounded-2xl transition-all duration-200 border relative flex flex-col items-center justify-center
                    ${selectedCharSeq === char.seq
                      ? "bg-primary-50 border-primary-500 ring-4 ring-primary-100 scale-105 z-10"
                      : "bg-white border-slate-200 hover:border-primary-300 hover:shadow-md opacity-70 hover:opacity-100"
                    }`}
                >
                  <img src={char.img} alt={char.name} className="w-14 h-14 object-contain mb-1" />
                  <span className={`text-xs font-bold ${selectedCharSeq === char.seq ? "text-primary-700" : "text-slate-500"}`}>
                    {char.name}
                  </span>

                  {user?.characterSeq === char.seq && (
                    <div className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm">
                      사용중
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="bg-slate-50 rounded-xl p-4 w-full text-center border border-slate-100 mb-4 animate-[fade-in_0.3s]">
              <p className="text-sm text-slate-600 font-medium">
                "<span className="text-primary-600 font-bold">{selectedCharacterInfo.name}</span>"는 {selectedCharacterInfo.desc}
              </p>
            </div>

            <button
              onClick={handleCharacterSave}
              disabled={user?.characterSeq === selectedCharSeq}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all
                ${user?.characterSeq === selectedCharSeq
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-primary-600 text-white hover:bg-primary-700 shadow-md shadow-primary-200 hover:shadow-lg active:scale-[0.98]"
                }`}
            >
              {user?.characterSeq === selectedCharSeq ? "현재 적용된 캐릭터입니다" : "이 캐릭터로 변경하기"}
            </button>
          </div>
        </div>

        {/* ✨ 3. 화면 설정 (새로 추가됨!) */}
        <div className="mb-12 pb-12 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span>🎨</span> 화면 테마
          </h3>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
            <div className="flex gap-3">
              <button
                onClick={() => setTheme('system')}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border flex flex-col items-center gap-1 ${theme === 'system'
                    ? 'bg-primary-50 border-primary-500 text-primary-700 ring-2 ring-primary-100'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-primary-300 hover:shadow-sm'
                  }`}
              >
                <span className="text-lg">⚙️</span>
                시스템
              </button>

              <button
                onClick={() => setTheme('light')}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border flex flex-col items-center gap-1 ${theme === 'light'
                    ? 'bg-primary-50 border-primary-500 text-primary-700 ring-2 ring-primary-100'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-primary-300 hover:shadow-sm'
                  }`}
              >
                <span className="text-lg">☀️</span>
                라이트
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border flex flex-col items-center gap-1 ${theme === 'dark'
                    ? 'bg-primary-50 border-primary-500 text-primary-700 ring-2 ring-primary-100'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-primary-300 hover:shadow-sm'
                  }`}
              >
                <span className="text-lg">🌙</span>
                다크
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-4 text-center">
              시스템 테마를 선택하면 기기의 설정(라이트/다크)을 자동으로 따라갑니다.
            </p>
          </div>
        </div>

        {/* 4. 계정 관리 */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span>🔐</span> 계정 관리
          </h3>

          <div className="bg-slate-50 rounded-2xl p-6 space-y-6 border border-slate-100">
            {/* 로그아웃 버튼 */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-700">로그아웃</p>
                <p className="text-xs text-slate-400 mt-0.5">기기에서 접속을 종료합니다.</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-100 transition"
              >
                로그아웃
              </button>
            </div>

            <div className="h-px bg-slate-200" />

            {/* 회원 탈퇴 버튼 */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-red-500">회원 탈퇴</p>
                <p className="text-xs text-slate-400 mt-0.5">모든 데이터가 영구적으로 삭제됩니다.</p>
              </div>
              <button
                onClick={() => alert("탈퇴 기능은 고객센터에 문의해주세요. (준비중)")}
                className="text-xs font-bold text-red-500 bg-white border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition"
              >
                탈퇴하기
              </button>
            </div>
          </div>
        </div>

        <div className="text-center pt-12 pb-6">
          <p className="text-[10px] text-slate-300">
            My Buddy v1.0.0
          </p>
        </div>

      </div>
    </div>
  );
}
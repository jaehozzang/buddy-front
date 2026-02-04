import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { userApi } from "../api/userApi";
import { IS_TEST_MODE } from "../config";

export default function SettingsPage() {
  const { user, logout, updateUserInfo } = useAuthStore();

  // 입력 모드 상태 (어떤 항목을 수정 중인지)
  const [editingField, setEditingField] = useState<"nickname" | "buddyName" | null>(null);
  const [inputValue, setInputValue] = useState("");

  // 캐릭터 매핑
  const characters = [
    { seq: 1, name: "햄스터", img: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Hamster.png" },
    { seq: 2, name: "여우", img: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Fox.png" },
    { seq: 3, name: "판다", img: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Panda.png" },
  ];

  // 현재 내 캐릭터 이미지 찾기
  const myCharacter = characters.find(c => c.seq === user?.characterSeq) || characters[0];


  // ✨ 1. 닉네임 / 버디 이름 수정 핸들러
  const handleEditStart = (field: "nickname" | "buddyName", currentVal: string) => {
    setEditingField(field);
    setInputValue(currentVal);
  };

  const handleEditSave = async () => {
    if (!inputValue.trim()) return setEditingField(null);

    try {
      if (editingField === "nickname") {
        if (IS_TEST_MODE) {
          console.log("[TEST] 닉네임 변경:", inputValue);
          updateUserInfo({ nickname: inputValue }); // 로컬 스토어 업데이트
        } else {
          await userApi.updateNickname(inputValue);
          updateUserInfo({ nickname: inputValue });
        }
      }
      else if (editingField === "buddyName") {
        if (IS_TEST_MODE) {
          console.log("[TEST] 버디 이름 변경:", inputValue);
          updateUserInfo({ characterNickname: inputValue });
        } else {
          await userApi.updateBuddyName(inputValue);
          updateUserInfo({ characterNickname: inputValue });
        }
      }
      setEditingField(null);
    } catch (error) {
      console.error("수정 실패", error);
      alert("정보 수정에 실패했습니다.");
    }
  };


  // ✨ 2. 캐릭터 종류 변경 핸들러
  const handleCharacterChange = async (seq: number) => {
    if (user?.characterSeq === seq) return; // 같은 거 누르면 무시

    if (!window.confirm("캐릭터를 변경하시겠습니까?")) return;

    try {
      if (IS_TEST_MODE) {
        console.log("[TEST] 캐릭터 변경:", seq);
        updateUserInfo({ characterSeq: seq });
      } else {
        await userApi.updateCharacterType(seq);
        updateUserInfo({ characterSeq: seq });
      }
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
    <div className="h-full overflow-y-auto bg-white px-6 py-8 md:px-12">
      <div className="max-w-2xl mx-auto animate-[fade-in_0.5s]">

        <div className="mb-10">
          <h2 className="text-3xl font-extrabold text-slate-800">Settings</h2>
          <p className="text-slate-500 text-sm mt-2">나와 버디의 정보를 설정해보세요.</p>
        </div>

        {/* 1. 프로필 정보 (수정 가능) */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12 pb-12 border-b border-slate-100">

          {/* 캐릭터 이미지 */}
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

            {/* 닉네임 수정 */}
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
                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => handleEditStart("nickname", user?.nickname || "")}>
                  <h3 className="text-2xl font-bold text-slate-800">{user?.nickname}</h3>
                  <span className="opacity-0 group-hover:opacity-100 text-slate-300 text-sm transition-opacity">✎ 수정</span>
                </div>
              )}
            </div>

            {/* 버디 이름 수정 */}
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
                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => handleEditStart("buddyName", user?.characterNickname || "")}>
                  <p className="text-lg font-medium text-primary-600">{user?.characterNickname}</p>
                  <span className="opacity-0 group-hover:opacity-100 text-slate-300 text-sm transition-opacity">✎ 수정</span>
                </div>
              )}
            </div>

            {/* 이메일 (수정 불가) */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-400 uppercase">Account Email</label>
              <p className="text-sm text-slate-500 font-mono bg-slate-50 inline-block px-3 py-1.5 rounded-lg w-fit">
                {user?.email}
              </p>
            </div>

          </div>
        </div>

        {/* 2. 캐릭터 종류 변경 */}
        <div className="mb-12 pb-12 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span>🎭</span> 캐릭터 변경
          </h3>
          <div className="flex flex-wrap gap-4">
            {characters.map((char) => (
              <button
                key={char.seq}
                onClick={() => handleCharacterChange(char.seq)}
                className={`w-20 h-20 p-3 rounded-2xl transition-all duration-200 border relative
                  ${user?.characterSeq === char.seq
                    ? "bg-primary-50 border-primary-500 ring-2 ring-primary-100 scale-105"
                    : "bg-white border-slate-200 hover:border-primary-300 hover:shadow-md grayscale hover:grayscale-0 opacity-70 hover:opacity-100"
                  }`}
              >
                <img src={char.img} alt={char.name} className="w-full h-full object-contain" />
                {user?.characterSeq === char.seq && (
                  <div className="absolute -top-2 -right-2 bg-primary-600 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center text-[10px]">
                    ✓
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 3. 계정 관리 */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span>🔐</span> 계정 관리
          </h3>

          <div className="bg-slate-50 rounded-2xl p-6 space-y-6 border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-700">로그아웃</p>
                <p className="text-xs text-slate-400 mt-0.5">기기에서 접속을 종료합니다.</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-100 transition"
              >
                LOGOUT
              </button>
            </div>

            <div className="h-px bg-slate-200" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-red-500">회원 탈퇴</p>
                <p className="text-xs text-slate-400 mt-0.5">모든 데이터가 영구적으로 삭제됩니다.</p>
              </div>
              <button
                onClick={() => alert("탈퇴 기능은 고객센터에 문의해주세요. (준비중)")}
                className="text-xs font-bold text-red-500 underline decoration-red-200 hover:decoration-red-500 hover:text-red-600 transition underline-offset-4"
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
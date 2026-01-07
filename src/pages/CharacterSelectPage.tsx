import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

function CharacterSelectPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, password } = location.state || {};
  const { register } = useAuthStore();

  const receivedNickname = location.state?.userNickname || "";

  // ✨ [수정] 마이크로소프트 3D 애니메이션 이모지 리스트
  const characters = [
    {
      name: "햄스터",
      type: "hamster",
      img: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Hamster.png"
    },
    {
      name: "여우",
      type: "fox",
      img: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Fox.png"
    },
    {
      name: "판다",
      type: "panda",
      img: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Panda.png"
    },
  ];

  const [index, setIndex] = useState(0); // 0번(햄스터)부터 시작
  const [characterName, setCharacterName] = useState("");

  const prev = () => {
    setIndex((prev) => (prev - 1 + characters.length) % characters.length);
  };

  const next = () => {
    setIndex((prev) => (prev + 1) % characters.length);
  };

  const handleStart = () => {
    if (!receivedNickname && !characterName) {
      alert("처음부터 다시 진행해주세요!");
      navigate("/auth/register");
      return;
    }

    const selectedCharacter = characters[index];

    register({
      id: userId,
      password: password,
      nickname: receivedNickname,
      buddyName: characterName || selectedCharacter.name,
      characterType: selectedCharacter.type, // 여기서 선택한 타입(fox, lion 등)이 저장됨
    });

    navigate("/app/home", { replace: true });
  };

  return (
    <div className="min-h-[calc(100vh-150px)] flex items-center justify-center bg-white px-6">
      <div className="flex flex-col items-center text-center gap-6">

        {/* 캐릭터 이미지 슬라이더 */}
        <div className="flex items-center justify-center gap-4 sm:gap-8 h-48">
          {/* 이전 캐릭터 (흐리게) */}
          <div className="w-24 h-24 flex items-center justify-center opacity-40 grayscale blur-[1px] transition-all duration-300">
            <img
              src={characters[(index - 1 + characters.length) % characters.length].img}
              alt="prev"
              className="w-full h-full object-contain"
            />
          </div>

          {/* 현재 선택된 캐릭터 (크게) */}
          <div className="w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center filter drop-shadow-xl transition-all duration-300 transform scale-110 z-10">
            <img
              src={characters[index].img}
              alt="main"
              className="w-full h-full object-contain animate-[bounce_3s_infinite]"
            />
          </div>

          {/* 다음 캐릭터 (흐리게) */}
          <div className="w-24 h-24 flex items-center justify-center opacity-40 grayscale blur-[1px] transition-all duration-300">
            <img
              src={characters[(index + 1) % characters.length].img}
              alt="next"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* 좌우 화살표 및 캐릭터 종족 이름 */}
        <div className="flex items-center gap-6 text-slate-700 mt-4">
          <button onClick={prev} className="text-3xl text-slate-300 hover:text-slate-500 transition-colors p-2">◀</button>
          <span className="text-xl font-bold tracking-widest uppercase min-w-[80px]">{characters[index].name}</span>
          <button onClick={next} className="text-3xl text-slate-300 hover:text-slate-500 transition-colors p-2">▶</button>
        </div>

        {/* 캐릭터 별명 입력 */}
        <div className="flex flex-col gap-2 mt-2">
          <p className="text-xs text-slate-400">내 친구의 애칭을 지어주세요 (선택)</p>
          <input
            type="text"
            placeholder={characters[index].name}
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            className="w-80 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 
            text-sm text-slate-700 focus:outline-none focus:border-primary-400 focus:bg-white text-center transition-all"
          />
        </div>

        {/* START 버튼 */}
        <button
          onClick={handleStart}
          className="w-80 rounded-xl bg-primary-600 py-4 text-sm font-bold text-white
          tracking-wider hover:bg-primary-700 shadow-lg shadow-primary-200 active:scale-[0.98] transition-all mt-4"
        >
          START
        </button>

      </div>
    </div>
  );
}

export default CharacterSelectPage;
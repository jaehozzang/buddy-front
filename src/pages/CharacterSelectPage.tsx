import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // useLocation 추가
import { useAuthStore } from "../store/useAuthStore";

function CharacterSelectPage() {
  const navigate = useNavigate();
  const location = useLocation(); // 이전 페이지에서 보낸 데이터 받기
  const { userId, password, userNickname } = location.state || {}; // 👈 이전 페이지들에서 받은 정보
  const { register } = useAuthStore();

  // 1. 이전 페이지(RegisterNicknamePage)에서 보낸 'userNickname' 받기
  // 만약 바로 들어왔으면(새로고침 등) 기본값 "Buddy"
  const receivedNickname = location.state?.userNickname || "";

  const characters = [
    { name: "카피바라", type: "capybara", img: "/characters/capybara.png" },
    { name: "토끼", type: "rabbit", img: "/characters/rabbit.png" },
    { name: "거북이", type: "turtle", img: "/characters/turtle.png" },
    { name: "강아지", type: "dog", img: "/characters/dog.png" },
    { name: "고양이", type: "cat", img: "/characters/cat.png" },
  ];

  const [index, setIndex] = useState(1);

  // 여기서 'characterName'은 캐릭터에게 붙여줄 별명 (선택사항)
  // 입력 안 하면 그냥 캐릭터 이름(예: 토끼)으로 설정되게 함
  const [characterName, setCharacterName] = useState("");

  const prev = () => {
    setIndex((prev) => (prev - 1 + characters.length) % characters.length);
  };

  const next = () => {
    setIndex((prev) => (prev + 1) % characters.length);
  };

  const handleStart = () => {
    // 2. 닉네임이 아예 없으면 (이전 페이지 건너뛰고 왔을 때) 경고
    if (!receivedNickname && !characterName) {
      alert("처음부터 다시 진행해주세요!");
      navigate("/auth/register");
      return;
    }

    const selectedCharacter = characters[index];

    // 3. register 함수로 저장! (DB에도 넣고, 로그인도 되고)
    register({
      id: userId,
      password: password,
      nickname: receivedNickname, // 내 닉네임 (재호)
      // ✨ [추가] 입력한 애칭이 있으면 쓰고, 없으면 종족 이름(예: 토끼) 사용
      buddyName: characterName || selectedCharacter.name,
      characterType: selectedCharacter.type || "rabbit",
    });

    // 4. 홈으로 이동
    navigate("/app/home", { replace: true });
  };

  return (
    <div className="min-h-[calc(100vh-150px)] flex items-center justify-center bg-white px-6">
      <div className="flex flex-col items-center text-center gap-6">

        {/* 캐릭터 이미지 슬라이더 */}
        <div className="flex items-center justify-center gap-8">
          <img
            src={characters[(index - 1 + characters.length) % characters.length].img}
            alt="prev"
            className="w-28 opacity-60 grayscale"
          />
          <img
            src={characters[index].img}
            alt="main"
            className="w-40 drop-shadow-md scale-110 transition-transform"
          />
          <img
            src={characters[(index + 1) % characters.length].img}
            alt="next"
            className="w-28 opacity-60 grayscale"
          />
        </div>

        {/* 좌우 화살표 및 캐릭터 종족 이름 */}
        <div className="flex items-center gap-6 text-slate-700">
          <button onClick={prev} className="text-3xl text-slate-300 hover:text-slate-500">◀</button>
          <span className="text-xl font-bold tracking-widest uppercase">{characters[index].name}</span>
          <button onClick={next} className="text-3xl text-slate-300 hover:text-slate-500">▶</button>
        </div>

        {/* 캐릭터 별명 입력 (선택사항으로 변경) */}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-slate-400">내 친구의 애칭을 지어주세요 (선택)</p>
          <input
            type="text"
            placeholder={characters[index].name} // 예: 토끼
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            className="w-80 rounded-md bg-white border border-primary-200 px-4 py-3 
            text-sm text-slate-700 focus:outline-none focus:border-primary-400 text-center"
          />
        </div>

        {/* START 버튼 */}
        <button
          onClick={handleStart}
          className="w-80 rounded-md bg-primary-600 py-3 text-sm font-medium text-white
          tracking-[0.08em] hover:bg-primary-700 shadow-md shadow-primary-300/40 transition mt-4"
        >
          START
        </button>

      </div>
    </div>
  );
}

export default CharacterSelectPage;
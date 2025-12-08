import { useState } from "react";

function CharacterSelectPage() {
  const characters = [
    { name: "카피바라", img: "/characters/capybara.png" },
    { name: "토끼", img: "/characters/rabbit.png" },
    { name: "거북이", img: "/characters/turtle.png" },  
    { name: "강아지", img: "/characters/dog.png" }, 
    { name: "고양이", img: "/characters/cat.png" }, 
  ];

  const [index, setIndex] = useState(1); // 초록-홍당무-노랑 → 가운데 홍당무부터
  const [nickname, setNickname] = useState("");

  const prev = () => {
    setIndex((prev) => (prev - 1 + characters.length) % characters.length);
  };

  const next = () => {
    setIndex((prev) => (prev + 1) % characters.length);
  };

  return (
    <div className="min-h-[calc(100vh-150px)] flex items-center justify-center bg-white px-6">

      <div className="flex flex-col items-center text-center gap-6">

        {/* 캐릭터 이미지 3개 정렬 */}
        <div className="flex items-center justify-center gap-8">

          {/* 좌측 옅은 캐릭터 */}
          <img
            src={characters[(index - 1 + characters.length) % characters.length].img}
            alt="prev"
            className="w-28 opacity-60"
          />

          {/* 가운데 메인 캐릭터 */}
          <img
            src={characters[index].img}
            alt="main"
            className="w-40 drop-shadow-md"
          />

          {/* 우측 옅은 캐릭터 */}
          <img
            src={characters[(index + 1) % characters.length].img}
            alt="next"
            className="w-28 opacity-60"
          />
        </div>

        {/* 이름 + 좌우 선택 */}
        <div className="flex items-center gap-6 text-slate-700">
          <button onClick={prev} className="text-3xl text-slate-400 hover:text-slate-600">◀</button>
          <span className="text-lg font-medium">{characters[index].name}</span>
          <button onClick={next} className="text-3xl text-slate-400 hover:text-slate-600">▶</button>
        </div>

        {/* 캐릭터에게 줄 닉네임 입력 */}
        <input
          type="text"
          placeholder="CHARACTER NAME"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="w-80 rounded-md bg-white border border-primary-200 px-4 py-3 
          text-sm text-slate-700 focus:outline-none focus:border-primary-400"
        />

        {/* START 버튼 */}
        <button
          className="w-80 rounded-md bg-primary-600 py-3 text-sm font-medium text-white
          tracking-[0.08em] hover:bg-primary-700 shadow-md shadow-primary-300/40 transition"
        >
          START
        </button>

      </div>
    </div>
  );
}

export default CharacterSelectPage;

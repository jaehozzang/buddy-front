import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../api/authApi";
import { AxiosError } from "axios";
import { IS_TEST_MODE } from "../config";

function CharacterSelectPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, password, userNickname } = location.state || {};

  const characters = [
    { seq: 1, name: "햄스터", img: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Hamster.png" },
    { seq: 2, name: "여우", img: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Fox.png" },
    { seq: 3, name: "판다", img: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Panda.png" },
  ];

  const [index, setIndex] = useState(0);
  // ✨ [추가] 캐릭터 닉네임 state
  const [characterNickname, setCharacterNickname] = useState("");

  const prev = () => setIndex((prev) => (prev - 1 + characters.length) % characters.length);
  const next = () => setIndex((prev) => (prev + 1) % characters.length);

  const handleStart = async () => {
    if (!email || !password || !userNickname) {
      alert("정보가 부족합니다. 처음부터 다시 시도해주세요.");
      navigate("/auth/register");
      return;
    }

    // ✨ [추가] 캐릭터 닉네임 입력 확인
    if (!characterNickname.trim()) {
      alert("캐릭터의 이름을 지어주세요!");
      return;
    }

    const selectedCharacter = characters[index];

    try {
      if (IS_TEST_MODE) {
        console.log("🛠️ [TEST] 전송 데이터:", {
          email,
          password,
          nickname: userNickname,
          characterSeq: selectedCharacter.seq,
          characterNickname // ✨ 확인용
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert("[TEST] 회원가입 성공!");
        navigate("/auth/login");
      } else {
        await authService.signup({
          email: email,
          password: password,
          nickname: userNickname,
          characterSeq: selectedCharacter.seq,
          characterNickname: characterNickname // ✨ [추가] API에 전달
        });

        alert("회원가입 완료! 로그인해주세요.");
        navigate("/auth/login");
      }

    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const msg = err.response?.data?.message || "회원가입 중 오류가 발생했습니다.";
      alert(msg);
    }
  };

  return (
    <div className="min-h-[calc(100vh-150px)] flex items-center justify-center bg-white px-6">
      <div className="flex flex-col items-center text-center gap-6">

        {/* 안내 문구 (옵션)
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Choose Your Partner</h2>
          <p className="text-slate-500 mt-2">함께할 캐릭터를 선택하고 이름을 지어주세요.</p>
        </div> */}

        {/* 캐릭터 이미지 슬라이더 */}
        <div className="flex items-center justify-center gap-4 sm:gap-8 h-48 mt-4">
          <div className="w-24 h-24 flex items-center justify-center opacity-40 grayscale blur-[1px] transition-all duration-300">
            <img src={characters[(index - 1 + characters.length) % characters.length].img} alt="prev" className="w-full h-full object-contain" />
          </div>
          <div className="w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center filter drop-shadow-xl transition-all duration-300 transform scale-110 z-10">
            <img src={characters[index].img} alt="main" className="w-full h-full object-contain animate-[bounce_3s_infinite]" />
          </div>
          <div className="w-24 h-24 flex items-center justify-center opacity-40 grayscale blur-[1px] transition-all duration-300">
            <img src={characters[(index + 1) % characters.length].img} alt="next" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* 네비게이션 버튼 & 종족 이름 */}
        <div className="flex items-center gap-6 text-slate-700 mt-2">
          <button onClick={prev} className="text-3xl text-slate-300 hover:text-slate-500 transition-colors p-2">◀</button>
          <span className="text-xl font-bold tracking-widest uppercase min-w-[80px]">{characters[index].name}</span>
          <button onClick={next} className="text-3xl text-slate-300 hover:text-slate-500 transition-colors p-2">▶</button>
        </div>

        {/* ✨ [추가] 캐릭터 닉네임 입력창 (버튼과 같은 w-80 너비) */}
        <div className="w-80 mt-2">
          {/* <label className="block text-sm font-bold text-slate-500 mb-2 text-left ml-1">
            CHARACTER NICKNAME
          </label> */}
          <input
            type="text"
            value={characterNickname}
            onChange={(e) => setCharacterNickname(e.target.value)}
            placeholder="CHARACTER NICKNAME"
            className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 
                focus:outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white 
                transition-all text-sm text-slate-700 placeholder:text-slate-400"
          />
        </div>

        <button
          onClick={handleStart}
          className="w-80 rounded-xl bg-primary-600 py-4 text-sm font-bold text-white
          tracking-wider hover:bg-primary-700 shadow-lg shadow-primary-200 active:scale-[0.98] transition-all"
        >
          COMPLETE SIGNUP
        </button>

      </div>
    </div>
  );
}

export default CharacterSelectPage;
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { memberApi } from "../api/memberApi";
import { useAuthStore } from "../store/useAuthStore";
import { AxiosError } from "axios";

function CharacterSelectPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. 일반 가입 시 넘어오는 데이터 (소셜 로그인은 이게 없음)
  const { email, password, userNickname } = location.state || {};

  // ✨ [핵심 변경] 일반 가입인지 판단하는 확실한 기준
  const isNormalSignup = !!(email && password && userNickname);

  const { user, setUser } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 캐릭터 데이터
  const characters = [
    {
      seq: 1,
      name: "햄스터",
      img: "/characters/Hamster.png",
      desc: "주인님 기분이 제일 중요해! 🐹 논리보다는 감정에 깊이 공감해주는 사랑스러운 친구예요.",
      keywords: ["#공감요정", "#무한긍정", "#애교만점"]
    },
    {
      seq: 2,
      name: "여우",
      img: "/characters/Fox.png",
      desc: "징징거릴 시간에 해결책을 찾아. 😏 감정보다 이성을 중시하는 시니컬한 분석가예요.",
      keywords: ["#팩트폭력", "#냉철분석", "#효율중시"]
    },
    {
      seq: 3,
      name: "판다",
      img: "/characters/Panda.png",
      desc: "허허, 실수는 누구나 하는 법. 🍵 따뜻한 위로와 현실적인 조언을 함께 주는 든든한 멘토예요.",
      keywords: ["#지혜로움", "#멘토", "#따뜻한위로"]
    },
  ];

  const [index, setIndex] = useState(0);
  const [characterNickname, setCharacterNickname] = useState("");

  // 소셜 유저라면 기존 닉네임 자동 채우기
  useEffect(() => {
    // 일반 가입이 아니고, 유저 정보가 있다면 미리 채워줌
    if (!isNormalSignup && user?.characterNickname) {
      setCharacterNickname(user.characterNickname);
    }
  }, [isNormalSignup, user]);

  const prev = () => setIndex((prev) => (prev - 1 + characters.length) % characters.length);
  const next = () => setIndex((prev) => (prev + 1) % characters.length);

  const handleStart = async () => {
    if (!characterNickname.trim()) {
      alert("캐릭터의 이름을 지어주세요!");
      return;
    }

    const selectedCharacter = characters[index];
    setIsSubmitting(true);

    try {
      // 🚀 1. 일반 회원가입 유저일 경우 (우선 순위 체크!)
      if (isNormalSignup) {
        if (!email || !password || !userNickname) {
          // 혹시라도 새로고침해서 데이터 날아갔을 경우 방어
          alert("가입 정보가 유실되었습니다. 처음부터 다시 시도해주세요.");
          navigate("/auth/register");
          return;
        }

        await memberApi.signup({
          email,
          password,
          nickname: userNickname,
          characterSeq: selectedCharacter.seq,
          characterNickname
        });

        alert("회원가입 완료! 로그인해주세요.");
        navigate("/auth/login");
      }
      // 🚀 2. 소셜 로그인 유저 (여기가 문제였음!)
      else {
        // (1) 캐릭터 정보 서버에 업데이트
        await memberApi.updateCharacter({ characterSeq: selectedCharacter.seq });
        await memberApi.updateCharacterName({ characterName: characterNickname });

        // ✨ [핵심 수정] 서버에서 최신 유저 정보를 가져와서 스토어에 박아버림!
        // 이제 캐릭터 설정이 끝났으니 500 에러가 안 납니다.
        const response = await memberApi.getMe(); // 혹은 getMemberInfo()

        if (response.result) {
          setUser(response.result); // 스토어 갱신! (이제 App.tsx가 통과시켜줌)
          alert("캐릭터 설정이 완료되었습니다! 🎉");
          navigate("/app/home", { replace: true });
        } else {
          alert("정보 갱신에 실패했습니다. 다시 로그인해주세요.");
          navigate("/auth/login");
        }
      }

    } catch (error) {
      console.error(error);
      const err = error as AxiosError<{ message: string }>;
      const msg = err.response?.data?.message || "처리 중 오류가 발생했습니다.";
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-150px)] flex items-center justify-center bg-white dark:bg-slate-900 px-6 transition-colors duration-300">
      <div className="flex flex-col items-center text-center gap-4 w-full max-w-md">

        <div className="mb-2">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">캐릭터 선택</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">나만의 AI 친구를 골라보세요.</p>
        </div>

        {/* 캐릭터 슬라이더 UI */}
        <div className="flex items-center justify-center gap-4 sm:gap-8 h-48 mt-4 relative">
          <div
            onClick={prev}
            className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center opacity-30 grayscale blur-[1px] cursor-pointer hover:opacity-50 transition-all duration-300"
          >
            <img src={characters[(index - 1 + characters.length) % characters.length].img} alt="prev" className="w-full h-full object-contain" />
          </div>
          <div className="w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center filter drop-shadow-xl transition-all duration-300 transform scale-110 z-10">
            <img src={characters[index].img} alt="main" className="w-full h-full object-contain animate-[bounce_3s_infinite]" />
          </div>
          <div
            onClick={next}
            className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center opacity-30 grayscale blur-[1px] cursor-pointer hover:opacity-50 transition-all duration-300"
          >
            <img src={characters[(index + 1) % characters.length].img} alt="next" className="w-full h-full object-contain" />
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 text-slate-700 w-full">
          <button onClick={prev} className="text-2xl text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 transition-colors p-2">◀</button>
          <span className="text-xl font-bold tracking-widest uppercase min-w-[80px] dark:text-white">{characters[index].name}</span>
          <button onClick={next} className="text-2xl text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 transition-colors p-2">▶</button>
        </div>

        <div className="flex flex-col items-center gap-3 min-h-[90px] px-4">
          <div className="flex flex-wrap justify-center gap-2">
            {characters[index].keywords.map((keyword, i) => (
              <span key={i} className="text-[10px] sm:text-xs font-bold text-primary-600 bg-primary-50 border border-primary-100 px-2.5 py-1 rounded-full
                dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-800 transition-colors">
                {keyword}
              </span>
            ))}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 break-keep leading-relaxed max-w-[320px]">
            {characters[index].desc}
          </p>
        </div>

        <div className="relative w-full max-w-[320px] mt-4 text-left">
          <input
            type="text"
            id="characterNickname"
            value={characterNickname}
            onChange={(e) => setCharacterNickname(e.target.value)}
            className="peer w-full rounded-xl bg-white border border-primary-200 px-4 py-3.5 
                        text-sm text-slate-700 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 placeholder-transparent
                        dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:border-primary-500 dark:focus:ring-primary-900 transition-all"
            placeholder=" "
          />
          <label
            htmlFor="characterNickname"
            className="absolute left-4 top-3.5 text-sm text-slate-400 transition-all cursor-text bg-white px-1
                        peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-xs peer-focus:text-primary-600 peer-focus:font-bold
                        peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400
                        peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-primary-600 peer-[:not(:placeholder-shown)]:font-bold
                        
                        dark:bg-slate-800 dark:peer-focus:bg-slate-900 dark:peer-[:not(:placeholder-shown)]:bg-slate-900
                        dark:peer-focus:text-primary-400 dark:peer-[:not(:placeholder-shown)]:text-primary-400"
          >
            캐릭터 이름
          </label>
        </div>

        <button
          onClick={handleStart}
          disabled={isSubmitting}
          className={`w-full max-w-[320px] rounded-xl py-4 text-sm font-bold text-white tracking-wider shadow-lg dark:shadow-none transform transition-all mt-2
                    ${isSubmitting
              ? "bg-slate-400 dark:bg-slate-700 cursor-not-allowed"
              : "bg-primary-600 hover:bg-primary-700 shadow-primary-200 hover:shadow-primary-300 active:scale-[0.98]"
            }`}
        >
          {isSubmitting
            ? "잠시만 기다려주세요... ⏳"
            // ✨ [수정] 버튼 텍스트도 명확하게 분기
            : (isNormalSignup ? "회원가입 완료하기 ✨" : "캐릭터 설정 완료! 🎉")
          }
        </button>

      </div>
    </div>
  );
}

export default CharacterSelectPage;
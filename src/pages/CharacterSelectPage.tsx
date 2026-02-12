import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { memberApi } from "../api/memberApi";
import { useAuthStore } from "../store/useAuthStore";
import { AxiosError } from "axios";

function CharacterSelectPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // 일반 가입 시 넘어오는 데이터
  const { email, password, userNickname } = location.state || {};

  // ✨ 소셜 로그인 유저인지 확인
  const { user, isLoggedIn, setUser } = useAuthStore();
  const isSocialUser = isLoggedIn && user;

  // ✨ [추가] 중복 클릭 방지용 로딩 상태
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
    if (isSocialUser && user?.characterNickname) {
      setCharacterNickname(user.characterNickname);
    }
  }, [isSocialUser, user]);

  const prev = () => setIndex((prev) => (prev - 1 + characters.length) % characters.length);
  const next = () => setIndex((prev) => (prev + 1) % characters.length);

  const handleStart = async () => {
    if (!characterNickname.trim()) {
      alert("캐릭터의 이름을 지어주세요!");
      return;
    }

    const selectedCharacter = characters[index];

    // ✨ 로딩 시작 (버튼 비활성화)
    setIsSubmitting(true);

    try {
      // 🚀 1. 소셜 로그인 유저일 경우 (API 2개 연달아 호출)
      if (isSocialUser) {
        // (1) 캐릭터 종류 변경
        await memberApi.updateCharacter({ characterSeq: selectedCharacter.seq });

        // (2) 캐릭터 이름 변경
        await memberApi.updateCharacterName({ characterName: characterNickname });

        // (3) 스토어 정보 수동 업데이트
        if (user) {
          setUser({
            ...user,
            characterSeq: selectedCharacter.seq,
            characterNickname: characterNickname
          });
        }

        alert("캐릭터 설정이 완료되었습니다! 🎉");
        navigate("/app/home", { replace: true });
      }
      // 🚀 2. 일반 회원가입 유저일 경우
      else {
        if (!email || !password || !userNickname) {
          alert("가입 정보가 부족합니다. 처음부터 다시 시도해주세요.");
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

    } catch (error) {
      console.error(error);
      const err = error as AxiosError<{ message: string }>;
      const msg = err.response?.data?.message || "처리 중 오류가 발생했습니다.";
      alert(msg);
    } finally {
      // ✨ 로딩 종료 (성공하든 실패하든 버튼 다시 활성화)
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-150px)] flex items-center justify-center bg-white px-6">
      <div className="flex flex-col items-center text-center gap-4 w-full max-w-md">

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
          <button onClick={prev} className="text-2xl text-slate-300 hover:text-slate-500 transition-colors p-2">◀</button>
          <span className="text-xl font-bold tracking-widest uppercase min-w-[80px]">{characters[index].name}</span>
          <button onClick={next} className="text-2xl text-slate-300 hover:text-slate-500 transition-colors p-2">▶</button>
        </div>

        <div className="flex flex-col items-center gap-3 min-h-[90px] px-4">
          <div className="flex flex-wrap justify-center gap-2">
            {characters[index].keywords.map((keyword, i) => (
              <span key={i} className="text-[10px] sm:text-xs font-bold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full border border-primary-100">
                {keyword}
              </span>
            ))}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 break-keep leading-relaxed max-w-[320px]">
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
                        text-sm text-slate-700 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all placeholder-transparent"
            placeholder=" "
          />
          <label
            htmlFor="characterNickname"
            className="absolute left-4 top-3.5 text-sm text-slate-400 transition-all cursor-text bg-white px-1
                        peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-xs peer-focus:text-primary-600 peer-focus:font-bold
                        peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400
                        peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-primary-600 peer-[:not(:placeholder-shown)]:font-bold"
          >
            캐릭터 이름
          </label>
        </div>

        {/* ✨ 로딩 상태에 따라 스타일과 텍스트가 바뀌는 스마트 버튼 */}
        <button
          onClick={handleStart}
          disabled={isSubmitting} // 로딩 중 클릭 방지
          className={`w-full max-w-[320px] rounded-xl py-4 text-sm font-bold text-white tracking-wider shadow-lg transform transition-all mt-2
                    ${isSubmitting
              ? "bg-slate-400 cursor-not-allowed" // 로딩 중 스타일 (회색)
              : "bg-primary-600 hover:bg-primary-700 shadow-primary-200 hover:shadow-primary-300 active:scale-[0.98]" // 평소 스타일 (파란색)
            }`}
        >
          {isSubmitting
            ? "잠시만 기다려주세요... ⏳"
            : (isSocialUser ? "캐릭터 설정 완료! 🎉" : "회원가입 완료하기 ✨")
          }
        </button>

      </div>
    </div>
  );
}

export default CharacterSelectPage;
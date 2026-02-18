import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function RegisterNicknamePage() {
    const [nickname, setNickname] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    // 이전 페이지에서 받은 email, password
    const { email, password } = location.state || {};

    return (
        // ✨ [수정] 전체 배경: dark:bg-slate-900
        <div className="min-h-[calc(100vh-150px)] flex justify-center items-center bg-white dark:bg-slate-900 transition-colors duration-300">

            {/* ✨ [수정] 박스 스타일: dark:bg-slate-800 dark:border-slate-700 */}
            <div className="rounded-2xl border border-primary-200 shadow-md bg-white dark:bg-slate-800 dark:border-slate-700 px-10 py-10 w-[380px] transition-colors duration-300">

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">닉네임 설정</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">버디가 부를 당신의 이름을 알려주세요.</p>
                </div>

                <form
                    className="flex flex-col gap-6"
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!nickname.trim()) return;

                        navigate("/auth/register/character", {
                            state: {
                                email: email,
                                password: password,
                                userNickname: nickname
                            }
                        });
                    }}
                >
                    {/* NICKNAME INPUT AREA */}
                    <div className="relative">
                        <input
                            type="text"
                            id="nickname"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            // ✨ [수정] 입력창 스타일 (다크모드)
                            className="peer w-full rounded-md bg-white border border-primary-200 px-4 py-3 
                            text-sm text-slate-700 focus:outline-none focus:border-primary-400 placeholder-transparent
                            dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:focus:border-primary-500 transition-colors"
                            placeholder=" "
                        />

                        {/* Floating Label */}
                        <label
                            htmlFor="nickname"
                            // ✨ [수정] 라벨 배경색 (다크모드 시 박스 색과 동일하게 dark:bg-slate-800)
                            className="absolute left-4 top-3 text-sm text-slate-400 transition-all cursor-text bg-white px-1
                            peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:text-primary-600 peer-focus:font-bold
                            peer-placeholder-shown:top-3 peer-placeholder-shown:left-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400
                            peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-primary-600 peer-[:not(:placeholder-shown)]:font-bold
                            
                            dark:bg-slate-800 dark:peer-focus:bg-slate-800 dark:peer-[:not(:placeholder-shown)]:bg-slate-800 
                            dark:peer-focus:text-primary-400 dark:peer-[:not(:placeholder-shown)]:text-primary-400"
                        >
                            닉네임
                        </label>
                    </div>

                    <button
                        type="submit"
                        // ✨ [수정] 버튼 그림자 제거 (다크모드)
                        className="mt-2 w-full rounded-md bg-primary-600 py-3 text-sm font-medium text-white
                        tracking-[0.08em] hover:bg-primary-700 shadow-md shadow-primary-300/40 dark:shadow-none transition-all active:scale-[0.98]"
                    >
                        NEXT
                    </button>
                </form>

            </div>
        </div>
    );
}

export default RegisterNicknamePage;
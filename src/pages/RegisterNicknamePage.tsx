import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function RegisterNicknamePage() {
    const [nickname, setNickname] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    // 이전 페이지에서 받은 email, password
    const { email, password } = location.state || {};

    return (
        <div className="min-h-[calc(100vh-150px)] flex justify-center items-center bg-white">
            <div className="rounded-2xl border border-primary-200 shadow-md bg-white px-10 py-10 w-[380px]">

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
                        {/* ✨ 아이콘 제거됨 */}

                        <input
                            type="text"
                            id="nickname"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            // ✨ px-8 -> px-4 변경 (아이콘 공간 삭제)
                            className="peer w-full rounded-md bg-white border border-primary-200 px-4 py-3 
                            text-sm text-slate-700 focus:outline-none focus:border-primary-400 placeholder-transparent"
                            placeholder=" "
                        />

                        {/* Floating Label */}
                        <label
                            htmlFor="nickname"
                            // ✨ left-8 -> left-4 변경 (입력 텍스트 시작점과 맞춤)
                            className="absolute left-4 top-3 text-sm text-slate-400 transition-all cursor-text bg-white px-1
                            peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:text-primary-600 peer-focus:font-bold
                            peer-placeholder-shown:top-3 peer-placeholder-shown:left-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400
                            peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-primary-600 peer-[:not(:placeholder-shown)]:font-bold"
                        >
                            닉네임
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="mt-2 w-full rounded-md bg-primary-600 py-3 text-sm font-medium text-white
                        tracking-[0.08em] hover:bg-primary-700 shadow-md shadow-primary-300/40 transition"
                    >
                        NEXT
                    </button>
                </form>

            </div>
        </div>
    );
}

export default RegisterNicknamePage;
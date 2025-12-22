import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";


function RegisterNicknamePage() {
    const [nickname, setNickname] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    // 이전 페이지(RegisterPage)에서 보낸 ID, PW 받기
    const { userId, password } = location.state || {};


    return (
        <div className="min-h-[calc(100vh-150px)] flex justify-center items-center bg-white">

            {/* 닉네임 입력 카드 */}
            <div className="rounded-2xl border border-primary-200 shadow-md bg-white px-10 py-10 w-[380px]">

                {/* 닉네임 폼 */}
                <form
                    className="flex flex-col gap-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!nickname.trim()) return; // 빈칸이면 안 넘어감

                        // ✨ [중요] 닉네임을 들고 다음 페이지로 이동!
                        navigate("/auth/register/character", {
                            state: {
                                userId: userId,       // 받아서 그대로 넘김
                                password: password,   // 받아서 그대로 넘김
                                userNickname: nickname
                            }
                        });
                    }}
                >
                    {/* NICKNAME 입력 */}
                    <input
                        type="text"
                        placeholder="NICKNAME"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="w-full rounded-md bg-primary-50 border border-primary-100 px-4 py-3
            text-sm text-slate-800 focus:outline-none focus:border-primary-300"
                    />

                    {/* NEXT 버튼 */}
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

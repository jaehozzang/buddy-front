import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function RegisterNicknamePage() {
    const [nickname, setNickname] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    // 이전 페이지에서 받은 email, password (명세서에 맞게 userId -> email로 변경)
    const { email, password } = location.state || {};

    return (
        <div className="min-h-[calc(100vh-150px)] flex justify-center items-center bg-white">
            <div className="rounded-2xl border border-primary-200 shadow-md bg-white px-10 py-10 w-[380px]">

                <form
                    className="flex flex-col gap-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!nickname.trim()) return;

                        // ✨ [중요] 이메일, 비번, 닉네임을 다 들고 캐릭터 선택으로 이동!
                        navigate("/auth/register/character", {
                            state: {
                                email: email,       // 그대로 전달
                                password: password, // 그대로 전달
                                userNickname: nickname
                            }
                        });
                    }}
                >
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500 text-sm">🏷️</span>
                        <input
                            type="text"
                            placeholder="NICKNAME"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="w-full rounded-md bg-white border border-primary-200 px-10 py-3 
                            text-sm text-slate-700 focus:outline-none focus:border-primary-400"
                        />
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
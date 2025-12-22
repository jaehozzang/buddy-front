import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore"; // 스토어 불러오기

export default function SettingsPage() {
  const navigate = useNavigate();

  // 1. 스토어에서 유저 정보와 로그아웃 함수 가져오기
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    // 2. 로그아웃 실행 (저장된 정보 삭제 & isLoggedIn = false)
    logout();

    // 3. 로그인 화면으로 이동 (replace: true 하면 뒤로가기 못함)
    navigate("/auth/login", { replace: true });
  };

  return (
    <div className="max-w-md mx-auto px-6 py-8 space-y-8">
      <h2 className="text-2xl font-bold text-slate-800">설정</h2>

      {/* 내 정보 카드 */}
      <div className="bg-white p-6 rounded-2xl border border-primary-200 shadow-sm flex items-center gap-4">
        {/* 프로필 이미지 영역 */}
        <div className="w-14 h-14 rounded-full bg-primary-100 border border-primary-200 flex items-center justify-center text-2xl">
          {/* 캐릭터 타입에 따라 이모지나 이미지를 보여줘도 좋아요 */}
          😊
        </div>
        <div>
          <p className="text-xs text-slate-400 font-bold mb-1">SIGNED IN AS</p>
          <p className="text-lg font-bold text-slate-800">{user?.nickname || "알 수 없음"}</p>
        </div>
      </div>

      {/* 설정 메뉴들 (나중에 기능 추가 가능) */}
      <div className="space-y-3">
        <button className="w-full text-left px-4 py-3 bg-white rounded-xl text-slate-600 text-sm hover:bg-slate-50 transition">
          🔔 알림 설정
        </button>
        <button className="w-full text-left px-4 py-3 bg-white rounded-xl text-slate-600 text-sm hover:bg-slate-50 transition">
          👤 계정 정보 수정
        </button>
      </div>

      <hr className="border-slate-100" />

      {/* 로그아웃 버튼 (빨간색으로 강조) */}
      <button
        onClick={handleLogout}
        className="w-full py-4 rounded-xl bg-red-50 text-red-500 font-bold text-sm border border-red-100 hover:bg-red-100 transition shadow-sm"
      >
        로그아웃
      </button>

      {/* 👇 개발용 데이터 확인 박스 (나중에 지우면 됨) */}
      <div className="mt-8 p-4 bg-slate-800 rounded-xl overflow-hidden">
        <p className="text-xs text-slate-400 font-bold mb-2">DEVELOPER MODE (DATA CHECK)</p>
        <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>

      <div className="text-center">
        <p className="text-xs text-slate-300">Buddy App v1.0.0</p>
      </div>
    </div>
  );
}
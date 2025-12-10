// src/pages/DiaryPage.tsx
type DiaryPageProps = {
  mode: "create" | "edit";
};

export default function DiaryPage({ mode }: DiaryPageProps) {
  return <div>일기 {mode === "create" ? "작성" : "수정"} 페이지</div>;
}

// 層: コンポーネント層 (生徒管理UI)
// 責務: 指定生徒の成績履歴一覧を表示し、将来的に成績追加・編集UIを提供

interface Props {
  studentId: string;
}

export default function GradeList({ studentId }: Props) {
  // TODO: studentId を使って Supabase から成績を取得
  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <div className="px-4 py-2 text-xs text-slate-500">
        成績履歴（生徒ID: {studentId}）
      </div>
      <div className="px-4 py-4 text-sm text-slate-500">
        成績データはまだ実装されていません。
      </div>
    </div>
  );
}


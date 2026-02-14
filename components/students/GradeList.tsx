// 層: コンポーネント層 (生徒管理UI)
// 責務: 指定生徒の成績履歴一覧を表示し、将来的に成績追加・編集UIを提供

interface Props {
  studentId: string;
}

export default function GradeList({ studentId }: Props) {
  // TODO: studentId を使って Supabase から成績を取得
  return (
    <div className="card shadow-sm">
      <div className="card-header">
        成績履歴 <span className="badge bg-secondary">{studentId.slice(0, 8)}...</span>
      </div>
      <div className="card-body">
        <div className="alert alert-info mb-0" role="alert">
          成績データはまだ実装されていません。
        </div>
      </div>
    </div>
  );
}


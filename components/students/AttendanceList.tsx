// 層: コンポーネント層 (生徒管理UI)
// 責務: 指定生徒の出席履歴一覧を表示し、将来的に追加・編集操作のUIを提供

interface Props {
  studentId: string;
}

export default function AttendanceList({ studentId }: Props) {
  // TODO: studentId を使って Supabase から出席を取得
  return (
    <div className="card shadow-sm">
      <div className="card-header">
        出席履歴 <span className="badge bg-secondary">{studentId.slice(0, 8)}...</span>
      </div>
      <div className="card-body">
        <div className="alert alert-info mb-0" role="alert">
          出席データはまだ実装されていません。
        </div>
      </div>
    </div>
  );
}


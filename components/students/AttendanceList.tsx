interface Props {
  studentId: string;
}

export default function AttendanceList({ studentId }: Props) {
  // TODO: studentId を使って Supabase から出席を取得
  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <div className="px-4 py-2 text-xs text-slate-500">
        出席履歴（生徒ID: {studentId}）
      </div>
      <div className="px-4 py-4 text-sm text-slate-500">
        出席データはまだ実装されていません。
      </div>
    </div>
  );
}


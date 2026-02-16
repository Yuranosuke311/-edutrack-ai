// 層: コンポーネント層 (生徒管理UI)
// 責務: 指定生徒の出席履歴一覧を表示（attendances から取得したデータを表示）

interface Attendance {
  id: string;
  lesson_date: string;
  status: string;
  memo: string | null;
}

interface Props {
  studentId: string;
  attendances: Attendance[];
}

export default function AttendanceList({ studentId, attendances }: Props) {
  const statusLabel: Record<string, string> = {
    present: "出席",
    absent: "欠席",
    late: "遅刻",
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header">
        出席履歴 <span className="badge bg-secondary">{studentId.slice(0, 8)}...</span>
      </div>
      <div className="card-body p-0">
        {!attendances || attendances.length === 0 ? (
          <div className="p-3 text-muted small">出席データはまだありません。</div>
        ) : (
          <ul className="list-group list-group-flush">
            {attendances
              .sort((a, b) => b.lesson_date.localeCompare(a.lesson_date))
              .map((a) => (
                <li key={a.id} className="list-group-item py-2">
                  <div className="d-flex justify-content-between align-items-start">
                    <span className="fw-medium">{a.lesson_date}</span>
                    <span className={`badge ${a.status === "present" ? "bg-success" : a.status === "absent" ? "bg-danger" : "bg-warning"}`}>
                      {statusLabel[a.status] ?? a.status}
                    </span>
                  </div>
                  {a.memo ? <p className="small text-muted mb-0 mt-1">{a.memo}</p> : null}
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}

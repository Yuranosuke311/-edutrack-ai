// 層: コンポーネント層 (生徒管理UI)
// 責務: 指定生徒の成績履歴一覧を表示（grades から取得したデータを表示）

interface Grade {
  id: string;
  test_name: string;
  score: number;
  max_score: number;
  comment: string | null;
  test_date: string;
}

interface Props {
  studentId: string;
  grades: Grade[];
}

export default function GradeList({ studentId, grades }: Props) {
  return (
    <div className="card shadow-sm">
      <div className="card-header">
        成績履歴 <span className="badge bg-secondary">{studentId.slice(0, 8)}...</span>
      </div>
      <div className="card-body p-0">
        {!grades || grades.length === 0 ? (
          <div className="p-3 text-muted small">成績データはまだありません。</div>
        ) : (
          <ul className="list-group list-group-flush">
            {grades
              .sort((a, b) => b.test_date.localeCompare(a.test_date))
              .map((g) => (
                <li key={g.id} className="list-group-item py-2">
                  <div className="d-flex justify-content-between align-items-start">
                    <span className="fw-medium">{g.test_name}</span>
                    <span className="badge bg-secondary">
                      {g.score} / {g.max_score}
                    </span>
                  </div>
                  <div className="small text-muted">{g.test_date}</div>
                  {g.comment ? <p className="small mb-0 mt-1">{g.comment}</p> : null}
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}

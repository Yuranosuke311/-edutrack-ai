// 層: コンポーネント層 (管理者UI)
// 責務: 教師ユーザー一覧を表示し、将来的に追加・編集・削除操作のUIを提供

// TODO: Supabase から教師一覧を取得する
const dummyTeachers = [
  { id: "t1", name: "管理者 太郎", email: "admin@example.com", role: "admin" },
  { id: "t2", name: "教師 花子", email: "teacher@example.com", role: "teacher" },
];

export default function TeacherTable() {
  return (
    <div className="card shadow-sm">
      <div className="card-body p-0">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th>氏名</th>
              <th>メールアドレス</th>
              <th>ロール</th>
            </tr>
          </thead>
          <tbody>
            {dummyTeachers.map((t) => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td>{t.email}</td>
                <td>
                  <span className={`badge bg-${t.role === "admin" ? "primary" : "secondary"}`}>
                    {t.role === "admin" ? "管理者" : "教師"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


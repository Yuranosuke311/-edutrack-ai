// 層: コンポーネント層 (管理者UI)
// 責務: 教師ユーザー一覧を表示し、将来的に追加・編集・削除操作のUIを提供

// TODO: Supabase から教師一覧を取得する
const dummyTeachers = [
  { id: "t1", name: "管理者 太郎", email: "admin@example.com", role: "admin" },
  { id: "t2", name: "教師 花子", email: "teacher@example.com", role: "teacher" },
];

export default function TeacherTable() {
  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs text-slate-500">
          <tr>
            <th className="px-4 py-2">氏名</th>
            <th className="px-4 py-2">メールアドレス</th>
            <th className="px-4 py-2">ロール</th>
          </tr>
        </thead>
        <tbody>
          {dummyTeachers.map((t) => (
            <tr key={t.id} className="border-t">
              <td className="px-4 py-2">{t.name}</td>
              <td className="px-4 py-2">{t.email}</td>
              <td className="px-4 py-2 text-xs uppercase">{t.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


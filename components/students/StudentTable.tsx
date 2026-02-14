// 層: コンポーネント層 (生徒管理UI)
// 責務: 生徒一覧をテーブル形式で表示し、生徒詳細ページへのリンクを提供

import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getCurrentProfile } from "@/lib/profile";

export default async function StudentTable() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const supabase = createSupabaseServerClient();
  const isAdmin = profile.role === "admin";

  // RLSにより、教師の場合は自分の担当生徒のみ、管理者の場合は全生徒が取得される
  const { data: students, error } = await supabase
    .from("students")
    .select("id, name, grade_level")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch students:", error);
    return (
      <div className="alert alert-danger" role="alert">
        生徒データの取得に失敗しました。
      </div>
    );
  }

  if (!students || students.length === 0) {
    return (
      <div className="alert alert-info" role="alert">
        {isAdmin ? "生徒データがありません。" : "担当生徒がまだ登録されていません。"}
      </div>
    );
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body p-0">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th>氏名</th>
              <th>学年</th>
              <th className="text-end">操作</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>
                  {s.grade_level ? (
                    <span className="badge bg-secondary">{s.grade_level}</span>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="text-end">
                  <Link
                    href={`/dashboard/students/${s.id}`}
                    className="btn btn-sm btn-outline-primary"
                  >
                    詳細
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


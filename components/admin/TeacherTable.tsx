// 層: コンポーネント層 (管理者UI)
// 責務: 教師ユーザー一覧を表示（Supabase profiles から取得）

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getCurrentProfile } from "@/lib/profile";

export default async function TeacherTable() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") return null;

  const supabase = createSupabaseServerClient();
  const { data: teachers, error } = await supabase
    .from("profiles")
    .select("id, name, email, role")
    .order("created_at", { ascending: true });

  if (error) {
    return (
      <div className="alert alert-danger mb-0">教師一覧の取得に失敗しました。</div>
    );
  }

  if (!teachers?.length) {
    return <div className="alert alert-info mb-0">登録されている教師はいません。</div>;
  }

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
            {teachers.map((t) => (
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


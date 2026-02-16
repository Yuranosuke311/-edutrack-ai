// 層: ページ層 (管理者)
// 責務: 管理者のみがアクセスする教師管理・生徒管理へのエントリーポイント

import TeacherTable from "@/components/admin/TeacherTable";
import AddStudentForm from "@/components/admin/AddStudentForm";
import AddLessonForm from "@/components/admin/AddLessonForm";
import { getCurrentProfile } from "@/lib/profile";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/auth/login");
  }

  if (profile.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div>
      <h1 className="h3 mb-4">管理者メニュー</h1>

      <section className="mb-4">
        <h2 className="h5 mb-3">教師管理</h2>
        <TeacherTable />
      </section>

      <section className="mb-4">
        <h2 className="h5 mb-3">授業スケジュール</h2>
        <p className="small text-muted mb-2">
          <Link href="/dashboard">ダッシュボード</Link>のカレンダーで授業を確認できます。
        </p>
        <AddLessonForm />
      </section>

      <section className="mb-4">
        <h2 className="h5 mb-3">生徒管理</h2>
        <p className="small text-muted mb-2">
          <Link href="/dashboard/students">生徒一覧（全件）</Link>で担当教師の確認・詳細ができます。
        </p>
        <AddStudentForm />
      </section>
    </div>
  );
}


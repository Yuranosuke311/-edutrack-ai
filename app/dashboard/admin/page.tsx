// 層: ページ層 (管理者)
// 責務: 管理者のみがアクセスする教師管理や全体統計へのエントリーポイント

import TeacherTable from "@/components/admin/TeacherTable";
import { getCurrentProfile } from "@/lib/profile";
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
      <section>
        <h2 className="h5 mb-3">教師管理</h2>
        <TeacherTable />
      </section>
    </div>
  );
}


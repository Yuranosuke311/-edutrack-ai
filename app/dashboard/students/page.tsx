// 層: ページ層 (ダッシュボード)
// 責務: RLSされたSupabaseデータを元に生徒一覧を表示する入口

import StudentTable from "@/components/students/StudentTable";
import { getCurrentProfile } from "@/lib/profile";
import { redirect } from "next/navigation";

export default async function StudentsPage() {
  const profile = await getCurrentProfile();
  
  if (!profile) {
    redirect("/auth/login");
  }

  return (
    <div>
      <h1 className="h3 mb-4">
        {profile.role === "admin" ? "生徒一覧（全件）" : "担当生徒一覧"}
      </h1>
      <StudentTable />
    </div>
  );
}


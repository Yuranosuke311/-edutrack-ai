// 層: ページ層 (ダッシュボード)
// 責務: ログイン後トップ画面として統計情報や概要を表示

import DashboardStats from "@/components/DashboardStats";
import { getCurrentProfile } from "@/lib/profile";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  
  if (!profile) {
    redirect("/auth/login");
  }

  const isAdmin = profile.role === "admin";

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">ダッシュボード</h1>
        <div>
          <span className={`badge bg-${isAdmin ? "primary" : "secondary"}`}>
            {profile.name} ({isAdmin ? "管理者" : "教師"})
          </span>
        </div>
      </div>
      <DashboardStats role={profile.role} />
    </div>
  );
}


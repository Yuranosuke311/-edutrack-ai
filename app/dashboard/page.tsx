// 層: ページ層 (ダッシュボード)
// 責務: ログイン後トップ画面として統計情報や概要を表示

import DashboardStats from "@/components/DashboardStats";
import DashboardAuthGuard from "@/components/DashboardAuthGuard";
import { getCurrentProfile } from "@/lib/profile";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();

  // サーバーでプロフィールが取れない場合（ログイン直後でクッキーが届いていない等）は
  // クライアントでセッション確認 → refresh または /auth/login へ。307 で即リダイレクトしない。
  if (!profile) {
    return (
      <div>
        <h1 className="h3 mb-4">ダッシュボード</h1>
        <DashboardAuthGuard />
      </div>
    );
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


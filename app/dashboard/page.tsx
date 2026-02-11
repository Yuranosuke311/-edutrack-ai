import DashboardStats from "@/components/DashboardStats";

export default function DashboardPage() {
  // TODO: ロールごとに表示内容を切り替え（teacher / admin）
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">ダッシュボード</h1>
      <DashboardStats />
    </div>
  );
}


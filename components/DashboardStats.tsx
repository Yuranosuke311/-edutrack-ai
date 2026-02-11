export default function DashboardStats() {
  // TODO: Supabase から統計情報を取得して表示
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-lg bg-white p-4 shadow-sm">
        <p className="text-xs text-slate-500">今月の授業数</p>
        <p className="mt-2 text-2xl font-semibold">-</p>
      </div>
      <div className="rounded-lg bg-white p-4 shadow-sm">
        <p className="text-xs text-slate-500">平均点</p>
        <p className="mt-2 text-2xl font-semibold">-</p>
      </div>
      <div className="rounded-lg bg-white p-4 shadow-sm">
        <p className="text-xs text-slate-500">生徒数 / 教師数</p>
        <p className="mt-2 text-2xl font-semibold">-</p>
      </div>
    </div>
  );
}


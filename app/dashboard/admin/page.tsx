// 層: ページ層 (管理者)
// 責務: 管理者のみがアクセスする教師管理や全体統計へのエントリーポイント

import TeacherTable from "@/components/admin/TeacherTable";

export default function AdminPage() {
  // TODO: 管理者ロールチェックを追加
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">管理者メニュー</h1>
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">教師管理</h2>
        <TeacherTable />
      </section>
    </div>
  );
}


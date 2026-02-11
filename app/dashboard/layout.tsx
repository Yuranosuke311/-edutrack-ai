import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="text-sm font-semibold">EduTrack AI</div>
          <nav className="flex items-center gap-3 text-xs text-slate-600">
            <a href="/dashboard" className="hover:text-slate-900">
              ダッシュボード
            </a>
            <a href="/dashboard/students" className="hover:text-slate-900">
              生徒一覧
            </a>
            <a href="/dashboard/admin" className="hover:text-slate-900">
              管理者メニュー
            </a>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}

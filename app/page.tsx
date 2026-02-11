export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <div className="max-w-xl text-center space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">
          EduTrack AI
        </h1>
        <p className="text-slate-600">
          オンライン教師向けの出席管理・成績記録・AIフィードバック支援アプリです。
        </p>
      </div>
      <a
        href="/auth/login"
        className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
      >
        ログインへ
      </a>
    </main>
  );
}

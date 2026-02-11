// 層: レイアウト層
// 責務: アプリ全体のHTML骨組みと共通スタイル(globals.css)の適用

import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "EduTrack AI",
  description: "出席管理・成績記録アプリ",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}

// 層: ページ層 (ダッシュボード)
// 責務: カレンダーはダッシュボードに統合したため、ここからダッシュボードへリダイレクト

import { redirect } from "next/navigation";

export default function CalendarPage() {
  redirect("/dashboard");
}

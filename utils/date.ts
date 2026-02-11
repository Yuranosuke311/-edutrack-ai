// 層: utils層 (共通ユーティリティ)
// 責務: 日付フォーマットや日付計算などの共通処理を集約

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("ja-JP");
}


// 層: コンポーネント層 (生徒管理UI / フィードバック)
// 責務: 指定生徒のAIフィードバック生成・内容表示・保存/送信ボタンのUIを提供

"use client";

import { useState } from "react";

interface Props {
  studentId: string;
}

export default function FeedbackPanel({ studentId }: Props) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setError(null);
    setLoading(true);
    try {
      // TODO: /api/feedback/generate に student_id を渡して呼び出し
      // const res = await fetch("/api/feedback/generate", { ... });
      // const data = await res.json();
      // setContent(data.content);
    } catch (e) {
      setError("フィードバック生成中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    // TODO: /api/feedback にPOSTして content を保存
  }

  async function handleSend() {
    // TODO: /api/feedback/{id}/send を呼び出してメール送信
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="text-xs text-slate-500">
          フィードバック生成（生徒ID: {studentId}）
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="rounded bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? "生成中..." : "AIで生成"}
        </button>
      </div>
      {error && (
        <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">
          {error}
        </div>
      )}
      <div className="space-y-2 px-4 py-3">
        <textarea
          className="h-40 w-full resize-none rounded border border-slate-200 px-2 py-1 text-sm focus:border-slate-500 focus:outline-none"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="ここにAIが生成したフィードバック文が表示されます"
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleSave}
            className="rounded border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
          >
            保存
          </button>
          <button
            type="button"
            onClick={handleSend}
            className="rounded bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-500"
          >
            メール送信
          </button>
        </div>
      </div>
    </div>
  );
}


// 層: コンポーネント層 (管理者UI)
// 責務: 授業登録フォーム（日付・担当教師・タイトル）と登録済み授業一覧・削除

"use client";

import { FormEvent, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

interface Profile {
  id: string;
  name: string;
  role: string;
}

interface Lesson {
  id: string;
  lesson_at: string;
  teacher_id: string;
  title: string | null;
  created_at: string;
}

export default function AddLessonForm() {
  const [teachers, setTeachers] = useState<Profile[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [lessonAt, setLessonAt] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [title, setTitle] = useState("");

  function getMonthRange() {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextMonth = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
    return [thisMonth, nextMonth];
  }

  async function loadTeachers() {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from("profiles")
      .select("id, name, role")
      .in("role", ["teacher", "admin"])
      .order("name");
    if (data?.length) {
      setTeachers(data);
      if (!teacherId && data[0]) setTeacherId(data[0].id);
    }
  }

  async function loadLessons() {
    const [m1, m2] = getMonthRange();
    const [r1, r2] = await Promise.all([
      fetch(`/api/lessons?month=${m1}`),
      fetch(`/api/lessons?month=${m2}`),
    ]);
    const d1 = r1.ok ? await r1.json() : { lessons: [] };
    const d2 = r2.ok ? await r2.json() : { lessons: [] };
    const combined = [...(d1.lessons ?? []), ...(d2.lessons ?? [])];
    combined.sort((a: Lesson, b: Lesson) => a.lesson_at.localeCompare(b.lesson_at));
    setLessons(combined);
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([loadTeachers(), loadLessons()]);
      setLoading(false);
    })();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitLoading(true);
    try {
      const res = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lesson_at: lessonAt.includes("T") ? new Date(lessonAt).toISOString() : `${lessonAt}T09:00:00.000Z`,
          teacher_id: teacherId || undefined,
          title: title.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error?.message ?? "登録に失敗しました");
        return;
      }
      setSuccess(true);
      setLessonAt("");
      setTitle("");
      loadLessons();
    } catch {
      setError("登録に失敗しました");
    } finally {
      setSubmitLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("この授業を削除しますか？")) return;
    const res = await fetch(`/api/lessons/${id}`, { method: "DELETE" });
    if (res.ok) loadLessons();
  }

  const teacherName = (tid: string) => teachers.find((t) => t.id === tid)?.name ?? tid.slice(0, 8);

  if (loading) {
    return <p className="text-muted small">読み込み中...</p>;
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="row g-2 align-items-end">
          <div className="col-auto">
            <label className="form-label small mb-0">授業日時</label>
            <input
              type="datetime-local"
              className="form-control form-control-sm"
              value={lessonAt}
              onChange={(e) => setLessonAt(e.target.value)}
              required
            />
          </div>
          <div className="col-auto">
            <label className="form-label small mb-0">担当教師</label>
            <select
              className="form-select form-select-sm"
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-auto">
            <label className="form-label small mb-0">タイトル（任意）</label>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="例: 数学"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="col-auto">
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitLoading}>
              {submitLoading ? "登録中..." : "授業を登録"}
            </button>
          </div>
        </div>
      </form>
      {error && <div className="alert alert-danger py-2">{error}</div>}
      {success && <div className="alert alert-success py-2">授業を登録しました。</div>}

      <h3 className="h6 mb-2">登録済み授業（今月・来月）</h3>
      {lessons.length === 0 ? (
        <p className="text-muted small">登録された授業はありません。</p>
      ) : (
        <ul className="list-group list-group-flush">
          {lessons.map((l) => (
            <li
              key={l.id}
              className="list-group-item d-flex justify-content-between align-items-center py-2"
            >
              <span>
                {l.lesson_at ? new Date(l.lesson_at).toLocaleString("ja-JP", { dateStyle: "short", timeStyle: "short" }) : ""} — {teacherName(l.teacher_id)}
                {l.title ? `（${l.title}）` : ""}
              </span>
              <div className="d-flex align-items-center gap-2">
                <a href={`/dashboard/lessons/${l.id}`} className="btn btn-sm btn-outline-primary">
                  詳細・出席
                </a>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDelete(l.id)}
                >
                  削除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

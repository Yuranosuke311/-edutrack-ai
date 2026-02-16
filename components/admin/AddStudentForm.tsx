// 層: コンポーネント層 (管理者UI)
// 責務: 生徒追加フォーム（担当教師選択含む）。管理者のみ表示想定。

"use client";

import { FormEvent, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

interface Profile {
  id: string;
  name: string;
  role: string;
}

export default function AddStudentForm() {
  const [teachers, setTeachers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [name, setName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [memo, setMemo] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowserClient();
      const { data, error: e } = await supabase
        .from("profiles")
        .select("id, name, role")
        .in("role", ["teacher", "admin"])
        .order("name");
      if (!e && data?.length) {
        setTeachers(data);
        if (!teacherId && data[0]) setTeacherId(data[0].id);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: insertError } = await supabase.from("students").insert({
        name: name.trim(),
        grade_level: gradeLevel.trim() || null,
        teacher_id: teacherId || null,
        student_email: studentEmail.trim() || null,
        parent_email: parentEmail.trim() || null,
        memo: memo.trim() || null,
      });

      if (insertError) {
        setError(insertError.message);
        return;
      }

      setSuccess(true);
      setName("");
      setGradeLevel("");
      setStudentEmail("");
      setParentEmail("");
      setMemo("");
      if (teachers[0]) setTeacherId(teachers[0].id);
    } catch (err) {
      setError("登録に失敗しました");
    } finally {
      setSubmitLoading(false);
    }
  }

  if (loading) {
    return <div className="text-muted small">担当教師一覧を読み込み中...</div>;
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h3 className="h6 mb-3">生徒を追加</h3>
        {error && (
          <div className="alert alert-danger py-2 small" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success py-2 small" role="alert">
            生徒を追加しました。
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <label className="form-label small mb-0">氏名 *</label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="山田 太郎"
            />
          </div>
          <div className="mb-2">
            <label className="form-label small mb-0">学年</label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              placeholder="中3, 高1 など"
            />
          </div>
          <div className="mb-2">
            <label className="form-label small mb-0">担当教師 *</label>
            <select
              className="form-select form-select-sm"
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              required
            >
              <option value="">選択してください</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}（{t.role === "admin" ? "管理者" : "教師"}）
                </option>
              ))}
            </select>
          </div>
          <div className="mb-2">
            <label className="form-label small mb-0">生徒メール</label>
            <input
              type="email"
              className="form-control form-control-sm"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              placeholder="student@example.com"
            />
          </div>
          <div className="mb-2">
            <label className="form-label small mb-0">保護者メール</label>
            <input
              type="email"
              className="form-control form-control-sm"
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
              placeholder="parent@example.com"
            />
          </div>
          <div className="mb-3">
            <label className="form-label small mb-0">メモ</label>
            <textarea
              className="form-control form-control-sm"
              rows={2}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="備考"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={submitLoading}
          >
            {submitLoading ? "登録中..." : "生徒を追加"}
          </button>
        </form>
      </div>
    </div>
  );
}

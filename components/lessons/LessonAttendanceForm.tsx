// 層: コンポーネント層 (授業詳細)
// 責務: 担当生徒ごとの出席・授業メモ入力・保存と、同一画面でのFB作成・送信

"use client";

import { useState } from "react";
import { Card, Form, Button, Alert } from "react-bootstrap";

interface Student {
  id: string;
  name: string;
}

interface Props {
  lessonId: string;
  lessonDate: string;
  students: Student[];
  initialAttendances: Record<string, { status: string; memo: string | null }>;
}

export default function LessonAttendanceForm({
  lessonDate,
  students,
  initialAttendances,
}: Props) {
  const [state, setState] = useState<Record<string, { status: string; memo: string }>>(() => {
    const init: Record<string, { status: string; memo: string }> = {};
    students.forEach((s) => {
      const a = initialAttendances[s.id];
      init[s.id] = {
        status: a?.status ?? "present",
        memo: a?.memo ?? "",
      };
    });
    return init;
  });
  const [fbContent, setFbContent] = useState<Record<string, string>>({});
  const [fbId, setFbId] = useState<Record<string, string | null>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [fbLoading, setFbLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function setStudentState(
    studentId: string,
    field: "status" | "memo",
    value: string
  ) {
    setState((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  }

  async function saveOne(studentId: string) {
    const s = state[studentId];
    if (!s) return;
    setError(null);
    setSaving(studentId);
    try {
      const res = await fetch("/api/attendances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          lesson_date: lessonDate,
          status: s.status,
          memo: s.memo.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error?.message ?? "保存に失敗しました");
        return;
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } finally {
      setSaving(null);
    }
  }

  async function generateFb(studentId: string) {
    setError(null);
    setFbLoading(studentId);
    try {
      const res = await fetch("/api/feedback/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error?.message ?? "生成に失敗しました");
      setFbContent((prev) => ({ ...prev, [studentId]: data.content ?? "" }));
      setFbId((prev) => ({ ...prev, [studentId]: null }));
    } catch (e: any) {
      setError(e?.message ?? "フィードバック生成に失敗しました");
    } finally {
      setFbLoading(null);
    }
  }

  async function saveFb(studentId: string) {
    const content = fbContent[studentId]?.trim();
    if (!content) {
      setError("保存する内容がありません。");
      return;
    }
    setError(null);
    setFbLoading(studentId);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId, content }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error?.message ?? "保存に失敗しました");
      setFbId((prev) => ({ ...prev, [studentId]: data.id ?? null }));
    } catch (e: any) {
      setError(e?.message ?? "保存に失敗しました");
    } finally {
      setFbLoading(null);
    }
  }

  async function sendFb(studentId: string) {
    const id = fbId[studentId];
    if (!id) {
      setError("先にフィードバックを保存してください。");
      return;
    }
    setError(null);
    setFbLoading(studentId);
    try {
      const res = await fetch(`/api/feedback/${id}/send`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error?.message ?? "送信に失敗しました");
    } catch (e: any) {
      setError(e?.message ?? "送信に失敗しました");
    } finally {
      setFbLoading(null);
    }
  }

  if (students.length === 0) {
    return (
      <div className="alert alert-info">
        この授業に紐づく担当生徒がいません。生徒の担当教師を設定してください。
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-3">
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">保存しました。</Alert>}
      {students.map((student) => (
        <Card key={student.id} className="shadow-sm">
          <Card.Header className="py-2 d-flex justify-content-between align-items-center">
            <span className="fw-medium">{student.name}</span>
            <Button
              size="sm"
              variant="primary"
              onClick={() => saveOne(student.id)}
              disabled={saving === student.id}
            >
              {saving === student.id ? "保存中..." : "保存"}
            </Button>
          </Card.Header>
          <Card.Body className="py-2">
            <Form.Group className="mb-2">
              <Form.Label className="small mb-1">出欠</Form.Label>
              <Form.Select
                size="sm"
                value={state[student.id]?.status ?? "present"}
                onChange={(e) => setStudentState(student.id, "status", e.target.value)}
              >
                <option value="present">出席</option>
                <option value="absent">欠席</option>
                <option value="late">遅刻</option>
              </Form.Select>
            </Form.Group>
            <Form.Group>
              <Form.Label className="small mb-1">授業メモ（その日の様子・AIフィードバックに反映）</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="例: 図形の証明を丁寧に説明。次回は演習を多めに。"
                value={state[student.id]?.memo ?? ""}
                onChange={(e) => setStudentState(student.id, "memo", e.target.value)}
              />
            </Form.Group>
            <hr className="my-2" />
            <Form.Label className="small mb-1">フィードバック（ここで作成・送信まで可能）</Form.Label>
            <div className="d-flex gap-1 mb-2">
              <Button
                size="sm"
                variant="outline-primary"
                onClick={() => generateFb(student.id)}
                disabled={fbLoading === student.id}
              >
                {fbLoading === student.id ? "処理中..." : "AIで生成"}
              </Button>
              <Button
                size="sm"
                variant="outline-secondary"
                onClick={() => saveFb(student.id)}
                disabled={fbLoading === student.id || !(fbContent[student.id]?.trim())}
              >
                保存
              </Button>
              <Button
                size="sm"
                variant="outline-success"
                onClick={() => sendFb(student.id)}
                disabled={fbLoading === student.id || !fbId[student.id]}
              >
                メール送信
              </Button>
            </div>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="AIで生成したフィードバック文がここに表示されます。編集してから保存・送信できます。"
              value={fbContent[student.id] ?? ""}
              onChange={(e) => setFbContent((prev) => ({ ...prev, [student.id]: e.target.value }))}
            />
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}

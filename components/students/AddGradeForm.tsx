// 層: コンポーネント層 (生徒管理UI)
// 責務: 成績記入フォーム（grades テーブル設計に沿って POST /api/grades）

"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Form, Button, Alert } from "react-bootstrap";

interface Props {
  studentId: string;
  onSaved?: () => void;
}

export default function AddGradeForm({ studentId, onSaved }: Props) {
  const router = useRouter();
  const [testName, setTestName] = useState("");
  const [score, setScore] = useState("");
  const [maxScore, setMaxScore] = useState("");
  const [comment, setComment] = useState("");
  const [testDate, setTestDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const s = parseInt(score, 10);
    const m = parseInt(maxScore, 10);
    if (Number.isNaN(s) || Number.isNaN(m) || s < 0 || m <= 0 || s > m) {
      setError("得点は 0 以上、満点は 1 以上、得点 ≦ 満点にしてください。");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          test_name: testName.trim(),
          score: s,
          max_score: m,
          comment: comment.trim() || null,
          test_date: testDate,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error?.message ?? "登録に失敗しました");
        return;
      }
      setSuccess(true);
      setTestName("");
      setScore("");
      setMaxScore("");
      setComment("");
      setTestDate("");
      onSaved?.();
      router.refresh();
    } catch {
      setError("登録に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="shadow-sm">
      <Card.Header className="py-2">成績を追加</Card.Header>
      <Card.Body>
        <form onSubmit={handleSubmit}>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">登録しました。</Alert>}
          <Form.Group className="mb-2">
            <Form.Label className="small">テスト名</Form.Label>
            <Form.Control
              type="text"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              placeholder="例: 中間テスト"
              required
            />
          </Form.Group>
          <div className="row g-2 mb-2">
            <div className="col-6">
              <Form.Label className="small">得点</Form.Label>
              <Form.Control
                type="number"
                min={0}
                value={score}
                onChange={(e) => setScore(e.target.value)}
                required
              />
            </div>
            <div className="col-6">
              <Form.Label className="small">満点</Form.Label>
              <Form.Control
                type="number"
                min={1}
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                required
              />
            </div>
          </div>
          <Form.Group className="mb-2">
            <Form.Label className="small">受験日</Form.Label>
            <Form.Control
              type="date"
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label className="small">コメント（任意）</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </Form.Group>
          <Button type="submit" size="sm" variant="primary" disabled={loading}>
            {loading ? "登録中..." : "登録"}
          </Button>
        </form>
      </Card.Body>
    </Card>
  );
}

// 層: コンポーネント層 (生徒管理UI / フィードバック)
// 責務: 指定生徒のAIフィードバック生成・内容表示・保存/送信ボタンのUIを提供

"use client";

import { useState } from "react";
import { Card, Button, Form, Alert, Badge } from "react-bootstrap";

interface Props {
  studentId: string;
}

export default function FeedbackPanel({ studentId }: Props) {
  const [content, setContent] = useState<string>("");
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/feedback/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? "生成APIの呼び出しに失敗しました");
      }

      const data = (await res.json()) as { content: string };
      setContent(data.content ?? "");
      // 新規生成時はまだDBに保存されていないので、feedbackIdはクリアしておく
      setFeedbackId(null);
    } catch (e) {
      setError("フィードバック生成中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setError(null);
    setLoading(true);
    try {
      if (!content.trim()) {
        setError("保存するフィードバック内容がありません。");
        return;
      }

      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId, content }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? "保存APIの呼び出しに失敗しました");
      }

      const data = (await res.json()) as { id: string };
      setFeedbackId(data.id);
    } catch (e) {
      setError("フィードバック保存中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    setError(null);
    setLoading(true);
    try {
      if (!feedbackId) {
        setError("まずフィードバックを保存してから送信してください。");
        return;
      }

      const res = await fetch(`/api/feedback/${feedbackId}/send`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? "送信APIの呼び出しに失敗しました");
      }
    } catch (e) {
      setError("フィードバック送信中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="shadow-sm">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div className="text-muted small">
          フィードバック生成 <Badge bg="secondary">{studentId.slice(0, 8)}...</Badge>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? "生成中..." : "AIで生成"}
        </Button>
      </Card.Header>
      {error && (
        <Alert variant="danger" className="mb-0 rounded-0">
          {error}
        </Alert>
      )}
      <Card.Body>
        <Form.Group className="mb-3">
          <Form.Control
            as="textarea"
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="ここにAIが生成したフィードバック文が表示されます"
          />
        </Form.Group>
        <div className="d-flex justify-content-end gap-2">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handleSave}
            disabled={loading || !content.trim()}
          >
            保存
          </Button>
          <Button
            variant="success"
            size="sm"
            onClick={handleSend}
            disabled={loading || !feedbackId}
          >
            メール送信
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}


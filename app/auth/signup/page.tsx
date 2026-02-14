// 層: ページ層 (認証)
// 責務: 教師/管理者ユーザーの新規登録フォームとSupabase Auth＋profilesテーブル登録の入口

"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();

      // 1. Supabase Authでサインアップ
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        let errorMessage = "登録に失敗しました";
        if (signUpError.message.includes("already registered")) {
          errorMessage = "このメールアドレスは既に登録されています";
        } else if (signUpError.message.includes("Password")) {
          errorMessage = "パスワードは6文字以上である必要があります";
        } else if (
          signUpError.message.includes("rate limit") ||
          signUpError.message.includes("Rate limit") ||
          signUpError.message.includes("too many requests") ||
          signUpError.message.includes("Too many requests")
        ) {
          errorMessage =
            "メール送信のレート制限に達しました。しばらく時間をおいてから再度お試しください。";
        } else if (
          signUpError.message.includes("once every") ||
          signUpError.message.includes("60 seconds")
        ) {
          errorMessage =
            "メール送信は60秒に1回までです。しばらく時間をおいてから再度お試しください。";
        } else {
          errorMessage = signUpError.message;
        }
        setError(errorMessage);
        return;
      }

      if (!authData.user) {
        setError("ユーザー作成に失敗しました");
        return;
      }

      // 2. profilesテーブルにレコードを追加（デフォルトでteacherロール）
      const { error: insertError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        name,
        email,
        role: "teacher", // 新規登録時はデフォルトでteacher
      });

      if (insertError) {
        setError("ユーザー情報の登録に失敗しました: " + insertError.message);
        console.error(insertError);
        return;
      }

      // 登録成功時はダッシュボードへリダイレクト
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setError("予期せぬエラーが発生しました");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container fluid className="d-flex min-vh-100 align-items-center justify-content-center bg-light">
      <Card className="w-100" style={{ maxWidth: "400px" }}>
        <Card.Body className="p-4">
          <Card.Title as="h1" className="mb-4 text-center">新規登録</Card.Title>

          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>氏名</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="山田 太郎"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>メールアドレス</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="example@email.com"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>パスワード</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="6文字以上"
              />
              <Form.Text className="text-muted">
                パスワードは6文字以上である必要があります
              </Form.Text>
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              disabled={loading}
              className="w-100 mb-3"
            >
              {loading ? "登録中..." : "登録する"}
            </Button>
          </Form>

          <p className="text-center text-muted mb-0">
            すでにアカウントをお持ちの方は{" "}
            <a href="/auth/login" className="text-decoration-none">
              ログイン
            </a>
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
}

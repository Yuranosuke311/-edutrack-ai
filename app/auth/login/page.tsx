// 層: ページ層 (認証)
// 責務: ログインフォームの表示とSupabase Authによるサインイン処理

"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";

export default function LoginPage() {
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
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // エラーメッセージを日本語に変換
        let errorMessage = "ログインに失敗しました";
        if (signInError.message.includes("Invalid login credentials")) {
          errorMessage = "メールアドレスまたはパスワードが正しくありません";
        } else if (signInError.message.includes("Email not confirmed")) {
          errorMessage = "メールアドレスの確認が完了していません";
        } else if (
          signInError.message.includes("rate limit") ||
          signInError.message.includes("Rate limit") ||
          signInError.message.includes("too many requests") ||
          signInError.message.includes("Too many requests")
        ) {
          errorMessage =
            "メール送信のレート制限に達しました。しばらく時間をおいてから再度お試しください。";
        } else if (
          signInError.message.includes("once every") ||
          signInError.message.includes("60 seconds")
        ) {
          errorMessage =
            "メール送信は60秒に1回までです。しばらく時間をおいてから再度お試しください。";
        } else {
          errorMessage = signInError.message;
        }
        setError(errorMessage);
        setLoading(false);
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      await new Promise((r) => setTimeout(r, 150));
      const userId = sessionData?.session?.user?.id;
      const { data: profile } = userId ? await supabase.from("profiles").select("role").eq("id", userId).single() : { data: null };
      const role = profile?.role ?? "teacher";
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/8f1bfecd-27ef-4e6a-839e-e640c6ddd7ae',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'login/page.tsx:login',message:'login done',data:{role},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
      // #endregion
      window.location.replace(role === "admin" ? "/dashboard/admin" : "/dashboard");
      return;
    } catch (e) {
      setError("予期せぬエラーが発生しました");
      console.error(e);
      setLoading(false);
    }
  }

  return (
    <Container fluid className="d-flex min-vh-100 align-items-center justify-content-center bg-light">
      <Card className="w-100" style={{ maxWidth: "400px" }}>
        <Card.Body className="p-4">
          <Card.Title as="h1" className="mb-4 text-center">ログイン</Card.Title>

          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
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
                placeholder="パスワードを入力"
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              disabled={loading}
              className="w-100 mb-3"
            >
              {loading ? "ログイン中..." : "ログイン"}
            </Button>
          </Form>

          <p className="text-center text-muted mb-0">
            アカウントをお持ちでない方は{" "}
            <a href="/auth/signup" className="text-decoration-none">
              新規登録
            </a>
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
}

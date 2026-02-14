// 層: コンポーネント層 (認証ガード)
// 責務: サーバーでプロフィールが取れなかった場合に、クライアントでセッションを確認して refresh またはログインへリダイレクト

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function DashboardAuthGuard() {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "redirect">("checking");

  useEffect(() => {
    let mounted = true;

    async function check() {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (session) {
        // クライアントにはセッションがあるので、サーバーへ再要求してクッキーを読ませる
        router.refresh();
        return;
      }

      setStatus("redirect");
      window.location.replace("/auth/login");
    }

    check();
    return () => {
      mounted = false;
    };
  }, [router]);

  if (status === "redirect") {
    return (
      <p className="text-muted text-center py-5">ログイン画面へ移動しています...</p>
    );
  }

  return (
    <p className="text-muted text-center py-5">セッションを確認しています...</p>
  );
}

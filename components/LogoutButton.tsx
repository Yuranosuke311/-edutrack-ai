// 層: コンポーネント層 (認証UI)
// 責務: ログアウトボタンの表示とSupabase Authからのサインアウト処理

"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { Button } from "react-bootstrap";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <Button variant="outline-secondary" size="sm" onClick={handleLogout}>
      ログアウト
    </Button>
  );
}

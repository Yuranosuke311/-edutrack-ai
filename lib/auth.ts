// 層: lib層 (認可/認証ヘルパー)
// 責務: Route Handlerなどサーバー側でログイン必須の処理に対するユーザー取得・UNAUTHORIZED判定

import { createSupabaseServerClient } from "./supabase-server";

export async function requireAuth() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const error = new Error("UNAUTHORIZED");
    (error as any).code = "UNAUTHORIZED";
    throw error;
  }

  return user;
}

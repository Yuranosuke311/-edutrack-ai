// 層: lib層 (認可/認証ヘルパー)
// 責務: Route Handlerなどサーバー側でログイン必須の処理に対するユーザー取得・UNAUTHORIZED判定

import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "./supabase";

export async function requireAuth(req: NextRequest) {
  const supabase = createSupabaseServerClient(() => {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const entries = cookieHeader.split(";").map((c) => c.trim().split("="));
    return Object.fromEntries(entries.filter(([k]) => k));
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const error = new Error("UNAUTHORIZED");
    // @ts-expect-error custom
    (error as any).code = "UNAUTHORIZED";
    throw error;
  }

  return user;
}

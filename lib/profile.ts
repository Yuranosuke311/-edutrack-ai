// 層: lib層 (プロフィール取得ヘルパー)
// 責務: 現在ログイン中のユーザーのプロフィール情報（ロール含む）を取得する

import { createSupabaseServerClient } from "./supabase-server";

export async function getCurrentProfile() {
  const supabase = createSupabaseServerClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, name, email, role")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return null;
  }

  return profile;
}

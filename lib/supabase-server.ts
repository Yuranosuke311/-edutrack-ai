// 層: lib層 (インフラ / サーバー側クライアント生成)
// 責務: Server Component / Route Handler で使用するSupabaseクライアントの生成（cookies対応）

import { createServerClient, type SetAllCookies } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // Route Handler では setAll が呼ばれない場合がある
            // その場合は無視
          }
        },
      },
    }
  );
}

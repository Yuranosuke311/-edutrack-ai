// 層: lib層 (インフラ / クライアント生成)
// 責務: ブラウザ・サーバー両方で利用するSupabaseクライアントの生成

import { createBrowserClient, createServerClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createBrowserClient(url, anonKey);
}

export function createSupabaseServerClient(cookies: () => Record<string, string>) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return Object.entries(cookies()).map(([name, value]) => ({ name, value }));
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>): void {
        cookiesToSet.forEach(() => {
          // Next.jsのRoute Handler / Server Component側で実装予定
        });
      },
    },
  });
}

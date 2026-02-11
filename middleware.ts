// 層: ミドルウェア層
// 責務: 認証が必要なルートへのアクセス制御や共通前処理（将来Supabaseセッションのチェックを実装）

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// TODO: Supabase のセッションを見てリダイレクトを実装

const PUBLIC_PATHS = ["/", "/auth/login", "/auth/signup"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // 将来的に Supabase のセッションチェックを追加
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};


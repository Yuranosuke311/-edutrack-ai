// 層: API Route層 (外部サービス連携)
// 責務: 指定されたフィードバックを保護者メールアドレスへ送信し、送信状態をfeedbacksテーブルに反映

import { NextResponse } from "next/server";
import { sendFeedbackEmail } from "@/lib/email";

interface Params {
  params: { id: string };
}

// POST /api/feedback/[id]/send
export async function POST(_req: Request, { params }: Params) {
  const { id } = params;
  // TODO:
  // 1. Supabase から feedbacks と students をJOINして parent_email と content を取得
  // 2. sendFeedbackEmail(to, content) を呼び出し
  // 3. 成功時に sent=true, sent_at=now() に更新
  console.log("send feedback id:", id);

  const result = await sendFeedbackEmail("dummy@example.com", "ダミーコンテンツ");
  if (!result.success) {
    return NextResponse.json(
      { error: { code: "SEND_FAILED", message: result.error } },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}


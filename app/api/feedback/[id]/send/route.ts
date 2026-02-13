// 層: API Route層 (外部サービス連携)
// 責務: 指定されたフィードバックを保護者メールアドレスへ送信し、送信状態をfeedbacksテーブルに反映

import { NextRequest, NextResponse } from "next/server";
import { sendFeedbackEmail } from "@/lib/email";
import { requireAuth } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase";

interface Params {
  params: { id: string };
}

// POST /api/feedback/[id]/send
export async function POST(req: NextRequest, { params }: Params) {
  const { id } = params;

  try {
    await requireAuth(req);

    const supabase = createSupabaseServerClient(() => {
      const cookieHeader = req.headers.get("cookie") ?? "";
      const entries = cookieHeader.split(";").map((c) => c.trim().split("="));
      return Object.fromEntries(entries.filter(([k]) => k));
    });

    const { data: feedback, error: feedbackError } = await supabase
      .from("feedbacks")
      .select("id, student_id, content, sent, sent_at")
      .eq("id", id)
      .single();

    if (feedbackError || !feedback) {
      return NextResponse.json(
        {
          error: {
            code: "FEEDBACK_NOT_FOUND",
            message: "指定されたフィードバックが見つかりません。",
          },
        },
        { status: 404 }
      );
    }

    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("parent_email")
      .eq("id", feedback.student_id)
      .single();

    if (studentError || !student) {
      return NextResponse.json(
        {
          error: {
            code: "STUDENT_NOT_FOUND",
            message: "生徒情報の取得に失敗しました。",
          },
        },
        { status: 500 }
      );
    }

    const to = student.parent_email as string | null;
    if (!to) {
      return NextResponse.json(
        {
          error: {
            code: "NO_PARENT_EMAIL",
            message: "保護者メールアドレスが設定されていません。",
          },
        },
        { status: 400 }
      );
    }

    const result = await sendFeedbackEmail(to, feedback.content);
    if (!result.success) {
      return NextResponse.json(
        { error: { code: "SEND_FAILED", message: result.error } },
        { status: 500 }
      );
    }

    const now = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("feedbacks")
      .update({
        sent: true,
        sent_at: now,
        sent_to_email: to,
      })
      .eq("id", id);

    if (updateError) {
      console.error("Failed to update feedback after sending:", updateError);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    if (err?.code === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "認証が必要です。" } },
        { status: 401 }
      );
    }

    console.error(err);
    return NextResponse.json(
      { error: { code: "SEND_FAILED", message: "フィードバック送信に失敗しました。" } },
      { status: 500 }
    );
  }
}


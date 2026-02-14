// 層: API Route層 (REST API)
// 責務: フィードバックの保存・一覧取得などfeedbacksテーブルへのCRUDの入口

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/auth";

// POST /api/feedback
// body: { student_id: string; content: string }
// フィードバックの保存（LLMで生成されたcontentをfeedbacksテーブルにINSERT）
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await req.json().catch(() => null);
    const studentId = body?.student_id as string | undefined;
    const content = body?.content as string | undefined;

    if (!studentId || !content) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "student_id と content は必須です。",
          },
        },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from("feedbacks")
      .insert({
        student_id: studentId,
        content,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("Failed to insert feedback:", error);
      return NextResponse.json(
        {
          error: {
            code: "INTERNAL_ERROR",
            message: "フィードバックの保存に失敗しました。",
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (err: any) {
    if (err?.code === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "認証が必要です。" } },
        { status: 401 }
      );
    }

    console.error(err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "予期せぬエラーが発生しました。" } },
      { status: 500 }
    );
  }
}

// ※必要になれば GET で一覧取得を追加予定


// 層: API Route層 (成績)
// 責務: 成績の追加（担当生徒のみ。grades テーブル設計に準拠）

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getCurrentProfile } from "@/lib/profile";

export async function POST(req: NextRequest) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "認証が必要です。" } },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    const student_id = body?.student_id as string | undefined;
    const test_name = (body?.test_name as string)?.trim();
    const score = typeof body?.score === "number" ? body.score : parseInt(String(body?.score), 10);
    const max_score = typeof body?.max_score === "number" ? body.max_score : parseInt(String(body?.max_score), 10);
    const comment = (body?.comment as string)?.trim() || null;
    const test_date = body?.test_date as string | undefined;

    if (!student_id) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "student_id は必須です。" } },
        { status: 400 }
      );
    }
    if (!test_name) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "test_name は必須です。" } },
        { status: 400 }
      );
    }
    if (!test_date || !/^\d{4}-\d{2}-\d{2}$/.test(test_date)) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "test_date (YYYY-MM-DD) は必須です。" } },
        { status: 400 }
      );
    }
    if (Number.isNaN(score) || Number.isNaN(max_score) || score < 0 || max_score <= 0 || score > max_score) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "score, max_score は 0 以上で score <= max_score にしてください。" } },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();
    const { data: student } = await supabase
      .from("students")
      .select("id, teacher_id")
      .eq("id", student_id)
      .single();

    if (!student) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "生徒が見つかりません。" } },
        { status: 404 }
      );
    }
    if (profile.role !== "admin" && student.teacher_id !== profile.id) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "この生徒の成績を登録する権限がありません。" } },
        { status: 403 }
      );
    }

    const { data: row, error } = await supabase
      .from("grades")
      .insert({ student_id, test_name, score, max_score, comment, test_date })
      .select("id, student_id, test_name, score, max_score, comment, test_date")
      .single();

    if (error) {
      console.error("Failed to insert grade:", error);
      return NextResponse.json(
        { error: { code: "INSERT_FAILED", message: "成績の登録に失敗しました。" } },
        { status: 500 }
      );
    }

    return NextResponse.json(row, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "エラーが発生しました。" } },
      { status: 500 }
    );
  }
}

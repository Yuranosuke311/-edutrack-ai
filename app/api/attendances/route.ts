// 層: API Route層 (出席)
// 責務: 出席の upsert（教師は担当生徒分のみ。student_id + lesson_date で一意）

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getCurrentProfile } from "@/lib/profile";

const STATUSES = ["present", "absent", "late"] as const;

// POST /api/attendances — 1件 upsert（担当生徒のみ）
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
    const lesson_date = body?.lesson_date as string | undefined;
    const status = body?.status as string | undefined;
    const memo = (body?.memo as string) ?? null;

    if (!student_id || !lesson_date || !/^\d{4}-\d{2}-\d{2}$/.test(lesson_date)) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "student_id と lesson_date (YYYY-MM-DD) は必須です。" } },
        { status: 400 }
      );
    }
    if (!status || !STATUSES.includes(status as any)) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "status は present / absent / late のいずれかです。" } },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    // 担当生徒かどうか確認（教師は自分の生徒のみ、管理者は全員可）
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
        { error: { code: "FORBIDDEN", message: "この生徒の出席を登録する権限がありません。" } },
        { status: 403 }
      );
    }

    const { data: existing } = await supabase
      .from("attendances")
      .select("id")
      .eq("student_id", student_id)
      .eq("lesson_date", lesson_date)
      .maybeSingle();

    let row: { id: string; student_id: string; lesson_date: string; status: string; memo: string | null } | null = null;
    if (existing?.id) {
      const { data: updated, error: updateError } = await supabase
        .from("attendances")
        .update({ status, memo })
        .eq("id", existing.id)
        .select("id, student_id, lesson_date, status, memo")
        .single();
      if (updateError) {
        console.error("Failed to update attendance:", updateError);
        return NextResponse.json(
          { error: { code: "UPDATE_FAILED", message: "出席の更新に失敗しました。" } },
          { status: 500 }
        );
      }
      row = updated;
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from("attendances")
        .insert({ student_id, lesson_date, status, memo })
        .select("id, student_id, lesson_date, status, memo")
        .single();
      if (insertError) {
        console.error("Failed to insert attendance:", insertError);
        return NextResponse.json(
          { error: { code: "INSERT_FAILED", message: "出席の登録に失敗しました。" } },
          { status: 500 }
        );
      }
      row = inserted;
    }

    return NextResponse.json(row, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "エラーが発生しました。" } },
      { status: 500 }
    );
  }
}

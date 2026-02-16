// 層: API Route層 (授業スケジュール)
// 責務: 授業一覧取得（teacher=担当のみ / admin=全件）、授業登録（adminのみ）

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getCurrentProfile } from "@/lib/profile";

// GET /api/lessons?month=YYYY-MM
export async function GET(req: NextRequest) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "認証が必要です。" } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month"); // YYYY-MM
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "month (YYYY-MM) は必須です。" } },
        { status: 400 }
      );
    }

    const [y, m] = month.split("-").map(Number);
    const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0, 0));
    const endExclusive = new Date(Date.UTC(y, m, 1, 0, 0, 0, 0));
    const startStr = start.toISOString();
    const endStr = endExclusive.toISOString();

    const supabase = createSupabaseServerClient();
    let query = supabase
      .from("lessons")
      .select("id, lesson_at, teacher_id, title, created_at")
      .gte("lesson_at", startStr)
      .lt("lesson_at", endStr)
      .order("lesson_at", { ascending: true });

    if (profile.role !== "admin") {
      query = query.eq("teacher_id", profile.id);
    }

    const { data: lessons, error } = await query;

    if (error) {
      console.error("Failed to fetch lessons:", error);
      return NextResponse.json(
        { error: { code: "FETCH_FAILED", message: "授業の取得に失敗しました。" } },
        { status: 500 }
      );
    }

    return NextResponse.json({ lessons: lessons ?? [] }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "エラーが発生しました。" } },
      { status: 500 }
    );
  }
}

// POST /api/lessons（admin のみ）
export async function POST(req: NextRequest) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "認証が必要です。" } },
        { status: 401 }
      );
    }
    if (profile.role !== "admin") {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "管理者のみ登録できます。" } },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    const lesson_at = body?.lesson_at as string | undefined;
    const teacher_id = body?.teacher_id as string | undefined;
    const title = (body?.title as string) ?? null;

    if (!lesson_at || typeof lesson_at !== "string") {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "lesson_at (ISO 8601 日時) は必須です。" } },
        { status: 400 }
      );
    }
    const lessonAtDate = new Date(lesson_at);
    if (Number.isNaN(lessonAtDate.getTime())) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "lesson_at は有効な日時形式で指定してください。" } },
        { status: 400 }
      );
    }
    if (!teacher_id) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "teacher_id は必須です。" } },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();
    const { data: lesson, error } = await supabase
      .from("lessons")
      .insert({ lesson_at: lesson_at, teacher_id, title })
      .select("id, lesson_at, teacher_id, title, created_at")
      .single();

    if (error) {
      console.error("Failed to insert lesson:", error);
      return NextResponse.json(
        { error: { code: "INSERT_FAILED", message: "授業の登録に失敗しました。" } },
        { status: 500 }
      );
    }

    return NextResponse.json(lesson, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "エラーが発生しました。" } },
      { status: 500 }
    );
  }
}

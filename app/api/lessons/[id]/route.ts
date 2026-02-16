// 層: API Route層 (授業スケジュール)
// 責務: 授業1件取得、授業削除（adminのみ）

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getCurrentProfile } from "@/lib/profile";

interface RouteParams {
  params: { id: string };
}

// GET /api/lessons/[id]（教師は自分の授業のみ）
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "認証が必要です。" } },
        { status: 401 }
      );
    }

    const id = params?.id;
    if (!id) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "id は必須です。" } },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();
    const { data: lesson, error } = await supabase
      .from("lessons")
      .select("id, lesson_at, teacher_id, title, created_at")
      .eq("id", id)
      .single();

    if (error || !lesson) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "授業が見つかりません。" } },
        { status: 404 }
      );
    }

    if (profile.role !== "admin" && lesson.teacher_id !== profile.id) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "この授業を閲覧する権限がありません。" } },
        { status: 403 }
      );
    }

    return NextResponse.json(lesson, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "エラーが発生しました。" } },
      { status: 500 }
    );
  }
}

// DELETE /api/lessons/[id]（admin のみ）
export async function DELETE(req: NextRequest, { params }: RouteParams) {
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
        { error: { code: "FORBIDDEN", message: "管理者のみ削除できます。" } },
        { status: 403 }
      );
    }

    const id = params?.id;
    if (!id) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "id は必須です。" } },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from("lessons").delete().eq("id", id);

    if (error) {
      console.error("Failed to delete lesson:", error);
      return NextResponse.json(
        { error: { code: "DELETE_FAILED", message: "授業の削除に失敗しました。" } },
        { status: 500 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "エラーが発生しました。" } },
      { status: 500 }
    );
  }
}

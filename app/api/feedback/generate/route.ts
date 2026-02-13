// 層: API Route層 (LLM連携API)
// 責務: 生徒の出席・成績データを集約し、OpenAIクライアントを通じてフィードバック文を生成して返す

import { NextRequest, NextResponse } from "next/server";
import { generateFeedback } from "@/lib/openai";
import { requireAuth } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase";

// POST /api/feedback/generate
// body: { student_id: string }
export async function POST(req: NextRequest) {
  try {
    await requireAuth(req);

    const body = await req.json().catch(() => null);
    const studentId = body?.student_id as string | undefined;

    if (!studentId) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "student_id は必須です。",
          },
        },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient(() => {
      const cookieHeader = req.headers.get("cookie") ?? "";
      const entries = cookieHeader.split(";").map((c) => c.trim().split("="));
      return Object.fromEntries(entries.filter(([k]) => k));
    });

    // 生徒情報の取得（存在確認 & 名前取得）
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("id, name")
      .eq("id", studentId)
      .single();

    if (studentError || !student) {
      return NextResponse.json(
        {
          error: {
            code: "STUDENT_NOT_FOUND",
            message: "指定された生徒が見つかりません。",
          },
        },
        { status: 404 }
      );
    }

    // 出席データ取得
    const { data: attendances, error: attendanceError } = await supabase
      .from("attendances")
      .select("lesson_date, status, memo")
      .eq("student_id", studentId)
      .order("lesson_date", { ascending: false });

    if (attendanceError) {
      console.error("Failed to fetch attendances:", attendanceError);
    }

    // 成績データ取得
    const { data: grades, error: gradesError } = await supabase
      .from("grades")
      .select("test_name, score, max_score, comment, test_date")
      .eq("student_id", studentId)
      .order("test_date", { ascending: false });

    if (gradesError) {
      console.error("Failed to fetch grades:", gradesError);
    }

    const content = await generateFeedback({
      studentName: student.name,
      attendances: attendances ?? [],
      grades: grades ?? [],
    });

    return NextResponse.json({ content }, { status: 200 });
  } catch (err: any) {
    if (err?.code === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "認証が必要です。" } },
        { status: 401 }
      );
    }

    console.error(err);
    return NextResponse.json(
      { error: { code: "GENERATION_FAILED", message: "フィードバック生成に失敗しました。" } },
      { status: 500 }
    );
  }
}


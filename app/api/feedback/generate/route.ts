// 層: API Route層 (LLM連携API)
// 責務: 生徒の出席・成績データを集約し、OpenAIクライアントを通じてフィードバック文を生成して返す

import { NextResponse } from "next/server";
import { generateFeedback } from "@/lib/openai";

// POST /api/feedback/generate
// body: { student_id: string }
export async function POST() {
  // TODO: request から student_id を取り出し、Supabase で attendances / grades を取得して generateFeedback を呼び出す
  // const body = await req.json();
  // const { student_id } = body;

  const dummyContent = await generateFeedback({
    studentName: "ダミー生徒",
    attendances: [],
    grades: [],
  });

  return NextResponse.json({ content: dummyContent }, { status: 200 });
}


// 層: API Route層 (REST API)
// 責務: フィードバックの保存・一覧取得などfeedbacksテーブルへのCRUDの入口

import { NextResponse } from "next/server";

// POST /api/feedback
// フィードバックの保存（LLMで生成されたcontentをfeedbacksテーブルにINSERT）
export async function POST() {
  // TODO: Supabaseクライアントを使って feedbacks にINSERT
  return NextResponse.json({ message: "Not implemented yet" }, { status: 501 });
}

// ※必要になれば GET で一覧取得を追加予定


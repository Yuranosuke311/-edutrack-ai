// 層: lib層 (外部APIクライアント)
// 責務: OpenAI API を用いて保護者向けフィードバック文を生成するロジックの集約

import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

const client = apiKey
  ? new OpenAI({
      apiKey,
    })
  : null;

interface FeedbackGenerationParams {
  studentName: string;
  attendances: any[];
  grades: any[];
  maxTokens?: number;
}

export async function generateFeedback(params: FeedbackGenerationParams) {
  if (!client) {
    throw new Error("OPENAI_API_KEY が設定されていません");
  }

  const { studentName, attendances, grades, maxTokens = 800 } = params;

  const attendanceSummary = (attendances as { lesson_date?: string; status?: string; memo?: string }[])
    .map((a) => `日付: ${a.lesson_date ?? ""}, 出欠: ${a.status ?? ""}, 授業メモ: ${a.memo ?? "（なし）"}`)
    .join("\n");

  const prompt = `
あなたは日本のオンライン家庭教師です。

生徒: ${studentName}

【出席・授業メモ】
${attendanceSummary || "（記録なし）"}

【成績概要】
${JSON.stringify(grades)}

保護者向けに、以下を含む日本語フィードバックを作成してください。
- 学習状況の要約（出席状況と授業メモの内容を反映すること）
- 強みと課題
- 次回以降の学習提案
  `.trim();

  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: "あなたは教育に詳しいプロの家庭教師です。" },
      { role: "user", content: prompt },
    ],
  });

  return res.choices[0]?.message?.content ?? "";
}


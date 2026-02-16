// 層: lib層 (外部サービス連携)
// 責務: Resend を用いて保護者向けフィードバックメールを送信する

import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const fromAddress = process.env.RESEND_FROM ?? "EduTrack AI <onboarding@resend.dev>";

const resend = apiKey ? new Resend(apiKey) : null;

export async function sendFeedbackEmail(
  to: string,
  content: string
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    return { success: false, error: "RESEND_API_KEY が設定されていません。.env.local に RESEND_API_KEY を設定してください。" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [to],
      subject: "【EduTrack AI】お子様の学習フィードバック",
      html: `
        <p>保護者様</p>
        <p>お子様の学習状況について、フィードバックをお届けします。</p>
        <hr />
        <div style="white-space: pre-wrap;">${escapeHtml(content)}</div>
        <hr />
        <p style="color:#666;font-size:12px;">本メールは EduTrack AI から自動送信されています。</p>
      `.trim(),
    });

    if (error) {
      console.error("Resend send error:", error);
      return { success: false, error: error.message ?? "メール送信に失敗しました。" };
    }

    if (!data?.id) {
      return { success: false, error: "メール送信の応答が不正です。" };
    }

    return { success: true };
  } catch (err: any) {
    console.error("sendFeedbackEmail error:", err);
    return {
      success: false,
      error: err?.message ?? "送信失敗",
    };
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

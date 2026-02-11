// 層: lib層 (外部サービス連携)
// 責務: Resend等のメールサービスを用いて保護者向けフィードバックメールを送信する処理

export async function sendFeedbackEmail(
  to: string,
  content: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // TODO: Resend API での実装
    console.log("Send email to", to);
    console.log(content);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "送信失敗" };
  }
}

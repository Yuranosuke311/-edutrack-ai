// 層: lib層 (入力バリデーション)
// 責務: フォーム入力やAPIリクエストの値検証ロジックを集約（Zod等導入時の置き場所）

export function isValidEmail(email: string): boolean {
  // シンプルなメールアドレスチェック（必要に応じて強化）
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


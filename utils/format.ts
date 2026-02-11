// 層: utils層 (共通ユーティリティ)
// 責務: 点数やパーセンテージなど表示用フォーマット処理を集約

export function formatScore(score: number, maxScore: number): string {
  if (!Number.isFinite(score) || !Number.isFinite(maxScore) || maxScore === 0) {
    return "-";
  }
  return `${score} / ${maxScore}`;
}


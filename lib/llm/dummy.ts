/**
 * テスト用のダミー関数
 * @module lib/llm/dummy
 */

/**
 * ダミーの推奨ツールを返す関数
 * @param input - ユーザーの入力テキスト
 * @returns 推奨ツールの配列
 */
export async function recommendDummy(input: string): Promise<string[]> {
  // テスト用に単純な固定レスポンスを返す
  return [
    "ChatGPT",
    "Midjourney",
    "GitHub Copilot",
    "Notion AI",
    "DALL-E"
  ];
} 
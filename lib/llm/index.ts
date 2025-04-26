/**
 * LLMクライアントのエントリーポイント
 * @module lib/llm
 */

import { LLMConfig, DEFAULT_LLM_CONFIG } from './config';
import { LlamaMaverickClient } from './llama';

/**
 * ユーザーのニーズを分析し、タスクを分解して最適なツールを推薦する
 * @param needs ユーザーのニーズ
 * @returns タスク分解と推薦ツールの情報
 */
export async function getRecommendations(needs: string) {
  try {
    const client = new LlamaMaverickClient(DEFAULT_LLM_CONFIG);
    return await client.analyzeNeedsAndRecommendTools(needs);
  } catch (error) {
    console.error('Failed to get recommendations:', error);
    throw error; // エラーをそのまま再スロー
  }
}

export function createLLMClient(config: LLMConfig = DEFAULT_LLM_CONFIG) {
  return new LlamaMaverickClient(config);
}

export { LlamaMaverickClient } from './llama'; 
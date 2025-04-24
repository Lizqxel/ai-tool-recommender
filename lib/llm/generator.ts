/**
 * LLMの初期化と生成処理を行うモジュール
 * @module lib/llm/generator
 */

import { LLM_CONFIG } from './config';
import { AITool } from '../types/ai-tool';
import aiTools from '@/data/ai_tools.json';

let modelInitialized = false;

/**
 * LLMモデルを初期化する
 * @returns {Promise<void>}
 */
export async function initializeLLM(): Promise<void> {
  try {
    // クライアントサイドでの実行を防ぐ
    if (typeof window !== 'undefined') {
      console.warn('LLMはサーバーサイドでのみ実行できます');
      return;
    }

    if (!modelInitialized) {
      console.log('モデルの初期化を開始します...');
      
      // 実際のモデル初期化処理はここに実装
      // 現在はダミー実装
      
      modelInitialized = true;
      console.log('モデルの初期化が完了しました');
    }
  } catch (error) {
    console.error('LLMの初期化に失敗しました:', error);
    throw new Error('LLMの初期化に失敗しました');
  }
}

/**
 * ツールの説明を生成する
 * @param {string} query - ユーザーのクエリ
 * @param {AITool} tool - AIツールの情報
 * @returns {Promise<string>} 生成された説明
 */
export async function generateToolDescription(query: string, tool: AITool): Promise<string> {
  try {
    if (!modelInitialized) {
      await initializeLLM();
    }

    // オリジナルの説明文をそのまま返す
    return tool.description || '';
    
  } catch (error) {
    console.error('説明の取得に失敗しました:', error);
    return '';
  }
}

/**
 * ユーザーのニーズに基づいてAIツールを推薦する関数
 * @param query 検索クエリ
 * @param needs ユーザーのニーズ
 * @param priorities 優先事項
 * @param limitations 制限事項
 * @param budget 予算
 * @returns 推薦されたAIツール
 */
export function recommendTools(
  needs: string[],
  priorities: string[],
  limitations: string[],
  budget: string,
): AITool[] {
  // スコアリング関数
  const calculateScore = (tool: AITool): number => {
    let score = 0;

    // ニーズとの一致度をスコア化
    needs.forEach(need => {
      if (tool.features.some(f => f.includes(need))) score += 3;
      if (tool.useCases.some(u => u.includes(need))) score += 2;
      if (tool.description.includes(need)) score += 1;
    });

    // 優先事項との一致度をスコア化
    priorities.forEach(priority => {
      if (tool.pros.some(p => p.includes(priority))) score += 2;
      if (tool.features.some(f => f.includes(priority))) score += 1;
    });

    // 制限事項との不一致をペナルティとして計算
    limitations.forEach(limitation => {
      if (tool.cons.some(c => c.includes(limitation))) score -= 2;
    });

    // 予算との整合性をチェック
    if (budget === '無料' && tool.pricing.hasFree) {
      score += 2;
    } else if (budget !== '無料') {
      const maxBudget = parseInt(budget.replace(/[^0-9]/g, '')) || 0;
      const toolPrice = tool.pricing.paidPlans[0]?.price || '';
      const toolPriceNum = parseInt(toolPrice.replace(/[^0-9]/g, '')) || 0;
      
      if (toolPriceNum <= maxBudget) score += 1;
      else score -= 2;
    }

    return score;
  };

  // 全ツールをスコアリングし、スコアが0以上のものを返す
  const scoredTools = aiTools
    .map(tool => ({
      tool,
      score: calculateScore(tool as AITool),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ tool }) => tool as AITool);

  return scoredTools;
} 
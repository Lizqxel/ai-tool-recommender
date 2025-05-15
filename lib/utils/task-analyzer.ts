/**
 * タスク分析とツール推薦のためのユーティリティ関数
 * @module task-analyzer
 */

import { AITool } from '../types/ai-tool';
import { TaskResponse, RecommendedTool } from '../types/task';

// タスクのキーワードとカテゴリのマッピング
const taskCategoryMapping: { [key: string]: string[] } = {
  '文章作成': ['文書作成', 'コンテンツ作成', 'ブログ', '記事', 'レポート'],
  '画像生成': ['イラスト', 'デザイン', 'アート', '画像作成', 'ビジュアル'],
  'コード開発': ['プログラミング', '開発', 'コーディング', 'デバッグ', 'テスト'],
  'データ分析': ['分析', '統計', '可視化', 'レポート', 'BI'],
  '音声処理': ['音声合成', '音声認識', '音楽', 'オーディオ'],
  '動画編集': ['動画作成', '編集', 'モーショングラフィックス', 'アニメーション'],
  '翻訳': ['多言語', '翻訳', 'ローカライズ', '言語変換'],
  'チャットボット': ['会話', 'カスタマーサポート', 'アシスタント', '自動応答'],
};

// ツールの特徴とタスクの関連性スコア
const toolFeatureScores: { [key: string]: { [key: string]: number } } = {
  'ChatGPT': {
    '文章作成': 0.9,
    'コード開発': 0.8,
    '翻訳': 0.9,
    'チャットボット': 0.95,
  },
  'Midjourney': {
    '画像生成': 0.95,
    'デザイン': 0.9,
    'アート': 0.95,
  },
  // 他のツールのスコアも同様に定義
};

/**
 * タスクを分析し、関連するカテゴリとサブタスクを抽出
 * @param task ユーザーの入力タスク
 * @returns タスクの分析結果
 */
export function analyzeTask(task: string): TaskResponse {
  const categories = new Set<string>();
  const subTasks: string[] = [];
  
  // キーワードベースのカテゴリ特定
  Object.entries(taskCategoryMapping).forEach(([category, keywords]) => {
    if (keywords.some((keyword: string) => task.toLowerCase().includes(keyword.toLowerCase()))) {
      categories.add(category);
    }
  });

  // 文脈ベースのサブタスク抽出
  const sentences = task.split(/[.。!！?？]/).filter(s => s.trim());
  sentences.forEach(sentence => {
    if (sentence.trim()) {
      subTasks.push(sentence.trim());
    }
  });

  return {
    task,
    description: task,
    recommendedTools: [],
    comparison: '',
    recommendation: ''
  };
}

/**
 * タスクに基づいてツールを推薦
 * @param taskResponse タスク分析結果
 * @param availableTools 利用可能なツールのリスト
 * @returns 推薦ツールのリスト
 */
export function recommendTools(
  taskResponse: TaskResponse,
  availableTools: AITool[]
): RecommendedTool[] {
  const recommendedTools: RecommendedTool[] = [];
  const taskKeywords = taskResponse.task.toLowerCase().split(/\s+/);

  availableTools.forEach(tool => {
    let score = 0;
    // ツールの特徴や説明文との関連性をスコア化
    const toolText = [
      tool.name,
      tool.description,
      ...(tool.features || []),
      ...(tool.useCases || []),
      ...(tool.pros || []),
      ...(tool.cons || [])
    ].join(' ').toLowerCase();
    taskKeywords.forEach((keyword: string) => {
      if (toolText.includes(keyword)) {
        score += 1;
      }
    });
    // スコアが閾値を超える場合に推薦リストに追加
    if (score > 0) {
      recommendedTools.push({
        name: tool.name,
        reason: `タスク「${taskResponse.task}」に最適なツールです。`,
        details: tool
      });
    }
  });

  // スコアに基づいてソート
  return recommendedTools.sort((a, b) => {
    const scoreA = calculateToolScore(a, taskResponse);
    const scoreB = calculateToolScore(b, taskResponse);
    return scoreB - scoreA;
  });
}

/**
 * ツールのスコアを計算
 * @param tool ツール情報
 * @param taskResponse タスク分析結果
 * @returns スコア
 */
function calculateToolScore(tool: RecommendedTool, taskResponse: TaskResponse): number {
  let score = 0;
  const taskKeywords = taskResponse.task.toLowerCase().split(/\s+/);
  const toolText = [
    tool.name,
    tool.details?.description || '',
    ...(tool.details?.features || []),
    ...(tool.details?.useCases || []),
    ...(tool.details?.pros || []),
    ...(tool.details?.cons || [])
  ].join(' ').toLowerCase();
  taskKeywords.forEach((keyword: string) => {
    if (toolText.includes(keyword)) {
      score += 1;
    }
  });
  return score;
}

/**
 * ツールの比較情報を生成
 * @param tools 推薦ツールのリスト
 * @returns 比較情報
 */
export function generateComparison(tools: RecommendedTool[]): string {
  if (tools.length === 0) return '';
  if (tools.length === 1) return `${tools[0].name}が最適な選択肢です。`;

  const comparison = tools.map((tool, index) => {
    const pros = tool.details?.pros?.join('、') || '';
    const cons = tool.details?.cons?.join('、') || '';
    return `${index + 1}. ${tool.name}：${pros}。ただし、${cons}。`;
  }).join('\n');

  return comparison;
}

/**
 * 最終的な推薦文を生成
 * @param tools 推薦ツールのリスト
 * @param taskResponse タスク分析結果
 * @returns 推薦文
 */
export function generateRecommendation(
  tools: RecommendedTool[],
  taskResponse: TaskResponse
): string {
  if (tools.length === 0) {
    return 'タスクに適したツールが見つかりませんでした。';
  }

  const bestTool = tools[0];
  const comparison = generateComparison(tools);

  return `
タスク「${taskResponse.task}」に対して、以下のツールをお勧めします：

${comparison}

特に${bestTool.name}は、${bestTool.reason}
${bestTool.details?.description || ''}

詳細な機能：
${bestTool.details?.features?.join('、') || ''}

注意点：
${bestTool.details?.cons?.join('、') || ''}
`.trim();
} 
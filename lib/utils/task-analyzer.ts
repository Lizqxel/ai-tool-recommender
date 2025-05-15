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

  // カテゴリが見つからない場合は「その他」を追加
  if (categories.size === 0) {
    categories.add('その他');
  }

  return {
    task,
    description: task,
    categories: Array.from(categories),
    recommendedTools: [],
    comparison: '',
    recommendation: ''
  };
}

/**
 * ツールのおすすめ度を計算（1-5のスコア）
 * @param tool ツール情報
 * @param taskResponse タスク分析結果
 * @returns おすすめ度（1-5）
 */
function calculateRecommendationScore(tool: AITool, taskResponse: TaskResponse): number {
  let score = 0;
  // 機能の充実度（最大1.5点）
  const featureScore = Math.min(tool.features.length / 3, 1.5);
  score += featureScore;
  // メリット/デメリットのバランス（最大1点）
  const prosConsRatio = tool.pros.length / ((tool.cons.length || 0) + 1);
  score += Math.min(prosConsRatio, 1);
  // 価格のコストパフォーマンス（最大0.7点）
  const hasFree = tool.pricing.hasFree;
  const hasPaid = tool.pricing.paidPlans && tool.pricing.paidPlans.length > 0;
  if (hasFree && hasPaid) score += 0.7;
  else if (hasFree) score += 0.7;
  else if (hasPaid) score += 0.3;
  // カテゴリとの関連性（最大1点）
  const categoryMatch = taskResponse.categories.some((cat: string) => 
    tool.category.toLowerCase().includes(cat.toLowerCase())
  );
  if (categoryMatch) score += 1;
  // 1-5のスコアに変換（切り捨て）
  return Math.min(Math.max(Math.floor(score), 1), 5);
}

/**
 * ツールを推薦し、おすすめ度を計算
 * @param taskResponse タスク分析結果
 * @param availableTools 利用可能なツール一覧
 * @returns 推薦ツール一覧（おすすめ度付き）
 */
export function recommendTools(taskResponse: TaskResponse, availableTools: AITool[]): RecommendedTool[] {
  const categories = taskResponse.categories.map((cat: string) => cat.toLowerCase());
  const taskKeywords = taskResponse.task.toLowerCase().split(/\s+/);

  let recommendedTools = availableTools.filter(tool => {
    const toolCategory = tool.category.toLowerCase();
    if (categories.some((cat: string) => toolCategory.includes(cat) || cat.includes(toolCategory))) {
      return true;
    }
    const text = [
      tool.name,
      tool.description,
      ...(tool.features || []),
      ...(tool.useCases || []),
      ...(tool.pros || []),
      ...(tool.cons || [])
    ].join(' ').toLowerCase();
    return taskKeywords.some((keyword: string) => text.includes(keyword));
  }).map(tool => {
    const score = calculateRecommendationScore(tool, taskResponse);
    
    // descriptionから理由を生成
    let reason = tool.description;
    // 説明文が長すぎる場合は最初の文だけを使用
    if (reason.length > 100) {
      reason = reason.split(/[。.!?]/)[0] + '。';
    }

    return {
      name: tool.name,
      reason: reason,
      score: score,
      details: {
        description: tool.description,
        officialUrl: tool.officialUrl,
        pricing: tool.pricing,
        features: tool.features,
        pros: tool.pros,
        cons: tool.cons
      }
    };
  }).sort((a, b) => (b.score || 0) - (a.score || 0));

  // 1位は必ず★5にする
  if (recommendedTools.length > 0) {
    recommendedTools[0].score = 5;
  }

  return recommendedTools;
}

/**
 * ツールごとの用途タグを生成
 * @param tools 推薦ツールのリスト
 * @returns 用途タグ配列
 */
export function generateUsageTags(tools: RecommendedTool[]): string[] {
  if (tools.length === 0) return [];
  // 例: 主要な特徴やカテゴリをタグ化
  return tools.map(tool => {
    if (tool.details?.features && tool.details.features.length > 0) {
      return tool.details.features[0];
    }
    if (tool.details?.description) {
      return tool.details.description.split(/[。.!?]/)[0];
    }
    return tool.name;
  });
}

// 旧: generateComparison, generateRecommendationは今後使わない 
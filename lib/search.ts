import Fuse from 'fuse.js';
import { AITool } from './types/ai-tool';
import aiTools from '@/data/ai_tools.json';

// 日本語の同義語マッピング
const synonyms: { [key: string]: string[] } = {
  '画像': ['イラスト', '写真', '絵', 'グラフィック', 'ビジュアル'],
  '生成': ['作成', '制作', '作る', '作図', 'つくる'],
  '翻訳': ['通訳', '変換', '多言語'],
  '音声': ['音', '声', 'ボイス', 'オーディオ', '話す'],
  '動画': ['映像', 'ビデオ', 'ムービー', '動く'],
  'コード': ['プログラム', 'プログラミング', '開発', 'コーディング'],
  '文章': ['テキスト', '記事', 'コピー', 'ライティング', '文字'],
  '無料': ['フリー', '無償', 'タダ', '0円'],
  '安い': ['リーズナブル', '手頃', '低価格', 'コスパ'],
  '簡単': ['シンプル', '初心者', '使いやすい', '分かりやすい'],
};

// 検索クエリを前処理する関数
function preprocessQuery(query: string): string[] {
  // クエリを小文字に変換し、単語に分割
  const words = query.toLowerCase().split(/[\s,、　]+/);
  
  // 同義語を展開
  const expandedWords = words.flatMap(word => {
    const synonymList = Object.entries(synonyms).find(([key, values]) => 
      values.includes(word) || key === word
    );
    return synonymList ? [word, ...synonymList[1]] : [word];
  });

  return Array.from(new Set(expandedWords));
}

// ツールのスコアを計算する関数
function calculateToolScore(tool: AITool, queryWords: string[]): number {
  let score = 0;

  // 検索語との一致度をスコア化
  queryWords.forEach(word => {
    // 名前との一致（最も重要）
    if (tool.name.toLowerCase().includes(word)) score += 10;
    
    // カテゴリとの一致
    if (tool.category.toLowerCase().includes(word)) score += 8;
    if (tool.subcategory.toLowerCase().includes(word)) score += 6;
    
    // 説明文との一致
    if (tool.description.toLowerCase().includes(word)) score += 5;
    
    // 機能との一致
    if (tool.features.some((f: string) => f.toLowerCase().includes(word))) score += 4;
    
    // ユースケースとの一致
    if (tool.useCases.some((u: string) => u.toLowerCase().includes(word))) score += 3;
    
    // メリットとの一致
    if (tool.pros.some((p: string) => p.toLowerCase().includes(word))) score += 2;
  });

  // 無料プランの有無を考慮
  if (queryWords.includes('無料') && tool.pricing.hasFree) {
    score += 5;
  }

  // 初心者向けかどうかを考慮
  if (queryWords.some(w => w.includes('初心者') || w.includes('簡単'))) {
    if (!tool.cons.some((c: string) => 
      c.includes('技術的') || 
      c.includes('難しい') || 
      c.includes('学習曲線')
    )) {
      score += 3;
    }
  }

  return score;
}

// Fuseの設定をカスタマイズ
const fuseOptions = {
  keys: [
    { name: 'name', weight: 1.0 },
    { name: 'category', weight: 0.8 },
    { name: 'subcategory', weight: 0.7 },
    { name: 'description', weight: 0.6 },
    { name: 'features', weight: 0.5 },
    { name: 'useCases', weight: 0.4 },
    { name: 'pros', weight: 0.3 }
  ],
  threshold: 0.3,
  includeScore: true,
  useExtendedSearch: true,
  ignoreLocation: true,
  findAllMatches: true
};

const fuse = new Fuse(aiTools as AITool[], fuseOptions);

export const searchTools = (query: string): AITool[] => {
  if (!query.trim()) {
    return aiTools as AITool[];
  }

  // クエリの前処理
  const queryWords = preprocessQuery(query);
  
  // Fuseで検索を実行
  const fuseResults = fuse.search(queryWords.join(' '));
  
  // 独自のスコアリングを適用
  const scoredResults = fuseResults.map(({ item }) => ({
    tool: item,
    score: calculateToolScore(item, queryWords)
  }));
  
  // スコアでソート
  const sortedResults = scoredResults
    .sort((a, b) => b.score - a.score)
    .filter(result => result.score > 0)
    .map(result => result.tool);

  return sortedResults;
};

export const getToolById = (id: string): AITool | undefined => {
  return (aiTools as AITool[]).find((tool: AITool) => tool.id === id);
}; 
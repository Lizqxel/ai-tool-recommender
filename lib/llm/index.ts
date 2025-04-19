import { RecommendationRequest } from '@/lib/types';
import { SYSTEM_PROMPT, USER_PROMPT_TEMPLATE } from './prompt';
import { generateToolDescription } from './generator';

export async function getRecommendations(request: RecommendationRequest) {
  // サーバーサイドでのみ実行される関数
  if (typeof window !== 'undefined') {
    console.warn('getRecommendationsはサーバーサイドでのみ実行できます');
    return {
      recommendations: [
        {
          name: 'ChatGPT',
          description: 'OpenAIが開発した大規模言語モデル',
          url: 'https://chat.openai.com',
          price: '無料〜$20/月',
          features: ['テキスト生成', '会話', 'コード生成'],
          pros: ['使いやすい', '多言語対応', '高精度'],
          cons: ['有料版が必要', 'インターネット接続が必要']
        }
      ]
    };
  }

  const userPrompt = USER_PROMPT_TEMPLATE
    .replace('{needs}', request.needs.join(', '))
    .replace('{budget}', request.budget)
    .replace('{technicalLevel}', request.technicalLevel)
    .replace('{priorities}', request.priorities.join(', '))
    .replace('{limitations}', request.limitations.join(', '));

  // システムプロンプトとユーザープロンプトを結合
  const fullPrompt = `${SYSTEM_PROMPT}\n\n${userPrompt}`;
  
  // ローカルLLMを使用してレスポンスを生成
  const response = await generateToolDescription(
    {
      id: 'recommender',
      name: 'AI Tool Recommender',
      description: 'AIツール推薦システム',
      category: '推薦システム',
      url: '',
      pricing: '',
      features: [],
      useCases: [],
      limitations: [],
      alternatives: []
    },
    fullPrompt
  );

  try {
    return JSON.parse(response);
  } catch (error) {
    console.error('Failed to parse LLM response:', error);
    throw new Error('Failed to parse LLM response');
  }
} 
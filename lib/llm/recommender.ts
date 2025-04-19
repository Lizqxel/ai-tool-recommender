import { SYSTEM_PROMPT, USER_PROMPT_TEMPLATE } from './prompt';
import { RecommendationRequest, RecommendationResponse } from './types';
import { generateToolDescription } from './generator';

export async function getToolRecommendation(
  request: RecommendationRequest
): Promise<RecommendationResponse> {
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
    const parsedResponse = JSON.parse(response) as RecommendationResponse;
    return parsedResponse;
  } catch (error) {
    throw new Error('Failed to parse LLM response');
  }
} 
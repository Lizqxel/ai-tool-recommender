import { LLMConfig, LLM_CONFIG } from './config';
import { AITool } from '../types/ai-tool';
import { RecommendationRequest, RecommendationResponse } from './types';
import { SYSTEM_PROMPT, USER_PROMPT_TEMPLATE } from './prompt';
import { initializeLLM, generateToolDescription } from './generator';

export class LLMClient {
  private config: LLMConfig;

  constructor(config: LLMConfig = LLM_CONFIG) {
    this.config = config;
  }

  async generateResponse(tool: AITool, query: string): Promise<string> {
    return generateToolDescription(query, tool);
  }

  async getRecommendations(
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
      fullPrompt,
      {
        id: 'recommender',
        name: 'AI Tool Recommender',
        category: '推薦システム',
        subcategory: 'ツール推薦',
        description: 'AIツール推薦システム',
        features: [],
        useCases: [],
        pricing: {
          hasFree: true,
          freeFeatures: [],
          paidPlans: []
        },
        officialUrl: '',
        apiAvailable: false,
        apiDocUrl: '',
        pros: [],
        cons: [],
        alternatives: [],
        imageUrl: '',
        lastUpdated: new Date().toISOString()
      }
    );

    try {
      return JSON.parse(response) as RecommendationResponse;
    } catch (error) {
      throw new Error('Failed to parse LLM response');
    }
  }
} 
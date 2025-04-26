/**
 * LlamaMaverickClientのテスト
 * @module lib/llm/__tests__/llama.test
 */

import { LlamaMaverickClient } from '../llama';
import { LLMConfig } from '../config';
import { AITool } from '../../types';

// テストのタイムアウトを30秒に設定
jest.setTimeout(30000);

describe('LlamaMaverickClient', () => {
  let client: LlamaMaverickClient;
  const config: LLMConfig = {
    modelPath: "./models/Ministral-8B-Instruct-2410-Q4_K_M.gguf",
    temperature: 0.7,
    maxTokens: 2048,
    topP: 0.9,
    generation: {
      maxTokens: 2048,
      temperature: 0.7,
      topP: 0.9,
    },
    prompt: {
      system: "あなたはAIツールの推薦を行う専門家です。",
      user: "ユーザーのニーズ: {needs}\n優先事項: {priorities}\n制限事項: {limitations}"
    }
  };

  beforeEach(() => {
    // 環境変数が設定されていない場合はテストをスキップ
    if (!process.env.OPENROUTER_API_KEY) {
      console.warn('OPENROUTER_API_KEYが設定されていないため、テストをスキップします');
      return;
    }
    client = new LlamaMaverickClient(config);
  });

  describe('generateToolDescriptionWithLlama', () => {
    it('should analyze a valid tool using Llama 4 Maverick', async () => {
      // 環境変数が設定されていない場合はテストをスキップ
      if (!process.env.OPENROUTER_API_KEY) {
        return;
      }

      const validTool: AITool = {
        id: 'test-tool',
        name: 'Test Tool',
        description: 'A test tool for unit testing',
        url: 'https://test-tool.com',
        price: 'Free',
        category: 'Testing',
        subcategory: 'Unit Testing',
        features: ['feature1', 'feature2'],
        useCases: ['useCase1', 'useCase2'],
        pros: ['pro1', 'pro2'],
        cons: ['con1', 'con2'],
        imageUrl: 'https://test-tool.com/image.png',
        rating: 4.5,
        reviewCount: 100,
        lastUpdated: '2024-01-01',
        supportedLanguages: ['JavaScript', 'TypeScript'],
        integrationOptions: ['API', 'SDK'],
        pricing: {
          hasFree: true,
          freeFeatures: ['free1', 'free2'],
          paidPlans: [
            {
              name: 'Pro',
              price: '$10/month',
              billingCycle: 'monthly',
              features: ['paid1', 'paid2']
            }
          ]
        },
        officialUrl: 'https://test-tool.com',
        apiAvailable: true,
        apiDocUrl: 'https://test-tool.com/api-docs',
        alternatives: ['alt1', 'alt2']
      };

      const result = await client.generateToolDescriptionWithLlama('Analyze this tool', validTool);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle invalid tool data using Llama 4 Maverick', async () => {
      // 環境変数が設定されていない場合はテストをスキップ
      if (!process.env.OPENROUTER_API_KEY) {
        return;
      }

      const invalidTool: AITool = {
        id: 'invalid-tool',
        name: 'Invalid Tool',
        description: 'An invalid tool for testing',
        url: 'https://invalid-tool.com',
        price: 'Unknown',
        category: 'Testing',
        subcategory: 'Invalid Testing',
        features: [],
        useCases: [],
        pros: [],
        cons: [],
        imageUrl: 'https://invalid-tool.com/image.png',
        rating: 0,
        reviewCount: 0,
        lastUpdated: '2024-01-01',
        supportedLanguages: [],
        integrationOptions: [],
        pricing: {
          hasFree: false,
          freeFeatures: [],
          paidPlans: []
        },
        officialUrl: 'https://invalid-tool.com',
        apiAvailable: false,
        apiDocUrl: '',
        alternatives: []
      };

      const result = await client.generateToolDescriptionWithLlama('Analyze this tool', invalidTool);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });
}); 
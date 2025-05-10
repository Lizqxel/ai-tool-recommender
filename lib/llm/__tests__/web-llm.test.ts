/**
 * WebLLMのテストコード
 */

import { WebLLMClient } from '../web-llm';
import { LLMConfig } from '../config';

describe('WebLLMClient', () => {
  let llmClient: WebLLMClient;
  const config: LLMConfig = {
    generation: {
      maxTokens: 1000,
      temperature: 0.7
    }
  };

  beforeEach(() => {
    llmClient = new WebLLMClient(config);
  });

  describe('initialize', () => {
    it('モデルを正常に初期化できること', async () => {
      await expect(llmClient.initialize()).resolves.not.toThrow();
    });

    it('初期化済みの場合は再初期化しないこと', async () => {
      await llmClient.initialize();
      const spy = jest.spyOn(llmClient as any, 'initialize');
      await llmClient.initialize();
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('analyzeNeedsAndRecommendTools', () => {
    beforeEach(async () => {
      await llmClient.initialize();
    });

    it('ユーザーのニーズを分析してツールを推薦できること', async () => {
      const needs = '画像生成AIツールを探しています';
      const result = await llmClient.analyzeNeedsAndRecommendTools(needs);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      const task = result[0];
      expect(task).toHaveProperty('task');
      expect(task).toHaveProperty('description');
      expect(task).toHaveProperty('recommendedTools');
      expect(Array.isArray(task.recommendedTools)).toBe(true);
    });

    it('空の入力に対してエラーを投げること', async () => {
      await expect(llmClient.analyzeNeedsAndRecommendTools('')).rejects.toThrow();
    });
  });

  describe('generateToolDetailsJson', () => {
    beforeEach(async () => {
      await llmClient.initialize();
    });

    it('ツールの詳細情報をJSON形式で生成できること', async () => {
      const toolName = 'Midjourney';
      const result = await llmClient.generateToolDetailsJson(toolName);
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('price');
      expect(result).toHaveProperty('features');
      expect(result).toHaveProperty('pros');
      expect(result).toHaveProperty('cons');
    });

    it('存在しないツール名に対してエラーを投げること', async () => {
      await expect(llmClient.generateToolDetailsJson('NonExistentTool')).rejects.toThrow();
    });
  });
}); 
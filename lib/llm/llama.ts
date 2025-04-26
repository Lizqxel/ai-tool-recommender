/**
 * Llama 4 Maverickクライアントの実装
 * @module lib/llm/llama
 */

import OpenAI from 'openai';
import { LLMConfig } from './config';
import { AITool } from '../types/ai-tool';
import aiTools from '../../data/ai_tools.json';

interface TaskBreakdown {
  task: string;
  description: string;
  recommendedTools: {
    name: string;
    reason: string;
    details?: typeof aiTools[0];
  }[];
}

export class LlamaMaverickClient {
  private client: OpenAI;
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
    
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEYが設定されていません');
    }

    this.client = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        'HTTP-Referer': 'https://github.com/your-repo',
        'X-Title': 'AI Tool Recommender'
      }
    });
  }

  /**
   * ユーザーのニーズを分析し、タスクを分解して最適なツールを推薦する
   * @param needs ユーザーのニーズ
   * @returns タスク分解と推薦ツールの情報
   */
  async analyzeNeedsAndRecommendTools(needs: string): Promise<TaskBreakdown[]> {
    // 型チェックとバリデーション
    if (typeof needs !== 'string') {
      throw new Error('ニーズは文字列で入力してください');
    }

    const trimmedNeeds = needs.trim();
    if (!trimmedNeeds) {
      throw new Error('ニーズを入力してください');
    }

    try {
      const response = await this.client.chat.completions.create({
        model: 'meta-llama/llama-4-maverick:free',
        messages: [
          {
            role: 'system',
            content: `あなたはAIツール推薦の専門家です。
ユーザーのニーズを分析し、必要なタスクに分解し、各タスクに最適なAIツールを推薦してください。
以下の形式でMarkdownで回答してください：

# タスク1: [タスク名]
説明: [タスクの詳細説明]
推薦ツール:
- [ツール名1]
  - 推薦理由: [このツールを推薦する理由]
- [ツール名2]（複数の選択肢がある場合）
  - 推薦理由: [このツールを推薦する理由]

# タスク2: [タスク名]
...`
          },
          {
            role: 'user',
            content: `ユーザーのニーズ: ${trimmedNeeds}

各タスクに対して、最適なAIツールを推薦してください。複数の選択肢がある場合は、それぞれの特徴や利点を比較して提示してください。`
          }
        ],
        max_tokens: this.config.generation.maxTokens,
        temperature: this.config.generation.temperature
      });

      // レスポンスのバリデーションと詳細ログ
      if (!response.choices || !response.choices[0]?.message?.content) {
        console.error('LLM APIレスポンス異常:', JSON.stringify(response, null, 2));
        throw new Error('LLM APIから有効なレスポンスが得られませんでした');
      }
      const content = response.choices[0].message.content;

      // Markdownをパースしてタスク分解情報を抽出
      const tasks = content.split('\n# ').filter(Boolean).map(taskSection => {
        const [taskLine, ...details] = taskSection.split('\n');
        const task = taskLine.replace('タスク: ', '').trim();
        
        // 説明の抽出（正規表現を修正）
        const detailsText = details.join('\n');
        const descriptionMatch = detailsText.match(/説明:\s*(.*?)(?=\n推薦ツール:|$)/);
        const description = descriptionMatch ? descriptionMatch[1].trim() : '';
        
        // 推薦ツールの抽出（正規表現を修正）
        const toolsSection = detailsText.split('推薦ツール:')[1] || '';
        const toolMatches = toolsSection.split('\n-').filter(Boolean);
        
        const recommendedTools = toolMatches.map(toolMatch => {
          const lines = toolMatch.trim().split('\n');
          const name = lines[0].trim();
          const reason = lines
            .filter(line => line.includes('推薦理由:'))
            .map(line => line.replace(/\s*-\s*推薦理由:\s*/, '').trim())
            .join(' ');

          // ai_tools.jsonから詳細情報を検索
          const toolDetails = aiTools.find(tool => 
            tool.name.toLowerCase() === name.toLowerCase() ||
            tool.name.toLowerCase().includes(name.toLowerCase())
          );

          return {
            name,
            reason,
            details: toolDetails
          };
        });

        return {
          task,
          description,
          recommendedTools
        };
      });

      if (!tasks.length) {
        throw new Error('タスクの分解に失敗しました');
      }

      return tasks;
    } catch (error) {
      console.error('Llama 4 Maverick APIの呼び出しに失敗しました:', error);
      throw new Error('Llama 4 Maverick APIの呼び出しに失敗しました');
    }
  }

  /**
   * 任意のAIツール名に対して詳細情報をJSON形式で生成する
   * @param toolName ツール名
   * @returns ツール詳細のJSONオブジェクト
   */
  async generateToolDetailsJson(toolName: string): Promise<any> {
    const response = await this.client.chat.completions.create({
      model: 'meta-llama/llama-4-maverick:free',
      messages: [
        {
          role: 'system',
          content: 'あなたはAIツールの詳細情報をJSON形式で出力する専門家です。'
        },
        {
          role: 'user',
          content: `AIツール「${toolName}」の詳細情報を、以下の形式のJSONのみで出力してください。\n\n{\n  "name": "ツール名",\n  "description": "ツールの詳細な説明",\n  "url": "公式URL",\n  "price": "価格情報（無料版の有無、有料プランの価格など）",\n  "features": ["主な機能1", "主な機能2", ...],\n  "pros": ["メリット1", "メリット2", ...],\n  "cons": ["デメリット1", "デメリット2", ...]\n}`
        }
      ],
      max_tokens: 800,
      temperature: 0.2
    });
    const content = response.choices[0]?.message?.content || '';
    console.log('LLM生レスポンス:', content);
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('LLMレスポンスにJSONが見つかりません: ' + content);
    }
    return JSON.parse(jsonMatch[0]);
  }
} 
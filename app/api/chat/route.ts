/**
 * チャットAPIルート
 * WebLLMを使用してチャット応答を生成します
 */

import { NextResponse } from 'next/server';
import { WebLLMClient } from '@/lib/llm/web-llm';
import { LLMConfig } from '@/lib/llm/config';

// WebLLMクライアントのインスタンス
let llmClient: WebLLMClient | null = null;

// 設定
const config: LLMConfig = {
  generation: {
    maxTokens: Number(process.env.NEXT_PUBLIC_WEBLLM_MAX_TOKENS) || 1000,
    temperature: Number(process.env.NEXT_PUBLIC_WEBLLM_TEMPERATURE) || 0.7
  }
};

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'メッセージが無効です' },
        { status: 400 }
      );
    }

    // WebLLMクライアントの初期化（初回のみ）
    if (!llmClient) {
      llmClient = new WebLLMClient(config);
      await llmClient.initialize();
    }

    // ユーザーのニーズを分析し、ツールを推薦
    const taskBreakdown = await llmClient.analyzeNeedsAndRecommendTools(message);

    // 応答の生成
    const response = {
      response: `以下のツールをお勧めします：\n\n${taskBreakdown.map(task => 
        `# ${task.task}\n${task.description}\n\n推薦ツール：\n${task.recommendedTools.map(tool => 
          `- ${tool.name}\n  理由：${tool.reason}`
        ).join('\n')}`
      ).join('\n\n')}`,
      recommendations: taskBreakdown
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('チャットAPIエラー:', error);
    return NextResponse.json(
      { 
        error: 'チャットの処理中にエラーが発生しました',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 
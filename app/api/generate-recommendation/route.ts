import { NextResponse } from 'next/server';
import { LlamaMaverickClient } from '@/lib/llm';
import { DEFAULT_LLM_CONFIG } from '@/lib/llm/config';

export async function POST(request: Request) {
  try {
    const { task, tools } = await request.json();
    
    if (!task || !tools) {
      return NextResponse.json(
        { error: 'タスクまたはツール情報が指定されていません' },
        { status: 400 }
      );
    }

    const llm = new LlamaMaverickClient(DEFAULT_LLM_CONFIG);
    const prompt = `
タスク「${task}」に関して、以下のAIツールの具体的な使い分けを説明してください：

ツール：${tools.join(', ')}

以下の形式で回答してください：
- どのような場合にどのツールを使うべきか
- 各ツールの特徴的な使用シーン
- 予算や技術レベルによる選択基準
`;

    const response = await llm.analyzeNeedsAndRecommendTools(prompt);
    const recommendation = Array.isArray(response) && response.length > 0
      ? response[0].description
      : undefined;

    return NextResponse.json({ recommendation });
  } catch (error) {
    console.error('推薦文の生成中にエラーが発生しました:', error);
    return NextResponse.json(
      { error: '推薦文の生成に失敗しました' },
      { status: 500 }
    );
  }
} 
/**
 * OpenRouter日本語LLMテストAPI（本番用）
 *
 * 概要:
 *   - POST /api/openrouter でプロンプトとモデル名を受け取り、OpenRouter API経由でLLM応答を返す
 *   - デフォルトモデルは mistralai/mixtral-8x7b-instruct（無料枠多め・日本語対応）
 *   - systemプロンプトで「必ず日本語のみで返答してください。」を明示
 *   - APIキーは.env.localのOPENROUTER_API_KEYから取得
 *
 * 制限事項:
 *   - サーバーサイドでのみ動作
 */
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { prompt, model } = await req.json();
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'APIキーが設定されていません' }, { status: 500 });
  }

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model || 'mistralai/mixtral-8x7b-instruct',
      messages: [
        { role: 'system', content: 'あなたは親切な日本語AIアシスタントです。必ず日本語のみで返答してください。複数タスクがある場合は必ずすべて分解して列挙してください。' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 512,
      temperature: 0.7,
    }),
  });

  const data = await res.json();
  return NextResponse.json(data);
} 
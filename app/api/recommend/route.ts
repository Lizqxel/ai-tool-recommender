import { NextResponse } from 'next/server';
import { getRecommendations } from '@/lib/llm';

// Node.js Runtimeを使用することを明示
export const runtime = 'nodejs';

interface RequestBody {
  needs: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 型チェックとバリデーション
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: '不正なリクエスト形式です' },
        { status: 400 }
      );
    }

    const { needs } = body as RequestBody;

    if (typeof needs !== 'string') {
      return NextResponse.json(
        { error: 'ニーズは文字列で入力してください' },
        { status: 400 }
      );
    }

    if (!needs.trim()) {
      return NextResponse.json(
        { error: 'ニーズを入力してください' },
        { status: 400 }
      );
    }

    const recommendations = await getRecommendations(needs.trim());
    return NextResponse.json({ tasks: recommendations });
  } catch (error) {
    console.error('推薦APIでエラーが発生しました:', error);
    const errorMessage = error instanceof Error ? error.message : 'AIツールの推薦中にエラーが発生しました';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 
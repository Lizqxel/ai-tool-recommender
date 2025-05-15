import { NextResponse } from 'next/server';
import { searchTools } from '@/lib/search';

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: '検索クエリが必要です' },
        { status: 400 }
      );
    }

    const tools = searchTools(query);

    return NextResponse.json({
      tools: tools.slice(0, 3)
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: '検索中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 
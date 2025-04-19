import { NextResponse } from 'next/server';
import { searchTools } from '@/lib/search';
import { generateToolDescription } from '@/lib/llm/generator';

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
    const descriptions = await Promise.all(
      tools.slice(0, 3).map(tool => generateToolDescription(tool, query))
    );

    return NextResponse.json({
      tools: tools.slice(0, 3),
      descriptions
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: '検索中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 
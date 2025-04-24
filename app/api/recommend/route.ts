import { NextResponse } from 'next/server';
import { generateToolDescription } from '@/lib/llm/generator';
import { recommendTools } from '@/lib/llm/generator';
import { RecommendationRequest, Recommendation } from '@/lib/types';

// Node.js Runtimeを使用することを明示
export const runtime = 'nodejs';

interface RecommendRequest {
  needs: string[];
}

function validateRequest(data: any): data is RecommendRequest {
  return (
    Array.isArray(data.needs) &&
    data.needs.every((n: any) => typeof n === 'string')
  );
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!validateRequest(data)) {
      return NextResponse.json(
        { error: '必要なパラメータが不足しているか、形式が正しくありません' },
        { status: 400 }
      );
    }

    const { needs } = data;

    // 推薦ロジックを使用してツールを取得
    const recommendedTools = recommendTools(needs, [], [], '');

    // 各ツールの説明を生成
    const recommendations = await Promise.all(
      recommendedTools.map(async (tool) => {
        const query = `
          ニーズ: ${needs.join(', ')}
        `;

        const description = await generateToolDescription(query, tool);

        return {
          name: tool.name,
          description: description,
          url: tool.officialUrl,
          price: tool.pricing.paidPlans[0]?.price || '無料',
          features: tool.features,
          pros: tool.pros,
          cons: tool.cons,
          category: tool.category,
          subcategory: tool.subcategory,
          imageUrl: tool.imageUrl
        };
      })
    );
    
    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('推薦APIでエラーが発生しました:', error);
    return NextResponse.json(
      { error: '推薦の生成中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import { LlamaMaverickClient } from '@/lib/llm';
import { DEFAULT_LLM_CONFIG } from '@/lib/llm/config';
import aiTools from '@/data/ai_tools.json';

export async function POST(request: Request) {
  try {
    const { toolName } = await request.json();
    
    if (!toolName) {
      return NextResponse.json(
        { error: 'ツール名が指定されていません' },
        { status: 400 }
      );
    }

    // まずai_tools.jsonから検索
    const toolFromJson = aiTools.find(
      tool => tool.name.toLowerCase() === toolName.toLowerCase()
    );
    if (toolFromJson) {
      // ai_tools.jsonの情報をそのまま返す
      return NextResponse.json({
        name: toolFromJson.name,
        description: toolFromJson.description,
        url: toolFromJson.officialUrl,
        price: toolFromJson.pricing.hasFree
          ? '無料版あり'
          : toolFromJson.pricing.paidPlans[0]?.price || '価格情報なし',
        features: toolFromJson.features,
        pros: toolFromJson.pros,
        cons: toolFromJson.cons
      });
    }

    // なければLLMで生成
    const llm = new LlamaMaverickClient(DEFAULT_LLM_CONFIG);
    let toolDetails;
    try {
      toolDetails = await llm.generateToolDetailsJson(toolName);
    } catch (e) {
      console.error('LLMのレスポンスをJSONにパースできませんでした:', e);
      return NextResponse.json(
        { error: 'ツール情報の生成に失敗しました（パースエラー）', raw: String(e) },
        { status: 500 }
      );
    }
    return NextResponse.json(toolDetails);
  } catch (error) {
    console.error('ツール詳細の取得中にエラーが発生しました:', error);
    return NextResponse.json(
      { error: 'ツール情報の取得に失敗しました' },
      { status: 500 }
    );
  }
} 
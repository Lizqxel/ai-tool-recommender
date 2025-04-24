import { NextResponse } from 'next/server';

export const runtime = 'edge';

// AIツールデータの型定義
interface AITool {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  features: string[];
  useCases: string[];
  pricing: {
    hasFree: boolean;
    freeFeatures: string[];
    paidPlans: Array<{
      name: string;
      price: string;
      features: string[];
    }>;
  };
  pros: string[];
  cons: string[];
  alternatives: string[];
  officialUrl: string;
}

async function getAIToolsData(): Promise<AITool[]> {
  const response = await fetch('http://localhost:3000/data/ai_tools.json');
  return response.json();
}

async function generateResponse(message: string, preferences: any): Promise<string> {
  const aiToolsData = await getAIToolsData();
  const lowerMessage = message.toLowerCase();
  
  // 画像生成関連の質問への応答
  if (
    lowerMessage.includes('画像') || 
    lowerMessage.includes('がぞう') || 
    lowerMessage.includes('イラスト') ||
    lowerMessage.includes('絵')
  ) {
    const imageTools = aiToolsData.filter(tool => 
      tool.category === '画像生成' || 
      tool.subcategory.includes('画像')
    );

    // 技術レベルに応じたフィルタリング
    const filteredTools = preferences.technicalLevel === '初心者' 
      ? imageTools.filter(tool => !tool.cons.some(con => con.includes('技術的')))
      : imageTools;

    let response = '画像生成AIについて、以下のツールがおすすめです：\n\n';
    
    filteredTools.forEach(tool => {
      response += `■ ${tool.name}\n`;
      response += `${tool.description}\n`;
      response += `【主な機能】${tool.features.slice(0, 3).join('、')}\n`;
      response += `【メリット】${tool.pros.slice(0, 2).join('、')}\n`;
      response += `【料金】${tool.pricing.hasFree ? '無料プランあり' : '有料プラン'}\n`;
      response += `【URL】${tool.officialUrl}\n\n`;
    });

    response += 'これらのツールについて、具体的に知りたい点はございますか？\n例：「Midjourneyの料金プランについて教えて」「Stable Diffusionの使い方を詳しく」など';
    return response;
  }

  // 特定のツールについての質問への応答
  const toolMatches = aiToolsData.filter(tool => 
    lowerMessage.includes(tool.name.toLowerCase()) || 
    lowerMessage.includes(tool.id.toLowerCase())
  );

  if (toolMatches.length > 0) {
    const tool = toolMatches[0];
    
    // 料金に関する質問
    if (lowerMessage.includes('料金') || lowerMessage.includes('価格') || lowerMessage.includes('プラン')) {
      let response = `${tool.name}の料金プランについて説明します：\n\n`;
      if (tool.pricing.hasFree) {
        response += `【無料プラン】\n`;
        response += tool.pricing.freeFeatures.map(feature => `・${feature}`).join('\n');
        response += '\n\n';
      }
      tool.pricing.paidPlans.forEach(plan => {
        response += `【${plan.name}】\n`;
        response += `価格：${plan.price}\n`;
        response += plan.features.map(feature => `・${feature}`).join('\n');
        response += '\n\n';
      });
      return response;
    }

    // 使い方に関する質問
    if (lowerMessage.includes('使い方') || lowerMessage.includes('方法')) {
      let response = `${tool.name}の基本的な使い方について説明します：\n\n`;
      response += `【主な用途】\n${tool.useCases.map(use => `・${use}`).join('\n')}\n\n`;
      response += `【特徴的な機能】\n${tool.features.map(feature => `・${feature}`).join('\n')}\n\n`;
      response += `【注意点】\n${tool.cons.map(con => `・${con}`).join('\n')}\n\n`;
      return response;
    }

    // デフォルトの応答
    let response = `${tool.name}について説明します：\n\n`;
    response += `${tool.description}\n\n`;
    response += `【主な特徴】\n${tool.features.slice(0, 5).map(feature => `・${feature}`).join('\n')}\n\n`;
    response += `【メリット】\n${tool.pros.map(pro => `・${pro}`).join('\n')}\n\n`;
    response += `詳しく知りたい点はございますか？\n・料金プランについて\n・具体的な使い方\n・類似ツールとの比較\nなど`;
    return response;
  }

  // 「教えて」「おすすめ」などの要求への応答
  if (lowerMessage.includes('教えて') || lowerMessage.includes('おすすめ')) {
    if (preferences.purpose) {
      // 目的に基づいてツールを検索
      const relevantTools = aiToolsData.filter(tool => 
        tool.useCases.some(useCase => 
          useCase.toLowerCase().includes(preferences.purpose.toLowerCase())
        )
      );

      if (relevantTools.length > 0) {
        let response = `${preferences.purpose}に関連するAIツールをご紹介します：\n\n`;
        relevantTools.slice(0, 3).forEach(tool => {
          response += `■ ${tool.name}\n`;
          response += `${tool.description}\n`;
          response += `【主な特徴】${tool.features.slice(0, 2).join('、')}\n`;
          response += `【料金】${tool.pricing.hasFree ? '無料プランあり' : '有料プラン'}\n\n`;
        });
        return response;
      }
    }
  }

  // デフォルトの応答
  return 'ご要望をより具体的に教えていただけますでしょうか？\n例：\n・画像生成AIを探している\n・無料で使えるAIツールを知りたい\n・初心者向けのAIツールを教えて\nなど';
}

export async function POST(request: Request) {
  try {
    const { message, preferences } = await request.json();
    const response = await generateResponse(message, preferences);
    return NextResponse.json({ response });
  } catch (error) {
    console.error('チャットAPIエラー:', error);
    return NextResponse.json(
      { error: 'チャット処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import { analyzeTask, recommendTools, generateRecommendation } from '@/lib/utils/task-analyzer';
import aiTools from '@/data/ai_tools_new.json';

export async function POST(request: Request) {
  try {
    const { task, tools } = await request.json();
    
    if (!task || !tools) {
      return NextResponse.json(
        { error: 'タスクまたはツール情報が指定されていません' },
        { status: 400 }
      );
    }

    // タスクの分析
    const taskResponse = analyzeTask(task);
    
    // 利用可能なツールのフィルタリング
    const availableTools = aiTools.filter(tool => tools.includes(tool.name));
    
    // ツールの推薦
    const recommendedTools = recommendTools(taskResponse, availableTools);
    
    // 推薦文の生成
    const recommendation = generateRecommendation(recommendedTools, taskResponse);

    return NextResponse.json({ recommendation });
  } catch (error) {
    console.error('推薦文の生成中にエラーが発生しました:', error);
    return NextResponse.json(
      { error: '推薦文の生成に失敗しました' },
      { status: 500 }
    );
  }
} 
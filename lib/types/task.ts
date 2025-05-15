/**
 * タスク関連の型定義
 * @module types/task
 */

import { AITool } from './ai-tool';

export interface TaskResponse {
  task: string;
  description: string;
  recommendedTools: RecommendedTool[];
  comparison?: string;
  recommendation?: string;
}

export interface RecommendedTool {
  name: string;
  reason: string;
  details?: AITool;
}

export interface TaskGroup {
  task: string;
  description: string;
  tools: ProcessedRecommendation[];
  comparison?: string;
  recommendation?: string;
}

export interface ProcessedRecommendation {
  name: string;
  description: string;
  url: string;
  price: string;
  features: string[];
  pros: string[];
  cons: string[];
} 
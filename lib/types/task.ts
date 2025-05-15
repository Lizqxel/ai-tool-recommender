/**
 * タスク関連の型定義
 * @module types/task
 */

import { AITool } from './ai-tool';

export interface TaskResponse {
  task: string;
  description: string;
  categories: string[];
  recommendedTools: RecommendedTool[];
  comparison?: string;
  recommendation?: string;
}

export interface RecommendedTool {
  name: string;
  reason: string;
  score?: number; // おすすめ度（1-5）
  details?: {
    description?: string;
    officialUrl?: string;
    pricing?: {
      hasFree?: boolean;
      paidPlans?: Array<{
        price?: string;
      }>;
    };
    features?: string[];
    pros?: string[];
    cons?: string[];
  };
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
/**
 * AIツールの型定義
 * @module types/ai-tool
 */

export interface AITool {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  features: string[];
  useCases: string[];
  pricing: {
    hasFree?: boolean;
    freeFeatures?: string[];
    paidPlans?: Array<{
      name?: string;
      price?: string;
      billingCycle?: string;
      features?: string[];
    }>;
  };
  officialUrl: string;
  apiAvailable: boolean;
  apiDocUrl: string;
  pros: string[];
  cons: string[];
  alternatives: string[];
  imageUrl: string;
  lastUpdated: string;
} 
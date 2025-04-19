/**
 * AIツールのインターフェース定義
 * @interface AITool
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
    hasFree: boolean;
    freeFeatures: string[];
    paidPlans: {
      name: string;
      price: string;
      billingCycle: string;
      features: string[];
    }[];
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
export interface RecommendationRequest {
  needs: string[];
}

export interface AITool {
  id: string;
  name: string;
  description: string;
  url: string;
  price: string;
  category: string;
  subcategory: string;
  useCases: string[];
  features: string[];
  pros: string[];
  cons: string[];
  imageUrl: string;
  rating: number;
  reviewCount: number;
  lastUpdated: string;
  supportedLanguages: string[];
  integrationOptions: string[];
  pricing: {
    hasFree: boolean;
    freeFeatures: string[];
    paidPlans: Array<{
      name: string;
      price: string;
      billingCycle: string;
      features: string[];
    }>;
  };
  officialUrl: string;
  apiAvailable: boolean;
  apiDocUrl: string;
  alternatives: string[];
}

export interface Recommendation {
  name: string;
  description: string;
  url: string;
  price: string;
  features: string[];
  pros: string[];
  cons: string[];
}

export interface RecommendationResponse {
  recommendations: Recommendation[];
} 
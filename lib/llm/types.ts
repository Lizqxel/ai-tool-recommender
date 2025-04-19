export interface ToolRecommendation {
  name: string;
  description: string;
  whyRecommended: string;
  features: string[];
  pricing: string;
  limitations: string[];
  alternatives?: string[];
}

export interface RecommendationRequest {
  needs: string[];
  budget: string;
  technicalLevel: string;
  priorities: string[];
  limitations: string[];
}

export interface Recommendation {
  name: string;
  description: string;
  needs: string[];
  budget: string;
  confidence: number;
}

export interface RecommendationResponse {
  recommendations: Recommendation[];
} 
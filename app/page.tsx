"use client";

import { useEffect, useState } from "react";
import { Search, Sparkles, Star, Zap, Brain, Image as ImageIcon, Music, Video, Code, Scale } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getOGPImage } from '@/lib/utils/ogp';
import { ChatPanel } from '@/app/components/ChatPanel';
import aiTools from '@/data/ai_tools.json';
import Image from 'next/image';
import { motion } from "framer-motion";
import { DEFAULT_LLM_CONFIG } from '@/lib/llm/config';

interface RecommendedTool {
  name: string;
  reason: string;
  details?: {
    description?: string;
    officialUrl?: string;
    pricing?: {
      paidPlans?: Array<{
        price?: string;
      }>;
    };
    features?: string[];
    pros?: string[];
    cons?: string[];
  };
}

interface TaskResponse {
  task: string;
  description: string;
  recommendedTools: RecommendedTool[];
  comparison?: string;
  recommendation?: string;
}

interface TaskGroup {
  task: string;
  description: string;
  tools: ProcessedRecommendation[];
  comparison?: string;
  recommendation?: string;
}

interface ProcessedRecommendation {
  name: string;
  description: string;
  url: string;
  price: string;
  features: string[];
  pros: string[];
  cons: string[];
}

interface LoadingStepProps {
  step: number;
  currentStep: number;
  label: string;
}

const LoadingStep: React.FC<LoadingStepProps> = ({ step, currentStep, label }) => {
  const isCompleted = currentStep > step;
  const isActive = currentStep === step;

  return (
    <motion.div 
      className="flex items-center space-x-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: step * 0.2 }}
    >
      <motion.div 
        className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isCompleted ? 'bg-green-500' : isActive ? 'bg-blue-500' : 'bg-gray-300'
        }`}
        initial={{ scale: 0.8 }}
        animate={{ scale: isActive ? [1, 1.1, 1] : 1 }}
        transition={{ duration: 0.5, repeat: isActive ? Infinity : 0 }}
      >
        {isCompleted ? (
          <motion.svg 
            className="w-5 h-5 text-white" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </motion.svg>
        ) : (
          <span className="text-white">{step + 1}</span>
        )}
      </motion.div>
      <span className={`text-sm ${isActive ? 'text-blue-500 font-medium' : 'text-gray-500'}`}>
        {label}
      </span>
    </motion.div>
  );
};

const popularTools = [
  {
    name: "ChatGPT",
    description: "自然な会話と文章生成が得意な言語モデル",
    category: "言語",
    url: "https://chat.openai.com",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=400",
    price: "無料（GPT-4は月額$20）",
    features: ["自然言語理解", "文章生成", "コード生成", "多言語対応", "画像理解"],
    pros: ["高度な言語理解", "多様なタスク対応", "使いやすいインターフェース", "定期的な機能更新"],
    cons: ["GPT-4は有料", "応答速度が遅い場合あり", "情報の正確性に限界"]
  },
  {
    name: "Midjourney",
    description: "高品質なアート作品や画像を生成",
    category: "画像",
    url: "https://midjourney.com",
    image: "https://images.unsplash.com/photo-1681124365088-70464520ef79?q=80&w=400",
    price: "月額$10〜$60",
    features: ["高品質画像生成", "アートスタイル", "画像編集", "バッチ処理", "コミュニティ"],
    pros: ["高品質な出力", "多様なスタイル", "活発なコミュニティ", "定期的なアップデート"],
    cons: ["Discord必須", "学習曲線", "有料プラン必要", "商用利用制限"]
  },
  {
    name: "Claude",
    description: "高度な分析と文章作成が可能なAIアシスタント",
    category: "言語",
    url: "https://claude.ai",
    image: "https://images.unsplash.com/photo-1676299081847-8b021cd4ce15?q=80&w=400",
    price: "無料（Claude Proは月額$20）",
    features: ["長文理解", "文章分析", "コード生成", "多言語対応", "論理的思考"],
    pros: ["長文処理能力", "論理的な応答", "倫理的配慮", "使いやすいインターフェース"],
    cons: ["無料版は制限あり", "応答速度が遅い場合あり", "特定の機能は有料"]
  },
  {
    name: "Stable Diffusion",
    description: "自由度の高い画像生成AI",
    category: "画像",
    url: "https://stability.ai",
    image: "https://images.unsplash.com/photo-1686191128892-3fd3d1e3bf90?q=80&w=400",
    price: "無料（商用利用はライセンス必要）",
    features: ["オープンソース", "ローカル実行", "カスタマイズ性", "多様なモデル", "API対応"],
    pros: ["完全な制御", "商用利用可能", "コミュニティサポート", "カスタマイズ性"],
    cons: ["技術知識必要", "リソース消費", "学習曲線", "品質管理が必要"]
  },
];

const categories = [
  { name: "すべて", icon: Sparkles, description: "全てのAIツール" },
  { name: "言語", icon: Brain, description: "大規模言語モデル、テキスト生成、翻訳" },
  { name: "画像", icon: ImageIcon, description: "画像生成、編集" },
  { name: "音声", icon: Music, description: "音声合成・変換" },
  { name: "動画", icon: Video, description: "動画生成・編集" },
  { name: "開発", icon: Code, description: "コード生成・補助" },
  { name: "生産性", icon: Zap, description: "ワークフロー、資料作成" },
  { name: "データ分析", icon: Star, description: "ビジネスインテリジェンス、分析" }
];

// カテゴリのマッピング
const categoryMapping: { [key: string]: string } = {
  "大規模言語モデル": "言語",
  "テキスト生成": "言語",
  "翻訳・多言語対応": "言語",
  "画像生成": "画像",
  "動画編集・生成": "動画",
  "音声・動画関連": "音声",
  "コード・開発支援": "開発",
  "生産性・ワークフロー": "生産性",
  "資料作成・ビジュアル化": "生産性",
  "データ分析・ビジネスインテリジェンス": "データ分析",
  "医療・ヘルスケア": "生産性",
  "教育・学習支援": "生産性",
  "マーケティング": "生産性",
  "セキュリティ・プライバシー": "開発",
  "AIアバター・バーチャルヒューマン": "画像",
  "特殊分野": "生産性"
};

// ツール名の正規化（小文字化・全角半角・記号除去・trim）
function normalizeToolName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[\s\-_.:：・]/g, '') // スペース・記号除去
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0)) // 全角→半角
    .trim();
}

// Levenshtein距離計算
function levenshtein(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + 1
        );
      }
    }
  }
  return matrix[a.length][b.length];
}

// ツール詳細取得（正規化・あいまい一致）
function getBestToolDetails(toolName: string) {
  const normName = normalizeToolName(toolName);
  let best = null;
  let minDist = Infinity;
  for (const tool of aiTools) {
    const normDbName = normalizeToolName(tool.name);
    if (normDbName === normName) {
      return tool; // 完全一致
    }
    // 部分一致
    if (normDbName.includes(normName) || normName.includes(normDbName)) {
      if (!best) best = tool;
    }
    // Levenshtein距離
    const dist = levenshtein(normDbName, normName);
    if (dist < minDist) {
      minDist = dist;
      best = tool;
    }
  }
  return best;
}

function validateInputs(needs: string, budget: string, technicalLevel: string, priorities: string, limitations: string): string | null {
  if (!needs.trim()) {
    return 'ニーズを入力してください';
  }
  if (!budget.trim()) {
    return '予算を入力してください';
  }
  if (!technicalLevel) {
    return '技術レベルを選択してください';
  }
  if (!priorities.trim()) {
    return '優先事項を入力してください';
  }
  if (!limitations.trim()) {
    return '制限事項を入力してください';
  }
  return null;
}

/**
 * OpenRouter API経由でニーズ分析・タスク分解・ツール推薦を行う関数
 * @param needs ユーザーのニーズ
 * @returns 推論結果の配列（パース済み）
 */
async function analyzeNeedsAndRecommendTools(needs: string): Promise<any[]> {
  const prompt = `あなたはAIツール推薦の専門家です。\nユーザーのニーズを分析し、必要なタスクに分解し、各タスクに最適なAIツールを推薦してください。\n必ず日本語のみで返答してください。\n以下の形式でMarkdownで回答してください：\n\n# タスク1: [タスク名]\n説明: [タスクの詳細説明]\n推薦ツール:\n- [ツール名1]\n  - 推薦理由: [このツールを推薦する理由]\n- [ツール名2]（複数の選択肢がある場合）\n  - 推薦理由: [このツールを推薦する理由]\n\n# タスク2: [タスク名]\n...\n\nユーザーのニーズ: ${needs}`;

  const res = await fetch("/api/openrouter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      model: "mistralai/mixtral-8x7b-instruct",
    }),
  });
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "";

  if (!content) {
    throw new Error("AIからの応答が空でした。もう一度お試しください。");
  }

  // Markdownをパースしてタスク分解情報を抽出（簡易実装）
  const tasks: any[] = [];
  const sections = content.split(/\n# /).filter(Boolean);
  
  if (sections.length === 0) {
    throw new Error("AIからの応答を解析できませんでした。もう一度お試しください。");
  }

  for (const section of sections) {
    const [taskLine, ...details] = section.split('\n');
    const task = taskLine.replace(/^タスク\d*:?\s*/, '').trim();
    const detailsText = details.join('\n');
    const descriptionMatch = detailsText.match(/説明:\s*(.*?)(?=\n推薦ツール:|$)/);
    const description = descriptionMatch ? descriptionMatch[1].trim() : '';
    const toolsSection = detailsText.split('推薦ツール:')[1] || '';
    const toolMatches = toolsSection.split('\n-').filter(Boolean);
    
    if (toolMatches.length === 0) {
      console.warn(`タスク「${task}」の推薦ツールが見つかりませんでした。`);
      continue;
    }

    const recommendedTools = toolMatches.map((toolMatch: string) => {
      const lines = toolMatch.trim().split('\n');
      const name = lines[0].trim();
      const reason = lines
        .filter((line: string) => line.includes('推薦理由:'))
        .map((line: string) => line.replace(/\s*-\s*推薦理由:\s*/, '').trim())
        .join(' ');
      
      if (!name || !reason) {
        console.warn(`ツール「${name}」の情報が不完全です。`);
        return null;
      }

      // aiToolsから詳細を検索
      const toolDetails = getBestToolDetails(name);
      return {
        name,
        reason,
        details: toolDetails
      };
    }).filter(Boolean);

    if (recommendedTools.length > 0) {
      tasks.push({
        task,
        description,
        recommendedTools
      });
    }
  }

  if (tasks.length === 0) {
    throw new Error("AIからの応答から有効なタスク情報を抽出できませんでした。もう一度お試しください。");
  }

  return tasks;
}

// ツール名やタイトルから**を除去するユーティリティ関数
function stripMarkdownBold(text: string): string {
  return text.replace(/^\*\*|\*\*$/g, '').replace(/\*\*/g, '');
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("すべて");
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});
  const [showChat, setShowChat] = useState(false);
  const [categoryTools, setCategoryTools] = useState<any[]>([]);
  const [displayedTools, setDisplayedTools] = useState<any[]>([]);
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<string>("");
  const [selectedTechnicalLevel, setSelectedTechnicalLevel] = useState<string>("");
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedLimitations, setSelectedLimitations] = useState<string[]>([]);
  const [loadingStep, setLoadingStep] = useState(0);
  const [taskGroups, setTaskGroups] = useState<TaskGroup[]>([]);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const loadingSteps = [
    "ニーズの分析中...",
    "タスクの分解中...",
    "最適なツールを検索中...",
    "結果を生成中..."
  ];

  // クライアントサイドでのみ実行される処理
  useEffect(() => {
    setMounted(true);
    // 初期データの設定
    if (activeCategory === "すべて") {
      setCategoryTools(aiTools);
      setDisplayedTools(aiTools);
    }
  }, []);

  // 画像URLの取得は必要な時のみ実行
  const fetchImageUrls = async (tools: any[]) => {
    if (!mounted) return;
    const urls: Record<string, string> = {};
    for (const tool of tools) {
      if (!imageUrls[tool.url]) {
        urls[tool.url] = await getOGPImage(tool.url);
      }
    }
    setImageUrls(prev => ({ ...prev, ...urls }));
  };

  // カテゴリ変更時の処理
  useEffect(() => {
    if (!mounted) return;
    
    const newTools = activeCategory === "すべて" 
      ? aiTools 
      : aiTools.filter(tool => categoryMapping[tool.category] === activeCategory);
    
    setCategoryTools(newTools);
    setDisplayedTools(newTools);
    fetchImageUrls(newTools);
  }, [activeCategory, mounted]);

  // ツール情報を取得または生成する関数
  const getToolDetails = (toolName: string): any => {
    // ai_tools.jsonから該当するツールを検索
    const toolFromJson = aiTools.find(
      tool => tool.name.toLowerCase() === toolName.toLowerCase()
    );
    
    if (toolFromJson) {
      return {
        name: toolFromJson.name,
        description: toolFromJson.description,
        url: toolFromJson.officialUrl,
        price: toolFromJson.pricing.hasFree 
          ? "無料版あり" 
          : toolFromJson.pricing.paidPlans[0]?.price || "価格情報なし",
        features: toolFromJson.features,
        pros: toolFromJson.pros,
        cons: toolFromJson.cons,
        category: toolFromJson.category
      };
    }
    
    // 必ず何かしら返す
    return {
      name: toolName,
      description: "情報なし",
      url: "#",
      price: "情報なし",
      features: [],
      pros: [],
      cons: [],
      category: "情報なし"
    };
  };

  // handleSearch関数を修正
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    let stepInterval: NodeJS.Timeout | undefined;
    try {
      setIsLoading(true);
      setError("");
      setLoadingStep(0);
      setTaskGroups([]);

      stepInterval = setInterval(() => {
        setLoadingStep(prev => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
      }, 1500);

      // ユーザーのニーズを分析し、タスクを分解して最適なツールを推薦
      const taskBreakdown = await analyzeNeedsAndRecommendTools(searchQuery.trim());

      if (stepInterval) {
        clearInterval(stepInterval);
      }

      // タスクグループを設定
      setTaskGroups(taskBreakdown.map((task: any) => ({
        task: task.task,
        description: task.description,
        tools: task.recommendedTools.map((tool: any) => ({
          name: tool.name,
          description: tool.reason,
          url: tool.details?.officialUrl || '#',
          price: tool.details?.pricing?.hasFree 
            ? '無料版あり' 
            : tool.details?.pricing?.paidPlans?.[0]?.price || '価格情報なし',
          features: tool.details?.features || [],
          pros: tool.details?.pros || [],
          cons: tool.details?.cons || []
        }))
      })));

    } catch (err) {
      if (stepInterval) {
        clearInterval(stepInterval);
      }
      const errorMessage = err instanceof Error 
        ? err.message 
        : '検索中にエラーが発生しました。もう一度お試しください。';
      setError(errorMessage);
      setTaskGroups([]);
      console.error('検索エラー:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 初期レンダリング時は何も表示しない
  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-accent to-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            AIツールナビゲーター
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
            あなたのニーズに最適なAIツールを見つけましょう。
            チャットで対話しながら、最適なツールをご紹介します。
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="relative mb-8">
            <Search className="absolute left-4 top-4 h-6 w-6 text-muted-foreground" />
            <Input
              placeholder="どんなことをしたいですか？（カンマ区切りで複数入力可）"
              className="pl-12 py-7 text-lg rounded-2xl glass-effect neon-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <Button
              className="absolute right-4 top-4 glass-effect hover:neon-border transition-all duration-300"
              onClick={handleSearch}
              disabled={isLoading}
            >
              {isLoading ? "検索中..." : "検索"}
            </Button>
          </div>
          {error && (
            <div className="text-red-500 mt-2 text-center">{error}</div>
          )}
          {isLoading && (
            <motion.div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
              >
                <div className="space-y-6">
                  {loadingSteps.map((label, index) => (
                    <LoadingStep
                      key={index}
                      step={index}
                      currentStep={loadingStep}
                      label={label}
                    />
                  ))}
                  <motion.div
                    className="h-1 bg-gray-200 rounded-full mt-6 overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <motion.div
                      className="h-full bg-blue-500 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: `${(loadingStep + 1) * 25}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
          <Tabs defaultValue="discover" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-12 glass-effect">
              <TabsTrigger value="discover">おすすめ</TabsTrigger>
              <TabsTrigger value="categories">カテゴリー</TabsTrigger>
            </TabsList>
            
            <TabsContent value="discover">
              {taskGroups.length > 0 ? (
                <div className="space-y-12">
                  {taskGroups.map((taskGroup, groupIndex) => (
                    <div key={groupIndex} className="bg-white/5 backdrop-blur-lg rounded-xl p-8 shadow-lg">
                      <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                          {taskGroup.task}
                        </h2>
                        <p className="text-gray-200 text-lg mb-6">
                          {taskGroup.description}
                        </p>

                        {/* 推薦理由と比較の表示 */}
                        {(taskGroup.recommendation || taskGroup.comparison) && (
                          <div className="bg-blue-500/10 rounded-lg p-6 border border-blue-500/20 mb-6">
                            {taskGroup.recommendation && (
                              <div className="mb-4">
                                <h3 className="text-blue-400 font-semibold mb-2 flex items-center">
                                  <Sparkles className="w-5 h-5 mr-2" />
                                  おすすめの使い分け
                                </h3>
                                <p className="text-gray-200 whitespace-pre-line">
                                  {taskGroup.recommendation}
                                </p>
                              </div>
                            )}
                            {taskGroup.comparison && (
                              <div>
                                <h3 className="text-blue-400 font-semibold mb-2 flex items-center">
                                  <Scale className="w-5 h-5 mr-2" />
                                  ツールの比較
                                </h3>
                                <p className="text-gray-200 whitespace-pre-line">
                                  {taskGroup.comparison}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {taskGroup.tools.map((tool, toolIndex) => (
                          <Card 
                            key={`${groupIndex}-${toolIndex}`} 
                            className="neumorphic overflow-hidden volumetric-light group relative"
                          >
                            <div className={`relative transition-all duration-300 ${
                              expandedCard === `${tool.name}-${groupIndex}-${toolIndex}` ? 'h-auto' : 'h-48'
                            }`}>
                              <div 
                                className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-gray-900/40"
                                style={{
                                  backgroundImage: `url(${imageUrls[tool.url] || `https://www.google.com/s2/favicons?domain=${tool.url}&sz=128`})`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                  filter: 'blur(20px) brightness(0.7)',
                                }}
                              />
                              
                              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/40 to-transparent" />
                              
                              <div className="relative p-6">
                                <div className="text-center">
                                  <img
                                    src={imageUrls[tool.url] || `https://www.google.com/s2/favicons?domain=${tool.url}&sz=128`}
                                    alt={tool.name}
                                    className="w-16 h-16 mx-auto mb-4 rounded-xl shadow-2xl transition-transform duration-300 group-hover:scale-110"
                                    style={{
                                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                      backdropFilter: 'blur(10px)',
                                      WebkitBackdropFilter: 'blur(10px)',
                                    }}
                                  />
                                  <h3 className="text-xl font-semibold text-white mb-3">{stripMarkdownBold(tool.name)}</h3>
                                  <div 
                                    className="relative cursor-pointer"
                                    onClick={() => setExpandedCard(
                                      expandedCard === `${tool.name}-${groupIndex}-${toolIndex}` 
                                        ? null 
                                        : `${tool.name}-${groupIndex}-${toolIndex}`
                                    )}
                                  >
                                    <p className={`
                                      text-sm text-gray-300 
                                      transition-all duration-300
                                      ${expandedCard === `${tool.name}-${groupIndex}-${toolIndex}`
                                        ? 'max-h-none' 
                                        : 'max-h-[60px] overflow-hidden'
                                      }
                                      whitespace-pre-line
                                    `}>
                                      {tool.description}
                                    </p>
                                    {expandedCard !== `${tool.name}-${groupIndex}-${toolIndex}` && (
                                      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-900 to-transparent" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <CardContent className="p-6 bg-gray-900/60 backdrop-blur-md">
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-gray-400">価格</span>
                                  <span className="text-sm font-semibold text-gray-200">{tool.price || '価格情報なし'}</span>
                                </div>
                                
                                <div>
                                  <span className="text-sm font-medium text-gray-400">主な機能</span>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {(tool.features && tool.features.length > 0 ? tool.features : ['情報なし']).map((feature: string, i: number) => (
                                      <span 
                                        key={i}
                                        className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-200 border border-blue-500/30"
                                      >
                                        {feature}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <span className="text-sm font-medium text-gray-400">メリット</span>
                                    <ul className="mt-2 space-y-1">
                                      {(tool.pros && tool.pros.length > 0 ? tool.pros : ['情報なし']).map((pro: string, i: number) => (
                                        <li key={i} className="text-sm flex items-center text-gray-300">
                                          <span className="mr-2 text-green-400">✓</span> {pro}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  
                                  <div>
                                    <span className="text-sm font-medium text-gray-400">デメリット</span>
                                    <ul className="mt-2 space-y-1">
                                      {(tool.cons && tool.cons.length > 0 ? tool.cons : ['情報なし']).map((con: string, i: number) => (
                                        <li key={i} className="text-sm flex items-center text-gray-300">
                                          <span className="mr-2 text-red-400">•</span> {con}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                                
                                {tool.url && tool.url !== '#' ? (
                                  <Button
                                    className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-all duration-300 shadow-lg hover:shadow-xl"
                                    onClick={() => window.open(tool.url, "_blank")}
                                  >
                                    使ってみる
                                  </Button>
                                ) : (
                                  <Button className="w-full mt-4" disabled>
                                    リンク情報なし
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {popularTools.map((tool) => (
                    <Card key={tool.name} className="neumorphic overflow-hidden volumetric-light group">
                      <div className="relative h-48 transition-all duration-300">
                        {/* 背景画像（ブラー効果付き） */}
                        <div 
                          className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-gray-900/40"
                          style={{
                            backgroundImage: `url(${imageUrls[tool.url] || `https://www.google.com/s2/favicons?domain=${tool.url}&sz=128`})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            filter: 'blur(20px) brightness(0.7)',
                          }}
                        />
                        
                        {/* オーバーレイグラデーション */}
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/40 to-transparent" />
                        
                        {/* アイコンとタイトルのコンテナ */}
                        <div className="relative flex items-center justify-center h-full p-6">
                          <div className="text-center">
                            <img
                              src={imageUrls[tool.url] || `https://www.google.com/s2/favicons?domain=${tool.url}&sz=128`}
                              alt={tool.name}
                              className="w-16 h-16 mx-auto mb-4 rounded-xl shadow-2xl transition-transform duration-300 group-hover:scale-110"
                              style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                              }}
                            />
                            <h3 className="text-xl font-semibold text-white mb-2">{stripMarkdownBold(tool.name)}</h3>
                            <p className="text-sm text-gray-300 line-clamp-2">{tool.description}</p>
                          </div>
                        </div>
                      </div>
                      
                      <CardContent className="p-6 bg-gray-900/60 backdrop-blur-md">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-400">価格</span>
                            <span className="text-sm font-semibold text-gray-200">{tool.price || '価格情報なし'}</span>
                          </div>
                          
                          <div>
                            <span className="text-sm font-medium text-gray-400">主な機能</span>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {(tool.features && tool.features.length > 0 ? tool.features : ['情報なし']).map((feature, i) => (
                                <span 
                                  key={i}
                                  className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-200 border border-blue-500/30"
                                >
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-sm font-medium text-gray-400">メリット</span>
                              <ul className="mt-2 space-y-1">
                                {(tool.pros && tool.pros.length > 0 ? tool.pros : ['情報なし']).map((pro, i) => (
                                  <li key={i} className="text-sm flex items-center text-gray-300">
                                    <span className="mr-2">✓</span> {pro}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <span className="text-sm font-medium text-gray-400">デメリット</span>
                              <ul className="mt-2 space-y-1">
                                {(tool.cons && tool.cons.length > 0 ? tool.cons : ['情報なし']).map((con, i) => (
                                  <li key={i} className="text-sm flex items-center text-gray-300">
                                    <span className="mr-2">•</span> {con}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          
                          {tool.url && tool.url !== '#' ? (
                            <Button
                              className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-all duration-300 shadow-lg hover:shadow-xl"
                              onClick={() => window.open(tool.url, "_blank")}
                            >
                              使ってみる
                            </Button>
                          ) : (
                            <Button className="w-full mt-4" disabled>
                              リンク情報なし
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="categories">
              <div className="space-y-8">
                {/* カテゴリ選択UI */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <Button
                        key={category.name}
                        variant={activeCategory === category.name ? "default" : "outline"}
                        className={`h-32 text-lg flex-col neumorphic ${
                          activeCategory === category.name ? 'neon-border' : ''
                        }`}
                        onClick={() => setActiveCategory(category.name)}
                      >
                        <Icon className="h-8 w-8 mb-2" />
                        <span className="text-lg mb-1">{category.name}</span>
                        <span className="text-sm text-muted-foreground">{category.description}</span>
                      </Button>
                    );
                  })}
                </div>

                {/* 選択されたカテゴリのツール一覧 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {displayedTools.map((tool) => (
                    <Card key={tool.id} className="neumorphic overflow-hidden volumetric-light group">
                      <div className={`relative transition-all duration-300 ${
                        expandedDescriptions[tool.officialUrl] ? 'h-auto min-h-[200px]' : 'h-48'
                      }`}>
                        {/* 背景画像（ブラー効果付き） */}
                        <div 
                          className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-gray-900/40"
                          style={{
                            backgroundImage: `url(${imageUrls[tool.officialUrl] || `https://www.google.com/s2/favicons?domain=${tool.officialUrl}&sz=128`})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            filter: 'blur(20px) brightness(0.7)',
                          }}
                        />
                        
                        {/* オーバーレイグラデーション */}
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/40 to-transparent" />
                        
                        {/* アイコンとタイトルのコンテナ */}
                        <div className="relative flex items-center justify-center h-full p-6">
                          <div className="text-center">
                            <img
                              src={imageUrls[tool.officialUrl] || `https://www.google.com/s2/favicons?domain=${tool.officialUrl}&sz=128`}
                              alt={tool.name}
                              className="w-16 h-16 mx-auto mb-4 rounded-xl shadow-2xl transition-transform duration-300 group-hover:scale-110"
                              style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                              }}
                            />
                            <h3 className="text-xl font-semibold text-white mb-2">{stripMarkdownBold(tool.name)}</h3>
                            <div 
                              className="relative cursor-pointer"
                              onClick={() => setExpandedDescriptions(prev => ({
                                ...prev,
                                [tool.officialUrl]: !prev[tool.officialUrl]
                              }))}
                            >
                              <p className={`
                                text-sm text-gray-300 
                                transition-all duration-300
                                ${expandedDescriptions[tool.officialUrl] 
                                  ? 'max-h-[160px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400/20 scrollbar-track-transparent' 
                                  : 'h-[60px] overflow-hidden'
                                }
                                max-w-[280px] mx-auto
                                pr-2
                              `}>
                                {tool.description}
                              </p>
                              {!expandedDescriptions[tool.officialUrl] && (
                                <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-gray-900/60 to-transparent pointer-events-none" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <CardContent className="p-6 bg-gray-900/60 backdrop-blur-md">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-400">価格</span>
                            <span className="text-sm font-semibold text-gray-200">{tool.price || '価格情報なし'}</span>
                          </div>
                          
                          <div>
                            <span className="text-sm font-medium text-gray-400">主な機能</span>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {(tool.features && tool.features.length > 0 ? tool.features : ['情報なし']).map((feature: string, i: number) => (
                                <span 
                                  key={i}
                                  className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-200 border border-blue-500/30"
                                >
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-sm font-medium text-gray-400">メリット</span>
                              <ul className="mt-2 space-y-1">
                                {(tool.pros && tool.pros.length > 0 ? tool.pros : ['情報なし']).map((pro: string, i: number) => (
                                  <li key={i} className="text-sm flex items-center text-gray-300">
                                    <span className="mr-2 text-green-400">✓</span> {pro}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <span className="text-sm font-medium text-gray-400">デメリット</span>
                              <ul className="mt-2 space-y-1">
                                {(tool.cons && tool.cons.length > 0 ? tool.cons : ['情報なし']).map((con: string, i: number) => (
                                  <li key={i} className="text-sm flex items-center text-gray-300">
                                    <span className="mr-2 text-red-400">•</span> {con}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          
                          {tool.url && tool.url !== '#' ? (
                            <Button
                              className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-all duration-300 shadow-lg hover:shadow-xl"
                              onClick={() => window.open(tool.url, "_blank")}
                            >
                              使ってみる
                            </Button>
                          ) : (
                            <Button className="w-full mt-4" disabled>
                              リンク情報なし
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <Button
          onClick={() => setShowChat(!showChat)}
          className="fixed bottom-8 right-8 z-50 glass-effect hover:neon-border transition-all duration-300"
        >
          {showChat ? 'チャットを閉じる' : 'AIアシスタントと話す'}
        </Button>
        {showChat && <ChatPanel onClose={() => setShowChat(false)} />}
      </div>
    </main>
  );
}
"use client";

import { useEffect, useState } from "react";
import { Search, Sparkles, Star, Zap, Brain, Image as ImageIcon, Music, Video, Code } from "lucide-react";
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

  useEffect(() => {
    setMounted(true);
  }, []);

  // 検索結果が更新されたら、すべての説明文を収縮状態にリセット
  useEffect(() => {
    if (recommendations.length > 0) {
      const initialState = recommendations.reduce((acc, rec) => ({
        ...acc,
        [rec.url]: false
      }), {});
      setExpandedDescriptions(initialState);
      fetchImageUrls(recommendations);
    }
  }, [recommendations]);

  // 画像URLを取得する関数
  const fetchImageUrls = async (tools: any[]) => {
    const urls: Record<string, string> = {};
    for (const tool of tools) {
      urls[tool.url] = await getOGPImage(tool.url);
    }
    setImageUrls(urls);
  };

  // お勧めツールの画像URLを取得
  useEffect(() => {
    fetchImageUrls(popularTools);
  }, []);

  // カテゴリが変更されたときにツールをフィルタリング
  useEffect(() => {
    if (activeCategory === "すべて") {
      setCategoryTools(aiTools);
    } else {
      const filteredTools = aiTools.filter(tool => categoryMapping[tool.category] === activeCategory);
      setCategoryTools(filteredTools);
    }
    fetchImageUrls(activeCategory === "すべて" ? aiTools : categoryTools);
  }, [activeCategory]);

  useEffect(() => {
    if (activeCategory === 'おすすめ') {
      setDisplayedTools(popularTools);
    } else {
      setDisplayedTools(categoryTools);
    }
  }, [activeCategory, popularTools, categoryTools]);

  if (!mounted) {
    return null;
  }

  const handleSearch = async () => {
    setIsLoading(true);
    setError("");

    if (!searchQuery.trim()) {
      setError('検索キーワードを入力してください');
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          needs: searchQuery.split(",").map((n) => n.trim()).filter(Boolean),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('APIエラーの詳細:', errorData);
        throw new Error(errorData.error || `APIエラー: ${response.status}`);
      }

      const data = await response.json();
      if (!data.recommendations || !Array.isArray(data.recommendations)) {
        throw new Error('不正なレスポンス形式です');
      }

      setRecommendations(data.recommendations);
    } catch (err) {
      console.error('推薦の取得に失敗:', err);
      setError(err instanceof Error ? err.message : "予期せぬエラーが発生しました");
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  };

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
          <Tabs defaultValue="discover" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-12 glass-effect">
              <TabsTrigger value="discover">おすすめ</TabsTrigger>
              <TabsTrigger value="categories">カテゴリー</TabsTrigger>
            </TabsList>
            
            <TabsContent value="discover">
              {recommendations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {recommendations.map((rec, index) => (
                    <Card key={index} className="neumorphic overflow-hidden volumetric-light group">
                      <div className={`relative transition-all duration-300 ${
                        expandedDescriptions[rec.url] ? 'h-auto min-h-[200px]' : 'h-48'
                      }`}>
                        {/* 背景画像（ブラー効果付き） */}
                        <div 
                          className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-gray-900/40"
                          style={{
                            backgroundImage: `url(${imageUrls[rec.url] || `https://www.google.com/s2/favicons?domain=${rec.url}&sz=128`})`,
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
                              src={imageUrls[rec.url] || `https://www.google.com/s2/favicons?domain=${rec.url}&sz=128`}
                              alt={rec.name}
                              className="w-16 h-16 mx-auto mb-4 rounded-xl shadow-2xl transition-transform duration-300 group-hover:scale-110"
                              style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                              }}
                            />
                            <h3 className="text-xl font-semibold text-white mb-2">{rec.name}</h3>
                            <div 
                              className="relative cursor-pointer"
                              onClick={() => setExpandedDescriptions(prev => ({
                                ...prev,
                                [rec.url]: !prev[rec.url]
                              }))}
                            >
                              <p className={`
                                text-sm text-gray-300 
                                transition-all duration-300
                                ${expandedDescriptions[rec.url] 
                                  ? 'max-h-[160px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400/20 scrollbar-track-transparent' 
                                  : 'h-[60px] overflow-hidden'
                                }
                                max-w-[280px] mx-auto
                                pr-2
                              `}>
                                {rec.description}
                              </p>
                              {!expandedDescriptions[rec.url] && (
                                <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-gray-900/60 to-transparent pointer-events-none" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <CardContent className="p-6 bg-white dark:bg-gray-900">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">価格</span>
                            <span className="text-sm font-semibold">{rec.price}</span>
                          </div>
                          
                          <div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">主な機能</span>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {rec.features.map((feature: string, i: number) => (
                                <span 
                                  key={i}
                                  className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                >
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">メリット</span>
                              <ul className="mt-2 space-y-1">
                                {rec.pros.map((pro: string, i: number) => (
                                  <li key={i} className="text-sm flex items-center text-gray-700 dark:text-gray-300">
                                    <span className="mr-2">✓</span> {pro}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">デメリット</span>
                              <ul className="mt-2 space-y-1">
                                {rec.cons.map((con: string, i: number) => (
                                  <li key={i} className="text-sm flex items-center text-gray-700 dark:text-gray-300">
                                    <span className="mr-2">•</span> {con}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          
                          <Button
                            className="w-full mt-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transition-all duration-300 shadow-lg hover:shadow-xl"
                            onClick={() => window.open(rec.url, "_blank")}
                          >
                            使ってみる
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
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
                            <h3 className="text-xl font-semibold text-white mb-2">{tool.name}</h3>
                            <p className="text-sm text-gray-300 line-clamp-2">{tool.description}</p>
                          </div>
                        </div>
                      </div>
                      
                      <CardContent className="p-6 bg-white dark:bg-gray-900">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">価格</span>
                            <span className="text-sm font-semibold">{tool.price}</span>
                          </div>
                          
                          <div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">主な機能</span>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {tool.features.map((feature, i) => (
                                <span 
                                  key={i}
                                  className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                >
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">メリット</span>
                              <ul className="mt-2 space-y-1">
                                {tool.pros.map((pro, i) => (
                                  <li key={i} className="text-sm flex items-center text-gray-700 dark:text-gray-300">
                                    <span className="mr-2">✓</span> {pro}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">デメリット</span>
                              <ul className="mt-2 space-y-1">
                                {tool.cons.map((con, i) => (
                                  <li key={i} className="text-sm flex items-center text-gray-700 dark:text-gray-300">
                                    <span className="mr-2">•</span> {con}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          
                          <Button
                            className="w-full mt-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transition-all duration-300 shadow-lg hover:shadow-xl"
                            onClick={() => window.open(tool.url, "_blank")}
                          >
                            使ってみる
                          </Button>
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
                            <h3 className="text-xl font-semibold text-white mb-2">{tool.name}</h3>
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
                      
                      <CardContent className="p-6 bg-white dark:bg-gray-900">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">価格</span>
                            <span className="text-sm font-semibold">
                              {tool.pricing.hasFree ? "無料" : "有料"} {tool.pricing.paidPlans[0]?.price ? `(${tool.pricing.paidPlans[0].price})` : ""}
                            </span>
                          </div>
                          
                          <div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">主な機能</span>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {tool.features.map((feature: string, i: number) => (
                                <span 
                                  key={i}
                                  className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                >
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">メリット</span>
                              <ul className="mt-2 space-y-1">
                                {tool.pros.map((pro: string, i: number) => (
                                  <li key={i} className="text-sm flex items-center text-gray-700 dark:text-gray-300">
                                    <span className="mr-2">✓</span> {pro}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">デメリット</span>
                              <ul className="mt-2 space-y-1">
                                {tool.cons.map((con: string, i: number) => (
                                  <li key={i} className="text-sm flex items-center text-gray-700 dark:text-gray-300">
                                    <span className="mr-2">•</span> {con}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          
                          <Button
                            className="w-full mt-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transition-all duration-300 shadow-lg hover:shadow-xl"
                            onClick={() => window.open(tool.officialUrl, "_blank")}
                          >
                            使ってみる
                          </Button>
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
"use client";

import { useEffect, useState } from "react";
import { Search, Sparkles, Star, Zap, Brain, Image, Music, Video, Code } from "lucide-react";
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

const popularTools = [
  {
    name: "ChatGPT",
    description: "自然な会話と文章生成が得意な言語モデル",
    category: "言語",
    url: "https://chat.openai.com",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=400",
  },
  {
    name: "Midjourney",
    description: "高品質なアート作品や画像を生成",
    category: "画像",
    url: "https://midjourney.com",
    image: "https://images.unsplash.com/photo-1681124365088-70464520ef79?q=80&w=400",
  },
  {
    name: "Claude",
    description: "高度な分析と文章作成が可能なAIアシスタント",
    category: "言語",
    url: "https://claude.ai",
    image: "https://images.unsplash.com/photo-1676299081847-8b021cd4ce15?q=80&w=400",
  },
  {
    name: "Stable Diffusion",
    description: "自由度の高い画像生成AI",
    category: "画像",
    url: "https://stability.ai",
    image: "https://images.unsplash.com/photo-1686191128892-3fd3d1e3bf90?q=80&w=400",
  },
];

const categories = [
  { name: "すべて", icon: Sparkles, description: "全てのAIツール" },
  { name: "言語", icon: Brain, description: "テキスト生成・会話" },
  { name: "画像", icon: Image, description: "画像生成・編集" },
  { name: "音声", icon: Music, description: "音声合成・変換" },
  { name: "動画", icon: Video, description: "動画生成・編集" },
  { name: "開発", icon: Code, description: "コード生成・補助" },
];

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

  useEffect(() => {
    setMounted(true);
  }, []);

  // 画像URLを取得する関数
  const fetchImageUrls = async (tools: any[]) => {
    const urls: Record<string, string> = {};
    for (const tool of tools) {
      urls[tool.url] = await getOGPImage(tool.url);
    }
    setImageUrls(urls);
  };

  useEffect(() => {
    if (recommendations.length > 0) {
      fetchImageUrls(recommendations);
    }
  }, [recommendations]);

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
            やりたいことを入力するだけで、最適なツールをご紹介します。
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-16">
          <div className="relative">
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
        </div>

        <Tabs defaultValue="discover" className="max-w-5xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-12 glass-effect">
            <TabsTrigger value="discover">おすすめ</TabsTrigger>
            <TabsTrigger value="categories">カテゴリー</TabsTrigger>
          </TabsList>
          
          <TabsContent value="discover">
            {recommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recommendations.map((rec, index) => (
                  <Card key={index} className="neumorphic overflow-hidden volumetric-light group">
                    <div className="relative h-48">
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
                          <p className="text-sm text-gray-300 line-clamp-2">{rec.description}</p>
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
                            {rec.features.slice(0, 3).map((feature, i) => (
                              <span 
                                key={i}
                                className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">メリット</span>
                            <ul className="mt-2 space-y-1">
                              {rec.pros.slice(0, 2).map((pro, i) => (
                                <li key={i} className="text-sm flex items-center text-gray-700 dark:text-gray-300">
                                  <span className="mr-2">✓</span> {pro}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">デメリット</span>
                            <ul className="mt-2 space-y-1">
                              {rec.cons.slice(0, 2).map((con, i) => (
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {popularTools.map((tool) => (
                  <Card key={tool.name} className="neumorphic overflow-hidden volumetric-light">
                    <img
                      src={tool.image}
                      alt={tool.name}
                      className="w-full h-48 object-cover"
                    />
                    <CardHeader>
                      <CardTitle className="text-xl">{tool.name}</CardTitle>
                      <CardDescription className="text-base">{tool.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        className="w-full glass-effect hover:neon-border transition-all duration-300"
                        onClick={() => window.open(tool.url, "_blank")}
                      >
                        使ってみる
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="categories">
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
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
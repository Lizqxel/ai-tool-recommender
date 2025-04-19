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
  const [needs, setNeeds] = useState("");
  const [budget, setBudget] = useState("");
  const [technicalLevel, setTechnicalLevel] = useState("");
  const [priorities, setPriorities] = useState("");
  const [limitations, setLimitations] = useState("");
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const filteredTools = popularTools.filter(
    (tool) =>
      (activeCategory === "すべて" || tool.category === activeCategory) &&
      (tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleRecommend = async () => {
    setIsLoading(true);
    setError("");

    const validationError = validateInputs(needs, budget, technicalLevel, priorities, limitations);
    if (validationError) {
      setError(validationError);
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
          needs: needs.split(",").map((n) => n.trim()).filter(Boolean),
          budget,
          technicalLevel,
          priorities: priorities.split(",").map((p) => p.trim()).filter(Boolean),
          limitations: limitations.split(",").map((l) => l.trim()).filter(Boolean),
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
              placeholder="どんなことをしたいですか？"
              className="pl-12 py-7 text-lg rounded-2xl glass-effect neon-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="discover" className="max-w-5xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-12 glass-effect">
            <TabsTrigger value="discover">おすすめ</TabsTrigger>
            <TabsTrigger value="categories">カテゴリー</TabsTrigger>
            <TabsTrigger value="recommend">カスタム推薦</TabsTrigger>
          </TabsList>
          
          <TabsContent value="discover">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTools.map((tool) => (
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

          <TabsContent value="recommend">
            <Card className="p-6 neumorphic">
              <CardHeader>
                <CardTitle>カスタム推薦</CardTitle>
                <CardDescription>
                  あなたのニーズに合わせて最適なAIツールを推薦します
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="needs">ニーズ（カンマ区切り）</Label>
                    <Textarea
                      id="needs"
                      placeholder="例: 画像生成, テキスト生成, コード生成"
                      value={needs}
                      onChange={(e) => setNeeds(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="budget">予算</Label>
                    <Input
                      id="budget"
                      placeholder="例: 無料, 月額1000円以下"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="technicalLevel">技術レベル</Label>
                    <Select value={technicalLevel} onValueChange={setTechnicalLevel}>
                      <SelectTrigger id="technicalLevel" className="mt-1">
                        <SelectValue placeholder="技術レベルを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="初心者">初心者</SelectItem>
                        <SelectItem value="中級者">中級者</SelectItem>
                        <SelectItem value="上級者">上級者</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priorities">優先事項（カンマ区切り）</Label>
                    <Textarea
                      id="priorities"
                      placeholder="例: 使いやすさ, 精度, 速度"
                      value={priorities}
                      onChange={(e) => setPriorities(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="limitations">制限事項（カンマ区切り）</Label>
                    <Textarea
                      id="limitations"
                      placeholder="例: インターネット接続不要, 日本語対応"
                      value={limitations}
                      onChange={(e) => setLimitations(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <Button
                    className="w-full glass-effect hover:neon-border transition-all duration-300"
                    onClick={handleRecommend}
                    disabled={isLoading}
                  >
                    {isLoading ? "推薦を生成中..." : "推薦を取得"}
                  </Button>
                  {error && (
                    <div className="text-red-500 mt-2">{error}</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {recommendations.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">推薦結果</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recommendations.map((rec, index) => (
                    <Card key={index} className="neumorphic overflow-hidden">
                      <CardHeader>
                        <CardTitle>{rec.name}</CardTitle>
                        <CardDescription>{rec.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div>
                            <span className="font-semibold">価格:</span> {rec.price}
                          </div>
                          <div>
                            <span className="font-semibold">機能:</span>{" "}
                            {rec.features.join(", ")}
                          </div>
                          <div>
                            <span className="font-semibold">メリット:</span>
                            <ul className="list-disc list-inside">
                              {rec.pros.map((pro: string, i: number) => (
                                <li key={i}>{pro}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span className="font-semibold">デメリット:</span>
                            <ul className="list-disc list-inside">
                              {rec.cons.map((con: string, i: number) => (
                                <li key={i}>{con}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <Button
                          className="w-full mt-4 glass-effect hover:neon-border transition-all duration-300"
                          onClick={() => window.open(rec.url, "_blank")}
                        >
                          使ってみる
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
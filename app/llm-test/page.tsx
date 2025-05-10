"use client";
/**
 * @fileoverview
 * @description
 *   @xenova/transformers.js を用いたクライアントサイド日本語LLM疎通テストページ。
 *   KoichiYasuoka/gpt2-small-japanese-wikipedia-juman-upos を利用。
 * @spec
 *   - クライアントサイドのみで動作
 *   - 型安全・エラー詳細表示
 *   - モデルは初回のみダウンロード（キャッシュされる）
 * @limitation
 *   - モデルサイズ・ブラウザメモリに注意
 */

import { useState } from "react";

export default function LLMTestPage() {
  const [input, setInput] = useState("こんにちは！");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/openrouter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: input,
          model: "mistralai/mixtral-8x7b-instruct", // OpenRouter公式の正しいモデルID
        }),
      });
      const data = await res.json();
      if (data.choices && data.choices[0]?.message?.content) {
        setResult(data.choices[0].message.content);
      } else if (data.error) {
        setResult("エラー: " + (typeof data.error === "string" ? data.error : JSON.stringify(data.error, null, 2)));
      } else {
        setResult("不明な応答: " + JSON.stringify(data));
      }
    } catch (e: any) {
      setResult("エラー: " + (e?.message ?? String(e)));
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 32 }}>
      <h2>OpenRouter日本語LLMテスト</h2>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        style={{ fontSize: 16, width: 300, marginRight: 8 }}
        disabled={loading}
      />
      <button onClick={handleTest} disabled={loading} style={{ fontSize: 16 }}>
        {loading ? "テスト中..." : "生成"}
      </button>
      <div style={{ marginTop: 24, whiteSpace: "pre-wrap", fontSize: 16 }}>{result}</div>
    </div>
  );
} 
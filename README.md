# AI Tool Recommender

AIツール推薦システムは、ユーザーが自然言語で入力した内容に基づいて、最適なAIツールを推薦するウェブアプリケーションです。近未来的なUIデザインを採用し、誰でも簡単にAIツールを見つけて利用できる環境を提供します。

## 実装済みの機能

1. **AIツール推薦エンジン**
   - スコアリングベースの推薦アルゴリズム
   - ニーズ、優先事項、制限事項に基づく最適なツール選定
   - 予算に応じた柔軟な推薦

2. **AIツールデータベース**
   - 20以上の最新AIツールの情報を収録
   - 各ツールの詳細情報（機能、ユースケース、料金プラン、メリット・デメリットなど）
   - カテゴリ別の整理（画像生成、テキスト生成、音声・動画関連など）

3. **バックエンドAPI**
   - 推薦ロジックを実装したAPIエンドポイント
   - エラーハンドリング機能
   - Node.js Runtimeでの安定した動作

## 開発中の機能

1. **LLM統合**
   - tiny-llamaの導入
   - 自然言語による検索・推薦機能
   - 推薦理由の自然言語での説明

2. **検索機能の強化**
   - Fuse.jsを用いた高度な検索
   - カテゴリベースのフィルタリング
   - キーワードベースの検索

## 技術スタック

- **フロントエンド**: Next.js 15.3.1, React, TailwindCSS
- **バックエンド**: Next.js API Routes
- **データベース**: JSONベースのローカルデータベース
- **LLM**: tiny-llama（実装予定）
- **デプロイ**: Vercel（予定）

## プロジェクト構造

```
ai-tool-recommender/
├── app/
│   ├── api/         # APIエンドポイント
│   │   └── recommend/  # 推薦API
│   ├── globals.css  # グローバルスタイル
│   ├── layout.tsx   # レイアウト
│   └── page.tsx     # メインページ
├── components/      # UIコンポーネント
├── lib/
│   ├── llm/        # LLM関連機能
│   └── types/      # 型定義
├── data/
│   └── ai_tools.json  # AIツールデータベース
├── models/         # LLMモデル用ディレクトリ
└── hooks/         # カスタムフック
```

## ローカル開発環境のセットアップ

```bash
# リポジトリをクローン
git clone <repository-url>
cd ai-tool-recommender

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

## 必要要件

- Node.js 18.0.0以上
- npm 9.0.0以上
- 8GB以上のRAM（LLM実行時）

## 今後の開発予定

1. LLM統合の完了
2. 検索機能の実装
3. UIの改善とアニメーション追加
4. テストの作成と実行
5. Vercelへのデプロイ

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。
Licensed under the Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0)

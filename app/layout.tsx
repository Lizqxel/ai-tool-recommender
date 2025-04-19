import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AIツールナビゲーター - あなたに最適なAIツールを見つけよう',
  description: 'さまざまなAIツールの中から、あなたのニーズに最適なものを簡単に見つけることができます。AIツールの比較・検索・推薦システム。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
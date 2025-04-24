/**
 * OGP画像を取得する関数
 * @param url 対象のURL
 * @returns Promise<string> OGP画像のURL、取得できない場合はファビコンのURL
 */
export async function getOGPImage(url: string): Promise<string> {
  try {
    // URLからドメインを抽出
    const domain = new URL(url).hostname;
    
    // OGP画像を取得するためのリクエスト
    const response = await fetch(url);
    const html = await response.text();
    
    // OGP画像のURLを抽出
    const ogImageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i);
    if (ogImageMatch && ogImageMatch[1]) {
      return ogImageMatch[1];
    }
    
    // OGP画像が取得できない場合はファビコンを返す
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch (error) {
    console.error('OGP画像の取得に失敗:', error);
    // エラー時もファビコンを返す
    return `https://www.google.com/s2/favicons?domain=${url}&sz=128`;
  }
} 
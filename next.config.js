/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        perf_hooks: false,
        fs: false,
        path: false,
        crypto: false,
        module: false,
        url: false,
      };
    }

    // WebLLMのWASMファイルを適切に処理
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/wasm/[hash][ext]'
      }
    });
    
    return config;
  },
  env: {
    NEXT_PUBLIC_WEBLLM_MODEL_NAME: process.env.NEXT_PUBLIC_WEBLLM_MODEL_NAME,
    NEXT_PUBLIC_WEBLLM_MODEL_URL: process.env.NEXT_PUBLIC_WEBLLM_MODEL_URL,
    NEXT_PUBLIC_WEBLLM_MODEL_LIB_URL: process.env.NEXT_PUBLIC_WEBLLM_MODEL_LIB_URL,
    NEXT_PUBLIC_WEBLLM_MAX_TOKENS: process.env.NEXT_PUBLIC_WEBLLM_MAX_TOKENS,
    NEXT_PUBLIC_WEBLLM_TEMPERATURE: process.env.NEXT_PUBLIC_WEBLLM_TEMPERATURE,
  },
  // WebLLMのモデルファイルを提供するための設定
  async headers() {
    return [
      {
        source: '/models/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
      {
        source: '/.cache/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
    ];
  },
  // 重要な設定を追加
  experimental: {
    // WASMのサポートを有効化
    webpackBuildWorker: true,
    // 大きなファイルのサポート
    largePageDataBytes: 10 * 1024 * 1024, // 10MB
  },
};

module.exports = nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // ネイティブモジュールをWebpackの処理から除外
    config.externals = [...(config.externals || []), '@llama-node/llama-cpp'];
    
    // サーバーサイドでのみネイティブモジュールを読み込む
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@llama-node/llama-cpp': '@llama-node/llama-cpp',
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;
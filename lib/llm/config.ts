/**
 * LLMの設定を定義するインターフェース
 */
export interface LLMConfig {
  generation: {
    maxTokens: number;
    temperature: number;
  };
  prompt?: {
    system?: string;
    user?: string;
  };
}

/**
 * デフォルトのLLM設定
 */
export const DEFAULT_LLM_CONFIG: LLMConfig = {
  prompt: {
    system: '',
  },
  generation: {
    maxTokens: 2000,
    temperature: 0.7,
  },
};

/**
 * LLMの設定値
 * @constant LLM_CONFIG
 */
export const LLM_CONFIG: LLMConfig = {
  modelPath: "./models/Ministral-8B-Instruct-2410-Q4_K_M.gguf",
  temperature: 0.7,
  maxTokens: 2048,
  topP: 0.9,
  generation: {
    maxTokens: 2048,
    temperature: 0.7,
    topP: 0.9,
  },
  prompt: {
    system: "あなたはAIツールの推薦を行う専門家です。ユーザーのニーズ、優先事項、制限事項に基づいて、最適なAIツールを提案してください。",
    user: "ユーザーのニーズ: {needs}\n優先事項: {priorities}\n制限事項: {limitations}\n\nこれらの条件に基づいて、最適なAIツールを提案してください。"
  }
};

export const LLM_CONFIG_GENERATION = {
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 500,
  stopSequences: ['</s>', 'Human:', 'Assistant:', '\n\n']
};

export const LLM_CONFIG_PROMPT = {
  template: `以下のAIツールについて、ユーザーの質問に基づいて説明を生成してください：

ツール名: {name}
説明: {description}
機能: {features}
ユースケース: {useCases}

ユーザーの質問: {query}

回答:`,
}; 
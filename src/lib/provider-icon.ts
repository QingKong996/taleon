import { providerMappings } from '@lobehub/icons-rn';

const PROVIDER_ICON_ALIASES: Record<string, string> = {
  '302ai': 'ai302',
  'alibaba-cn': 'alibaba',
  'alibaba-coding-plan': 'alibaba',
  'alibaba-coding-plan-cn': 'alibaba',
  'alibaba-token-plan': 'alibaba',
  'alibaba-token-plan-cn': 'alibaba',
  'amazon-bedrock': 'bedrock',
  'ant-ling': 'antgroup',
  'byteplus': 'bytedance',
  'cloudflare-ai-gateway': 'cloudflare',
  'cloudflare-workers-ai': 'workersai',
  'fireworks': 'fireworksai',
  'fireworks-ai': 'fireworksai',
  'google-vertex': 'vertexai',
  'kimi-coding': 'moonshot',
  'minimax-cn': 'minimax',
  'minimax-cn-coding-plan': 'minimaxcodingplan',
  'moonshotai': 'moonshot',
  'moonshotai-cn': 'moonshot',
  'novita-ai': 'novita',
  'ollama-cloud': 'ollamacloud',
  'openai-codex': 'openai',
  'opencode-go': 'opencodego',
  'opencode-zen': 'opencodezen',
  'qwen-token-plan': 'qwen',
  'qwen-token-plan-cn': 'qwen',
  'qwen-token-plan-individual': 'qwen',
  'qwen-token-plan-individual-cn': 'qwen',
  'siliconflow': 'siliconcloud',
  'siliconflow-cn': 'siliconcloud',
  'tencent-tokenhub': 'tencent',
  'vercel-ai-gateway': 'vercelaigateway',
  'xiaomi': 'xiaomimimo',
  'xiaomi-token-plan-ams': 'xiaomimimo',
  'xiaomi-token-plan-cn': 'xiaomimimo',
  'xiaomi-token-plan-sgp': 'xiaomimimo',
  'zai': 'zhipu',
  'zai-coding-cn': 'zhipu',
};

const providerIconKeywords = new Map(
  providerMappings.flatMap((mapping) =>
    mapping.keywords.map((keyword) => [keyword.toLowerCase(), keyword] as const),
  ),
);

export function getProviderIconKeyword(providerId: string, providerName: string) {
  const candidates = [
    PROVIDER_ICON_ALIASES[providerId.toLowerCase()],
    providerId,
    providerName,
  ];

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    const keyword = providerIconKeywords.get(candidate.toLowerCase());

    if (keyword) {
      return keyword;
    }
  }

  return undefined;
}

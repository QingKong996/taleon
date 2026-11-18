import type { KnownApi } from '@earendil-works/pi-ai';

export const PROVIDER_API_OPTIONS = [
  { label: 'OpenAI Responses', value: 'openai-responses' },
  { label: 'OpenAI Completions', value: 'openai-completions' },
  { label: 'Anthropic Messages', value: 'anthropic-messages' },
  { label: 'Google Generative AI', value: 'google-generative-ai' },
  { label: 'Google Vertex', value: 'google-vertex' },
  { label: 'OpenAI Codex', value: 'openai-codex-responses' },
  { label: 'Azure OpenAI', value: 'azure-openai-responses' },
  { label: 'Mistral', value: 'mistral-conversations' },
  { label: 'Bedrock Converse', value: 'bedrock-converse-stream' },
  { label: 'Pi Messages', value: 'pi-messages' },
] as const satisfies readonly { label: string; value: KnownApi }[];

const API_BY_PROVIDER_ID: Record<string, KnownApi> = {
  'amazon-bedrock': 'bedrock-converse-stream',
  'ant-ling': 'openai-completions',
  anthropic: 'anthropic-messages',
  azure: 'azure-openai-responses',
  baseten: 'openai-completions',
  cerebras: 'openai-completions',
  'cloudflare-ai-gateway': 'openai-completions',
  'cloudflare-workers-ai': 'openai-completions',
  deepseek: 'openai-completions',
  fireworks: 'openai-completions',
  'github-copilot': 'openai-completions',
  google: 'google-generative-ai',
  'google-vertex': 'google-vertex',
  groq: 'openai-completions',
  huggingface: 'openai-completions',
  'kimi-coding': 'openai-completions',
  meta: 'openai-responses',
  minimax: 'anthropic-messages',
  'minimax-cn': 'anthropic-messages',
  mistral: 'mistral-conversations',
  moonshotai: 'openai-completions',
  'moonshotai-cn': 'openai-completions',
  nvidia: 'openai-completions',
  openai: 'openai-responses',
  'openai-codex': 'openai-codex-responses',
  opencode: 'openai-completions',
  'opencode-go': 'openai-completions',
  openrouter: 'openai-completions',
  pi: 'pi-messages',
  'qwen-token-plan': 'openai-completions',
  'qwen-token-plan-cn': 'openai-completions',
  'qwen-token-plan-individual': 'openai-completions',
  'qwen-token-plan-individual-cn': 'openai-completions',
  radius: 'pi-messages',
  together: 'openai-completions',
  'vercel-ai-gateway': 'openai-completions',
  xai: 'openai-responses',
  xiaomi: 'openai-completions',
  'xiaomi-token-plan-ams': 'openai-completions',
  'xiaomi-token-plan-cn': 'openai-completions',
  'xiaomi-token-plan-sgp': 'openai-completions',
  zai: 'openai-completions',
  'zai-coding-cn': 'openai-completions',
};

const API_BY_NPM: Record<string, KnownApi> = {
  '@ai-sdk/amazon-bedrock': 'bedrock-converse-stream',
  '@ai-sdk/anthropic': 'anthropic-messages',
  '@ai-sdk/azure': 'azure-openai-responses',
  '@ai-sdk/cerebras': 'openai-completions',
  '@ai-sdk/google': 'google-generative-ai',
  '@ai-sdk/google-vertex': 'google-vertex',
  '@ai-sdk/google-vertex/anthropic': 'anthropic-messages',
  '@ai-sdk/groq': 'openai-completions',
  '@ai-sdk/mistral': 'mistral-conversations',
  '@ai-sdk/openai': 'openai-responses',
  '@ai-sdk/openai-compatible': 'openai-completions',
  '@ai-sdk/togetherai': 'openai-completions',
  '@ai-sdk/xai': 'openai-responses',
  '@openrouter/ai-sdk-provider': 'openai-completions',
};

const BASE_URL_BY_PROVIDER_ID: Record<string, string> = {
  'amazon-bedrock': 'https://bedrock-runtime.us-east-1.amazonaws.com',
  'ant-ling': 'https://api.ant-ling.com/v1',
  anthropic: 'https://api.anthropic.com',
  baseten: 'https://inference.baseten.co/v1',
  cerebras: 'https://api.cerebras.ai/v1',
  deepseek: 'https://api.deepseek.com',
  fireworks: 'https://api.fireworks.ai/inference/v1',
  google: 'https://generativelanguage.googleapis.com/v1beta',
  'google-vertex': 'https://{location}-aiplatform.googleapis.com',
  groq: 'https://api.groq.com/openai/v1',
  huggingface: 'https://router.huggingface.co/v1',
  'kimi-coding': 'https://api.kimi.com/coding/v1',
  meta: 'https://api.meta.ai/v1',
  minimax: 'https://api.minimax.io/anthropic',
  'minimax-cn': 'https://api.minimaxi.com/anthropic',
  mistral: 'https://api.mistral.ai',
  'moonshotai-cn': 'https://api.moonshot.cn/v1',
  moonshotai: 'https://api.moonshot.ai/v1',
  nvidia: 'https://integrate.api.nvidia.com/v1',
  openai: 'https://api.openai.com/v1',
  'openai-codex': 'https://chatgpt.com/backend-api',
  opencode: 'https://opencode.ai/inference/openai/v1',
  'opencode-go': 'https://opencode.ai/inference/go/openai/v1',
  openrouter: 'https://openrouter.ai/api/v1',
  'qwen-token-plan': 'https://token-plan.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1',
  'qwen-token-plan-cn': 'https://token-plan.cn-beijing.maas.aliyuncs.com/compatible-mode/v1',
  'qwen-token-plan-individual': 'https://token-plan.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1',
  'qwen-token-plan-individual-cn': 'https://token-plan.cn-beijing.maas.aliyuncs.com/compatible-mode/v1',
  radius: 'https://radius.pi.dev/v1',
  together: 'https://api.together.ai/v1',
  'vercel-ai-gateway': 'https://ai-gateway.vercel.sh',
  xai: 'https://api.x.ai/v1',
  xiaomi: 'https://api.xiaomimimo.com/v1',
  'xiaomi-token-plan-ams': 'https://token-plan-ams.xiaomimimo.com/v1',
  'xiaomi-token-plan-cn': 'https://token-plan-cn.xiaomimimo.com/v1',
  'xiaomi-token-plan-sgp': 'https://token-plan-sgp.xiaomimimo.com/v1',
  'zai-coding-cn': 'https://open.bigmodel.cn/api/coding/paas/v4',
  zai: 'https://api.z.ai/api/paas/v4',
};

export function isKnownProviderApi(value: string): value is KnownApi {
  return PROVIDER_API_OPTIONS.some((option) => option.value === value);
}

export function getDefaultProviderApi(
  providerId: string,
  npm?: string,
): KnownApi {
  return API_BY_PROVIDER_ID[providerId.toLowerCase()] ??
    (npm ? API_BY_NPM[npm] : undefined) ??
    'openai-completions';
}

export function getProviderBaseUrl(provider?: {
  api?: string;
  id?: string;
}) {
  const api = provider?.api?.trim();

  if (api && /^https?:\/\//i.test(api)) {
    return api;
  }

  return provider?.id
    ? BASE_URL_BY_PROVIDER_ID[provider.id.toLowerCase()]
    : undefined;
}

export function normalizeBaseUrl(value: string) {
  const baseUrl = value.trim();

  if (!baseUrl) {
    return undefined;
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(baseUrl);
  } catch {
    throw new Error('Base URL 格式无效');
  }

  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    throw new Error('Base URL 仅支持 HTTP 或 HTTPS');
  }

  return baseUrl;
}

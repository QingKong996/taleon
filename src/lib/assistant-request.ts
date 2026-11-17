import {
  type Api,
  type AssistantMessage,
  type AssistantMessageEventStream,
  type KnownApi,
  type Model,
  type ProviderStreams,
} from '@earendil-works/pi-ai';
import { anthropicMessagesApi } from '@earendil-works/pi-ai/api/anthropic-messages.lazy';
import { azureOpenAIResponsesApi } from '@earendil-works/pi-ai/api/azure-openai-responses.lazy';
import { googleGenerativeAIApi } from '@earendil-works/pi-ai/api/google-generative-ai.lazy';
import { googleVertexApi } from '@earendil-works/pi-ai/api/google-vertex.lazy';
import { mistralConversationsApi } from '@earendil-works/pi-ai/api/mistral-conversations.lazy';
import { openAICodexResponsesApi } from '@earendil-works/pi-ai/api/openai-codex-responses.lazy';
import { openAICompletionsApi } from '@earendil-works/pi-ai/api/openai-completions.lazy';
import { openAIResponsesApi } from '@earendil-works/pi-ai/api/openai-responses.lazy';
import { piMessagesApi } from '@earendil-works/pi-ai/api/pi-messages.lazy';
import { normalizeContext } from '@earendil-works/pi-ai/utils/transcript';
import { fetch as expoFetch } from 'expo/fetch';

import { getProviderBaseUrl } from '@/lib/provider-api';
import type { ProviderConfig } from '@/lib/provider-config';

const DEFAULT_CONTEXT_WINDOW = 128_000;
const DEFAULT_MAX_TOKENS = 8_192;

type ApiFactory = () => ProviderStreams;

const API_FACTORIES: Record<
  Exclude<KnownApi, 'bedrock-converse-stream'>,
  ApiFactory
> = {
  'anthropic-messages': anthropicMessagesApi,
  'azure-openai-responses': azureOpenAIResponsesApi,
  'google-generative-ai': googleGenerativeAIApi,
  'google-vertex': googleVertexApi,
  'mistral-conversations': mistralConversationsApi,
  'openai-codex-responses': openAICodexResponsesApi,
  'openai-completions': openAICompletionsApi,
  'openai-responses': openAIResponsesApi,
  'pi-messages': piMessagesApi,
};

export type AssistantRequestOptions = {
  apiKey: string;
  config: ProviderConfig;
  input: string;
  modelId: string;
  signal?: AbortSignal;
  systemPrompt: string;
};

export type AssistantStreamOptions = AssistantRequestOptions & {
  onTextDelta?: (delta: string) => void;
};

export function getAssistantMessageText(message: AssistantMessage) {
  return message.content
    .reduce(
      (text, block) => (block.type === 'text' ? `${text}${block.text}` : text),
      '',
    )
    .trim();
}

function resolveBaseUrl(config: ProviderConfig) {
  const baseUrl =
    config.baseUrl?.trim() ||
    getProviderBaseUrl({ api: config.api, id: config.providerId });

  if (!baseUrl) {
    throw new Error('供应商缺少 Base URL');
  }

  return baseUrl;
}

function getApiFactory(api: KnownApi) {
  if (api === 'bedrock-converse-stream') {
    throw new Error('当前客户端不支持 Bedrock Converse');
  }

  return API_FACTORIES[api];
}

function createAssistantRequestStream({
  apiKey,
  config,
  input,
  modelId,
  signal,
  systemPrompt,
}: AssistantRequestOptions): AssistantMessageEventStream {
  const normalizedApiKey = apiKey.trim();
  const normalizedModelId = modelId.trim();
  const normalizedProviderId = config.providerId.trim();

  if (!normalizedApiKey) {
    throw new Error('请输入 API Key');
  }

  if (!normalizedModelId) {
    throw new Error('请选择模型');
  }

  if (!normalizedProviderId) {
    throw new Error('供应商 ID 不能为空');
  }

  if (!input.trim()) {
    throw new Error('请输入内容');
  }

  const baseUrl = resolveBaseUrl(config);
  const modelMetadata = config.models?.find(
    (model) => model.id === normalizedModelId,
  );
  const model: Model<Api> = {
    id: normalizedModelId,
    name: normalizedModelId,
    api: config.api,
    provider: normalizedProviderId,
    baseUrl,
    input: ['text'],
    cost: {
      input: 0,
      output: 0,
      cacheRead: 0,
      cacheWrite: 0,
    },
    reasoning: false,
    contextWindow: modelMetadata?.contextWindow ?? DEFAULT_CONTEXT_WINDOW,
    maxTokens: modelMetadata?.maxTokens ?? DEFAULT_MAX_TOKENS,
  };
  const context = normalizeContext({
    systemPrompt,
    messages: [
      {
        role: 'user',
        content: input,
        timestamp: Date.now(),
      },
    ],
  });
  const stream = getApiFactory(config.api)().streamSimple(model, context, {
    apiKey: normalizedApiKey,
    fetch: expoFetch,
    signal,
  });

  return stream;
}

export async function streamAssistantMessage({
  onTextDelta,
  ...options
}: AssistantStreamOptions): Promise<AssistantMessage> {
  const stream = createAssistantRequestStream(options);

  for await (const event of stream) {
    if (event.type === 'text_delta') {
      onTextDelta?.(event.delta);
    }
  }

  return stream.result();
}

export function requestAssistantMessage(options: AssistantRequestOptions) {
  return streamAssistantMessage(options);
}

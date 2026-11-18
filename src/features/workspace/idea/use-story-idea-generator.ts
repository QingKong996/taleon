import { useEffect, useRef, useState } from 'react';

import { findAvailableAssistantProvider } from '@/lib/assistant-provider';
import {
  getAssistantMessageText,
  streamAssistantMessage,
} from '@/lib/assistant-request';
import { useProviderSettings } from '@/providers/provider-settings';

const RANDOM_IDEA_SYSTEM_PROMPT = [
  '你是一名中文小说策划编辑。',
  '请生成一个适合继续扩写成短篇或长篇的原创故事想法。',
  '这是故事想法摘要，不是小说正文或全文。',
  '只输出一段连续中文文本，不要标题、列表、解释、引号或前后缀。',
  '内容必须包含人物、核心冲突、独特设定和一个明确的悬念。',
  '长度控制在 80 到 180 字。',
].join('');

const CONTINUE_IDEA_SYSTEM_PROMPT = [
  '你是一名中文小说策划编辑。',
  '请承接用户给出的故事想法继续续写。',
  '续写的仍然是故事想法摘要，不是小说正文或全文。',
  '每次只续写一小节情节，只推进一个场景或一个关键事件，不要展开完整章节或连续推进多个情节。',
  '只输出新增的续写内容，不要重复已有文字，不要标题、列表、解释、引号或前后缀。',
  '保持人物、设定和语气连续，用摘要方式推进核心冲突或加入新的悬念。',
].join('');

const GENRES = [
  '悬疑',
  '科幻',
  '奇幻',
  '都市',
  '历史',
  '青春',
  '冒险',
  '志怪',
] as const;

const TONES = [
  '冷峻压抑',
  '温柔怀旧',
  '神秘诡异',
  '明亮轻快',
  '荒诞幽默',
  '紧张克制',
] as const;

const SETTINGS = [
  '一座终年下雨的沿海小城',
  '一列没有终点站的夜班列车',
  '一座即将拆迁的老剧院',
  '一所建在废弃矿场上的寄宿学校',
  '一个只在午夜出现的旧货市场',
  '一座被森林包围的疗养院',
  '一艘漂流多年的远洋邮轮',
  '一条每逢大雾就会改道的公路',
] as const;

type StoryIdeaGenerationOptions = {
  idea: string;
  onIdeaChange?: (idea: string) => void;
};

function pickRandom<T>(values: readonly T[]) {
  return values[Math.floor(Math.random() * values.length)];
}

function createRandomIdeaPrompt() {
  return [
    `随机生成一个${pickRandom(GENRES)}故事想法。`,
    `整体氛围：${pickRandom(TONES)}。`,
    `主要场景：${pickRandom(SETTINGS)}。`,
    '避免常见套路，核心设定需要让人一眼记住。',
  ].join('\n');
}

export function useStoryIdeaGenerator() {
  const { configs, getProviderApiKey, isReady } = useProviderSettings();
  const [isGenerating, setIsGenerating] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      controllerRef.current?.abort();
    };
  }, []);

  async function generateStoryIdea({
    idea,
    onIdeaChange,
  }: StoryIdeaGenerationOptions) {
    if (controllerRef.current) {
      return null;
    }

    const shouldContinue = idea.trim().length > 0;
    const controller = new AbortController();
    controllerRef.current = controller;
    setIsGenerating(true);

    try {
      const { apiKey, config, modelId } = await findAvailableAssistantProvider(
        configs,
        getProviderApiKey,
      );
      let streamedIdea = shouldContinue ? idea : '';
      const message = await streamAssistantMessage({
        apiKey,
        config,
        modelId,
        signal: controller.signal,
        systemPrompt: shouldContinue
          ? CONTINUE_IDEA_SYSTEM_PROMPT
          : RANDOM_IDEA_SYSTEM_PROMPT,
        input: shouldContinue
          ? ['请续写以下故事想法，只输出新增内容：', '', idea].join('\n')
          : createRandomIdeaPrompt(),
        onTextDelta(delta) {
          streamedIdea = `${streamedIdea}${delta}`;

          if (isMountedRef.current) {
            onIdeaChange?.(streamedIdea);
          }
        },
      });

      if (message.stopReason === 'error') {
        throw new Error(message.errorMessage ?? 'AI 请求失败');
      }

      const text = getAssistantMessageText(message);

      if (!text) {
        throw new Error('AI 未返回故事想法');
      }

      return shouldContinue ? `${idea}${text}` : text;
    } catch (error) {
      if (controller.signal.aborted) {
        return null;
      }

      throw error;
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
      }

      if (isMountedRef.current) {
        setIsGenerating(false);
      }
    }
  }

  return {
    generateStoryIdea,
    isGenerating,
    isReady,
  };
}

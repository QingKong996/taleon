import { useState } from 'react';
import { Alert, Keyboard } from 'react-native';

import { useStoryIdeaGenerator } from '@/features/workspace/model/idea/use-story-idea-generator';

type UseIdeaStepOptions = {
  idea: string;
  onChangeIdea: (value: string) => void;
};

type PendingContinuation = {
  generatedIdea: string;
  originalIdea: string;
};

type IdeaPreview = {
  generatedIdea: string;
  originalIdea: string;
};

export function useIdeaStep({
  idea,
  onChangeIdea,
}: UseIdeaStepOptions) {
  const { generateStoryIdea, isGenerating, isReady } =
    useStoryIdeaGenerator();
  const [isEditing, setIsEditing] = useState(false);
  const [pendingContinuation, setPendingContinuation] =
    useState<PendingContinuation | null>(null);
  const [streamingPreview, setStreamingPreview] =
    useState<IdeaPreview | null>(null);
  const hasIdea = idea.trim().length > 0;
  const isAwaitingDecision = pendingContinuation !== null;
  const isLocked = isGenerating || isAwaitingDecision;
  const showEditor = isEditing && !isLocked;
  const canGenerate = hasIdea && !isGenerating && !isAwaitingDecision;
  const preview =
    streamingPreview ??
    (pendingContinuation
      ? {
          generatedIdea: pendingContinuation.generatedIdea,
          originalIdea: pendingContinuation.originalIdea,
        }
      : null);
  const addedIdea = preview
    ? preview.generatedIdea.slice(preview.originalIdea.length)
    : '';
  const displayedIdea = preview ? preview.originalIdea : idea;

  async function generateIdea() {
    const originalIdea = idea;
    const shouldContinue = hasIdea;

    setIsEditing(false);
    Keyboard.dismiss();

    if (shouldContinue) {
      setStreamingPreview({ generatedIdea: originalIdea, originalIdea });
    }

    try {
      const nextIdea = await generateStoryIdea({
        idea,
        onIdeaChange(value) {
          onChangeIdea(value);

          if (shouldContinue) {
            setStreamingPreview({
              generatedIdea: value,
              originalIdea,
            });
          }
        },
      });

      if (nextIdea) {
        onChangeIdea(nextIdea);
        setStreamingPreview(null);

        if (shouldContinue) {
          setPendingContinuation({
            generatedIdea: nextIdea,
            originalIdea,
          });
        }
      }
    } catch (error) {
      setStreamingPreview(null);
      Alert.alert(
        '无法生成故事想法',
        error instanceof Error ? error.message : '请稍后重试',
      );
    }
  }

  function keepContinuation() {
    if (!pendingContinuation) {
      return;
    }

    onChangeIdea(pendingContinuation.generatedIdea);
    setStreamingPreview(null);
    setPendingContinuation(null);
  }

  function discardContinuation() {
    if (!pendingContinuation) {
      return;
    }

    onChangeIdea(pendingContinuation.originalIdea);
    setStreamingPreview(null);
    setPendingContinuation(null);
  }

  return {
    addedIdea,
    canGenerate,
    discardContinuation,
    displayedIdea,
    generateIdea,
    hasIdea,
    isAwaitingDecision,
    isGenerating,
    isLocked,
    isReady,
    keepContinuation,
    setEditing: setIsEditing,
    showEditor,
  };
}

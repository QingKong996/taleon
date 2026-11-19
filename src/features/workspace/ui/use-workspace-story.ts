import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import {
  createStory,
  readLatestStoryDocument,
  readStoryDocument,
} from '@/features/stories/model/story-storage';
import type { StoryDocument } from '@/features/stories/model/story-types';

export function useWorkspaceStory(routeStoryId?: string) {
  const [story, setStory] = useState<StoryDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadStory = routeStoryId
      ? readStoryDocument(routeStoryId)
      : readLatestStoryDocument();

    loadStory
      .then((nextStory) => {
        if (!isActive) {
          return;
        }

        setStory(nextStory);
        setLoadError(
          routeStoryId && !nextStory
            ? '这个故事不存在或无法读取'
            : null,
        );
      })
      .catch(() => {
        if (isActive) {
          setStory(null);
          setLoadError('无法读取这个故事，请稍后重试');
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [routeStoryId]);

  async function createNewStory() {
    if (isCreating) {
      return;
    }

    setIsCreating(true);

    try {
      const nextStory = await createStory();
      setStory(nextStory);
      setLoadError(null);
    } catch {
      Alert.alert('无法创建故事', '请稍后重试');
    } finally {
      setIsCreating(false);
    }
  }

  return {
    createNewStory,
    isCreating,
    isLoading,
    loadError,
    story,
  };
}

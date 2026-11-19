import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Alert } from 'react-native';

import {
  createStory,
  readStorySummaries,
  renameStory,
} from '@/features/stories/model/story-storage';
import type { StorySummary } from '@/features/stories/model/story-types';

export function useStoriesScreen() {
  const [stories, setStories] = useState<StorySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingStory, setEditingStory] =
    useState<StorySummary | null>(null);
  const [isSavingName, setIsSavingName] = useState(false);
  const suppressedPressStoryIdRef = useRef<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      void readStorySummaries().then((nextStories) => {
        if (isActive) {
          setStories(nextStories);
          setIsLoading(false);
        }
      });

      return () => {
        isActive = false;
      };
    }, []),
  );

  function openStory(storyId: string) {
    if (suppressedPressStoryIdRef.current === storyId) {
      suppressedPressStoryIdRef.current = null;
      return;
    }

    router.navigate({
      params: { storyId },
      pathname: '/workspace',
    });
  }

  function openNameEditor(story: StorySummary) {
    suppressedPressStoryIdRef.current = story.id;
    setEditingStory(story);
  }

  function closeNameEditor() {
    if (!isSavingName) {
      suppressedPressStoryIdRef.current = null;
      setEditingStory(null);
    }
  }

  async function createNewStory() {
    if (isCreating) {
      return;
    }

    setIsCreating(true);

    try {
      const story = await createStory();
      openStory(story.id);
    } catch {
      Alert.alert('无法创建故事', '请稍后重试');
    } finally {
      setIsCreating(false);
    }
  }

  async function saveStoryName(title: string) {
    if (!editingStory || isSavingName) {
      return;
    }

    setIsSavingName(true);

    try {
      const nextStory = await renameStory(editingStory.id, title);

      if (!nextStory) {
        Alert.alert('无法保存名称', '这个故事不存在或无法读取。');
        return;
      }

      setStories((currentStories) =>
        currentStories
          .map((story) => (story.id === nextStory.id ? nextStory : story))
          .sort((left, right) => right.updatedAt - left.updatedAt),
      );
      suppressedPressStoryIdRef.current = null;
      setEditingStory(null);
    } catch {
      Alert.alert('无法保存名称', '请稍后重试');
    } finally {
      setIsSavingName(false);
    }
  }

  return {
    closeNameEditor,
    createNewStory,
    editingStory,
    isCreating,
    isLoading,
    isSavingName,
    openNameEditor,
    openStory,
    saveStoryName,
    stories,
  };
}

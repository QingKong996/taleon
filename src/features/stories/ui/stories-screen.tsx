import { router, useFocusEffect } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TabScrollView } from '@/components/tab-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { SectionHeader } from '@/components/ui/section-header';
import { PressableSurface, Surface } from '@/components/ui/surface';
import { Layout, Radius, Spacing } from '@/constants/theme';
import {
  createStory,
  readStorySummaries,
  renameStory,
  UNTITLED_STORY_TITLE,
  type StorySummary,
} from '@/features/stories/model/story-storage';
import { StoryNameEditorModal } from '@/features/stories/ui/story-name-editor-modal';
import { useTheme } from '@/hooks/use-theme';

const COVER_COLORS = [
  '#9B5D4B',
  '#456D8A',
  '#665386',
  '#50745D',
  '#8A6840',
] as const;

function getCoverColor(storyId: string) {
  const hash = [...storyId].reduce(
    (value, character) => value + character.charCodeAt(0),
    0,
  );

  return COVER_COLORS[hash % COVER_COLORS.length];
}

function getStoryMeta(story: StorySummary) {
  if (story.step === 2) {
    return `未完成 · 第 ${story.selectedChapter} 章`;
  }

  if (story.step === 1) {
    return `未完成 · ${story.outlineChapterCount} 章大纲`;
  }

  return '未完成 · 故事想法';
}

export function StoriesScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [stories, setStories] = useState<StorySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingStory, setEditingStory] = useState<StorySummary | null>(null);
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

  function openStoryNameEditor(story: StorySummary) {
    suppressedPressStoryIdRef.current = story.id;
    setEditingStory(story);
  }

  function closeStoryNameEditor() {
    if (!isSavingName) {
      suppressedPressStoryIdRef.current = null;
      setEditingStory(null);
    }
  }

  async function handleCreateStory() {
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

  async function handleSaveStoryName(title: string) {
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

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <TabScrollView contentContainerStyle={styles.listContent}>
        <ThemedText type="title">故事</ThemedText>

        <View style={styles.section}>
          <SectionHeader
            detail={isLoading ? undefined : `${stories.length} 个`}
            title="全部故事"
          />

          {isLoading ? (
            <Surface style={styles.stateCard}>
              <ActivityIndicator color={theme.accent} size="small" />
              <ThemedText type="small" themeColor="textSecondary">
                正在读取故事
              </ThemedText>
            </Surface>
          ) : stories.length === 0 ? (
            <Surface style={styles.stateCard}>
              <ThemedText type="smallBold">还没有故事</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                点击右下角按钮，从一个想法开始。
              </ThemedText>
            </Surface>
          ) : (
            <View style={styles.storyList}>
              {stories.map((story) => (
                <PressableSurface
                  accessibilityLabel={`继续${story.title}`}
                  accessibilityHint="点击继续创作，长按编辑故事名称"
                  accessibilityRole="button"
                  delayLongPress={450}
                  key={story.id}
                  onLongPress={() => openStoryNameEditor(story)}
                  onPress={() => openStory(story.id)}
                  radius={Radius.card}
                  style={styles.row}>
                  <View
                    style={[
                      styles.cover,
                      { backgroundColor: getCoverColor(story.id) },
                    ]}>
                    <ThemedText style={styles.coverMark}>
                      {story.title === UNTITLED_STORY_TITLE
                        ? '新'
                        : story.title.charAt(0)}
                    </ThemedText>
                  </View>

                  <View style={styles.copy}>
                    <ThemedText type="smallBold" numberOfLines={1}>
                      {story.title}
                    </ThemedText>
                    <ThemedText
                      type="small"
                      themeColor="textSecondary"
                      numberOfLines={1}>
                      {getStoryMeta(story)}
                    </ThemedText>
                  </View>

                  <SymbolView
                    name={{
                      android: 'chevron_right',
                      ios: 'chevron.right',
                    }}
                    size={16}
                    tintColor={theme.textSecondary}
                  />
                </PressableSurface>
              ))}
            </View>
          )}
        </View>
      </TabScrollView>

      <Pressable
        accessibilityLabel="创建故事"
        accessibilityRole="button"
        accessibilityState={{ busy: isCreating, disabled: isCreating }}
        disabled={isCreating}
        onPress={() => {
          void handleCreateStory();
        }}
        style={({ pressed }) => [
          styles.createButton,
          {
            backgroundColor: theme.accent,
            bottom: insets.bottom + Spacing.four,
          },
          pressed && styles.pressed,
          isCreating && styles.disabled,
        ]}>
        {isCreating ? (
          <ActivityIndicator color={theme.background} size="small" />
        ) : (
          <SymbolView
            name={{ android: 'add', ios: 'plus' }}
            size={18}
            tintColor={theme.background}
          />
        )}
        <ThemedText
          type="smallBold"
          style={[styles.createLabel, { color: theme.background }]}>
          创建故事
        </ThemedText>
      </Pressable>

      <StoryNameEditorModal
        isSaving={isSavingName}
        onClose={closeStoryNameEditor}
        onSave={(title) => {
          void handleSaveStoryName(title);
        }}
        story={editingStory}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 144,
  },
  section: {
    gap: 8,
  },
  storyList: {
    gap: 8,
  },
  stateCard: {
    minHeight: 128,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  row: {
    padding: 8,
    paddingRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cover: {
    width: 42,
    height: 56,
    borderRadius: Radius.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverMark: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 22,
    fontWeight: 600,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  createButton: {
    position: 'absolute',
    right: Layout.screenPadding,
    minHeight: 48,
    borderRadius: Radius.pill,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { height: 6, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  createLabel: {
    fontSize: 14,
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.62,
  },
  disabled: {
    opacity: 0.72,
  },
});

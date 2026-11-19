import { StyleSheet, View } from 'react-native';

import { TabScrollView } from '@/components/tab-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { SectionHeader } from '@/components/ui/section-header';
import { CreateStoryButton } from '@/features/stories/ui/create-story-button';
import { StoryListItem } from '@/features/stories/ui/story-list-item';
import { StoryListPlaceholder } from '@/features/stories/ui/story-list-placeholder';
import { StoryNameEditorModal } from '@/features/stories/ui/story-name-editor-modal';
import { useStoriesScreen } from '@/features/stories/ui/use-stories-screen';
import { useTheme } from '@/hooks/use-theme';

export function StoriesScreen() {
  const theme = useTheme();
  const screen = useStoriesScreen();

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <TabScrollView contentContainerStyle={styles.listContent}>
        <ThemedText type="title">故事</ThemedText>

        <View style={styles.section}>
          <SectionHeader
            detail={
              screen.isLoading
                ? undefined
                : `${screen.stories.length} 个`
            }
            title="全部故事"
          />

          {screen.isLoading ? (
            <StoryListPlaceholder loading />
          ) : screen.stories.length === 0 ? (
            <StoryListPlaceholder loading={false} />
          ) : (
            <View style={styles.storyList}>
              {screen.stories.map((story) => (
                <StoryListItem
                  key={story.id}
                  onLongPress={() => screen.openNameEditor(story)}
                  onPress={() => screen.openStory(story.id)}
                  story={story}
                />
              ))}
            </View>
          )}
        </View>
      </TabScrollView>

      <CreateStoryButton
        creating={screen.isCreating}
        onCreate={() => {
          void screen.createNewStory();
        }}
      />

      <StoryNameEditorModal
        isSaving={screen.isSavingName}
        onClose={screen.closeNameEditor}
        onSave={(title) => {
          void screen.saveStoryName(title);
        }}
        story={screen.editingStory}
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
});

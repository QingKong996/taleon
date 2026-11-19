import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/form';
import { Layout, Radius } from '@/constants/theme';
import {
  MAX_STORY_TITLE_LENGTH,
  normalizeStoryTitle,
  type StorySummary,
} from '@/features/stories/model/story-storage';
import { useTheme } from '@/hooks/use-theme';

type StoryNameEditorModalProps = {
  isSaving: boolean;
  onClose: () => void;
  onSave: (title: string) => void;
  story: StorySummary | null;
};

export function StoryNameEditorModal({
  isSaving,
  onClose,
  onSave,
  story,
}: StoryNameEditorModalProps) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={() => {
        if (!isSaving) {
          onClose();
        }
      }}
      transparent
      visible={story !== null}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalRoot}>
        <Pressable
          accessibilityLabel="关闭故事名称编辑"
          accessibilityRole="button"
          disabled={isSaving}
          onPress={onClose}
          style={styles.modalBackdrop}
        />

        {story ? (
          <StoryNameEditorSheet
            isSaving={isSaving}
            key={story.id}
            onClose={onClose}
            onSave={onSave}
            story={story}
          />
        ) : null}
      </KeyboardAvoidingView>
    </Modal>
  );
}

type StoryNameEditorSheetProps = {
  isSaving: boolean;
  onClose: () => void;
  onSave: (title: string) => void;
  story: StorySummary;
};

function StoryNameEditorSheet({
  isSaving,
  onClose,
  onSave,
  story,
}: StoryNameEditorSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState(story.title);
  const normalizedTitle = normalizeStoryTitle(title);
  const canSave =
    normalizedTitle.length > 0 &&
    normalizedTitle !== story.title &&
    !isSaving;

  function handleSave() {
    if (canSave) {
      onSave(normalizedTitle);
    }
  }

  return (
    <View
      style={[
        styles.modalSheet,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: theme.backgroundSelected,
          paddingBottom: insets.bottom + 16,
        },
      ]}>
      <View style={styles.modalHeader}>
        <View style={styles.modalHeading}>
          <ThemedText type="smallBold" style={styles.modalTitle}>
            编辑故事名称
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            长按故事可再次修改
          </ThemedText>
        </View>
        <View style={styles.modalHeaderActions}>
          <Button
            disabled={isSaving}
            label="取消"
            onPress={onClose}
            size="compact"
            variant="secondary"
          />
          <Button
            disabled={!canSave}
            label="保存"
            loading={isSaving}
            onPress={handleSave}
            size="compact"
            variant="primary"
          />
        </View>
      </View>

      <TextField
        accessibilityLabel="故事名称"
        autoFocus
        maxLength={MAX_STORY_TITLE_LENGTH}
        onChangeText={setTitle}
        onSubmitEditing={handleSave}
        placeholder="输入故事名称"
        returnKeyType="done"
        selectTextOnFocus
        value={title}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalSheet: {
    width: '92%',
    maxWidth: 560,
    alignSelf: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.sheet,
    paddingHorizontal: Layout.formPadding,
    paddingTop: Layout.formPadding,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalHeading: {
    flex: 1,
    gap: 2,
  },
  modalTitle: {
    fontSize: 17,
    lineHeight: 22,
  },
  modalHeaderActions: {
    flexDirection: 'row',
    gap: 8,
  },
});
